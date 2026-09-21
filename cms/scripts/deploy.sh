#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."
mkdir -p "$HOME/tmp"
TMPDIR="$HOME/tmp" firebase deploy \
  --only apphosting:cms \
  --project=studio-tarekatoui-cms
