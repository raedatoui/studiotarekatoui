#!/usr/bin/env python3
"""Stage linked project images in public/media/projects; keep originals in ~/tmp."""

import hashlib
import json
import re
import shutil
import subprocess
import urllib.request
import zipfile
from pathlib import Path
from urllib.parse import parse_qsl, unquote, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parent.parent
CACHE = Path.home() / 'tmp' / 'tarek-project-media'
MANIFEST = ROOT / 'src/data/media-assets.json'
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.tif', '.tiff'}


def download_url(url):
    parts = urlsplit(url)
    if parts.hostname in ('www.dropbox.com', 'dropbox.com'):
        query = dict(parse_qsl(parts.query))
        query.pop('raw', None)
        query['dl'] = '1'
        return urlunsplit(parts._replace(query=urlencode(query)))
    return url


def stage_image(original, name, project_id):
    digest = hashlib.sha256(original.read_bytes()).hexdigest()[:12]
    stem = re.sub(r'[^a-z0-9]+', '-', Path(name).stem.lower()).strip('-')[:70] or 'image'
    suffix = Path(name).suffix.lower()
    suffix = suffix if suffix in {'.png', '.webp', '.gif', '.avif'} else '.jpg'
    relative = Path('media/projects') / project_id / f'{stem}-{digest}{suffix}'
    target = ROOT / 'public' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        if suffix in {'.gif', '.avif', '.webp'}:
            shutil.copyfile(original, target)
        else:
            command = ['sips', '-Z', '2000', '-s', 'format', 'png' if suffix == '.png' else 'jpeg']
            if suffix == '.jpg':
                command += ['-s', 'formatOptions', '82']
            subprocess.run(command + [str(original), '--out', str(target)], check=True, capture_output=True)
    return {'src': '/' + relative.as_posix(), 'name': Path(name).stem}


def import_source(url, project_id):
    cache = CACHE / hashlib.sha256(url.encode()).hexdigest()[:16]
    cache.mkdir(parents=True, exist_ok=True)
    download = cache / 'original'
    if not download.exists():
        request = urllib.request.Request(download_url(url), headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=60) as response:
            if 'text/html' in response.headers.get('Content-Type', ''):
                raise ValueError('Source returned an HTML page instead of images')
            partial = cache / 'download.partial'
            with partial.open('wb') as output:
                shutil.copyfileobj(response, output)
            partial.replace(download)

    assets = []
    if zipfile.is_zipfile(download):
        with zipfile.ZipFile(download) as archive:
            for index, member in enumerate(sorted(archive.infolist(), key=lambda entry: entry.filename)):
                name = Path(member.filename)
                if member.is_dir() or name.suffix.lower() not in IMAGE_EXTENSIONS:
                    continue
                if '__MACOSX' in name.parts or name.name.startswith('.'):
                    continue
                original = cache / f'{index}{name.suffix.lower()}'
                with archive.open(member) as source, original.open('wb') as output:
                    shutil.copyfileobj(source, output)
                assets.append(stage_image(original, name.name, project_id))
    else:
        name = unquote(Path(urlsplit(url).path).name)
        assets.append(stage_image(download, name, project_id))
    if not assets:
        raise ValueError('Source contained no supported images')
    return assets


def main():
    projects = json.loads((ROOT / 'src/data/projects.json').read_text())['projects']
    assets = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    failures = []
    for project in projects:
        for media in project.get('media', []):
            url = media['url']
            if media['type'] != 'image' or not url.startswith(('https://', 'http://')):
                continue
            if url in assets and all((ROOT / 'public' / item['src'].lstrip('/')).exists() for item in assets[url]):
                continue
            print(f"Importing {project['id']}…", flush=True)
            try:
                assets[url] = import_source(url, project['id'])
                MANIFEST.write_text(json.dumps(assets, ensure_ascii=False, indent=4) + '\n')
                print(f"  Staged {len(assets[url])} images", flush=True)
            except Exception as error:
                failures.append((project['id'], str(error)))
                print(f'  Could not import: {error}', flush=True)
    print(f'Staged {sum(map(len, assets.values()))} images from {len(assets)} sources.', flush=True)
    for project_id, error in failures:
        print(f'Unresolved: {project_id}: {error}', flush=True)
    return bool(failures)


if __name__ == '__main__':
    raise SystemExit(main())
