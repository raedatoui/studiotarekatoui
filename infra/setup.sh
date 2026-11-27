#!/usr/bin/env bash
# Creates the Cloud Build publishing resources for the website. Safe to re-run; see infra/README.md.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"

# Reads KEY=value from an env file without executing the file.
env_value() {
    local value
    value="$(grep -E "^$2=" "$1" 2>/dev/null | tail -n 1 | cut -d= -f2- || true)"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    if [ -z "$value" ]; then
        echo "Set $2 in ${1#"$root/"} first." >&2
        return 1
    fi
    printf '%s' "$value"
}

project="$(env_value "$root/.env" FIREBASE_PROJECT_ID)"
region="$(env_value "$root/.env" PUBLISH_REGION)"
bucket="$(env_value "$root/.env" PUBLISH_BUCKET)"
bucket="${bucket%/}"
emails_ref="$(env_value "$root/.env" CMS_ALLOWED_EMAILS_REF)"
emails_secret="${emails_ref%%@*}"

account="website-build@$project.iam.gserviceaccount.com"
env_secret=website-build-env
connection=github
remote="$(git -C "$root" remote get-url origin | sed -E 's#^git@github\.com:#https://github.com/#')"
repository="$(basename "$remote" .git)"

gc() { gcloud "$@" --project "$project"; }
exists() { gc "$@" >/dev/null 2>&1; }

echo "Project $project, region $region, bucket $bucket, repository $remote"

exists storage buckets describe "$bucket" ||
    gc storage buckets create "$bucket" --location "$region" --uniform-bucket-level-access --public-access-prevention

exists iam service-accounts describe "$account" ||
    gc iam service-accounts create website-build --display-name 'Website Cloud Build'

# Seeded once from the local environment files; afterwards Secret Manager is the only source.
if ! exists secrets describe "$env_secret"; then
    build_env=''
    for key in FIREBASE_HOSTING_SITE_STAGING FIREBASE_HOSTING_SITE_PROD CMS_AUTH_URL; do
        value="$(env_value "$root/.env" "$key")"
        build_env+="$key=$value"$'\n'
    done
    for key in NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_MEDIA_BASE_URL NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
        NEXT_PUBLIC_FIREBASE_PROJECT_ID NEXT_PUBLIC_FIREBASE_APP_ID; do
        value="$(env_value "$root/website/.env" "$key")"
        build_env+="$key=$value"$'\n'
    done
    printf '%s' "$build_env" | gc secrets create "$env_secret" --replication-policy automatic --data-file=-
fi

member="serviceAccount:$account"
for role in roles/firebasehosting.admin roles/logging.logWriter; do
    gc projects add-iam-policy-binding "$project" --member "$member" --role "$role" --condition None >/dev/null
done
gc storage buckets add-iam-policy-binding "$bucket" --member "$member" --role roles/storage.objectViewer >/dev/null
for secret in "$env_secret" "$emails_secret"; do
    gc secrets add-iam-policy-binding "$secret" --member "$member" --role roles/secretmanager.secretAccessor >/dev/null
done

# The CMS publishes as its App Hosting runtime identity: it writes and reads snapshots and starts the two triggers.
cms_member="serviceAccount:firebase-app-hosting-compute@$project.iam.gserviceaccount.com"
gc projects add-iam-policy-binding "$project" --member "$cms_member" --role roles/cloudbuild.builds.editor --condition None >/dev/null
gc iam service-accounts add-iam-policy-binding "$account" --member "$cms_member" --role roles/iam.serviceAccountUser >/dev/null
for role in roles/storage.objectCreator roles/storage.objectViewer; do
    gc storage buckets add-iam-policy-binding "$bucket" --member "$cms_member" --role "$role" >/dev/null
done

stage() {
    gc builds connections describe "$connection" --region "$region" --format 'value(installationState.stage)' 2>/dev/null || true
}
[ -n "$(stage)" ] || gc builds connections create github "$connection" --region "$region"
if [ "$(stage)" != COMPLETE ]; then
    echo 'Finish this GitHub step in a browser, then run the script again:'
    gc builds connections describe "$connection" --region "$region" --format 'value(installationState.message,installationState.actionUri)'
    exit 0
fi

exists builds repositories describe "$repository" --connection "$connection" --region "$region" ||
    gc builds repositories create "$repository" --remote-uri "$remote" --connection "$connection" --region "$region"

for target in staging prod; do
    exists builds triggers describe "website-$target" --region "$region" ||
        gc builds triggers create manual --name "website-$target" --region "$region" \
            --repository "projects/$project/locations/$region/connections/$connection/repositories/$repository" \
            --branch main --build-config infra/cloudbuild/website.yaml \
            --service-account "projects/$project/serviceAccounts/$account" \
            --substitutions "_TARGET=$target,_ALLOWED_EMAILS_SECRET=$emails_secret"
done

echo 'Ready. Publish with: pnpm publish:web:staging'
