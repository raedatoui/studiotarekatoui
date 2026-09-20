#!/usr/bin/env python3
"""Stage linked project images and Dropbox videos; keep originals in ~/tmp."""

import argparse
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
VIDEO_EXTENSIONS = {'.mp4', '.mov', '.m4v', '.webm', '.ogv', '.avi', '.mkv'}


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


def stage_video(original, name, project_id, force=False):
    digest = hashlib.sha256()
    with original.open('rb') as source:
        for chunk in iter(lambda: source.read(8 * 1024 * 1024), b''):
            digest.update(chunk)
    stem = re.sub(r'[^a-z0-9]+', '-', Path(name).stem.lower()).strip('-')[:70] or 'video'
    basename = f'{stem}-{digest.hexdigest()[:12]}'
    relative = Path('media/projects') / project_id / f'{basename}-web.mp4'
    target = ROOT / 'public' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if force or not target.exists():
        command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', str(original),
                   '-map', '0:v:0', '-map', '0:a:0?',
                   '-vf', "scale=w='min(1920,iw)':h='min(1080,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
                   '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-maxrate', '3M', '-bufsize', '6M', '-pix_fmt', 'yuv420p',
                   '-c:a', 'aac', '-b:a', '192k']
        partial = target.with_suffix('.partial.mp4')
        print(f'  Preparing MP4: {name}', flush=True)
        subprocess.run(command + ['-movflags', '+faststart', str(partial)], check=True)
        partial.replace(target)

    # Keep the previously staged source files out of the static export.
    previous = target.parent / f'{basename}{Path(name).suffix.lower()}'
    if previous.exists():
        archived = CACHE / 'originals' / project_id / previous.name
        archived.parent.mkdir(parents=True, exist_ok=True)
        previous.replace(archived)
    print(f'  Video: {name} ({target.stat().st_size / 1024 / 1024:.1f} MiB)', flush=True)
    return {'src': '/' + relative.as_posix(), 'name': Path(name).stem}


def import_source(url, project_id, media_type):
    extensions = VIDEO_EXTENSIONS if media_type == 'video' else IMAGE_EXTENSIONS
    stage = stage_video if media_type == 'video' else stage_image
    cache = CACHE / hashlib.sha256(url.encode()).hexdigest()[:16]
    cache.mkdir(parents=True, exist_ok=True)
    download = cache / 'original'
    if not download.exists():
        request = urllib.request.Request(download_url(url), headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=60) as response:
            if 'text/html' in response.headers.get('Content-Type', ''):
                raise ValueError('Source returned an HTML page instead of media')
            partial = cache / 'download.partial'
            with partial.open('wb') as output:
                shutil.copyfileobj(response, output)
            partial.replace(download)

    assets = []
    if zipfile.is_zipfile(download):
        with zipfile.ZipFile(download) as archive:
            for index, member in enumerate(sorted(archive.infolist(), key=lambda entry: entry.filename)):
                name = Path(member.filename)
                if member.is_dir() or name.suffix.lower() not in extensions:
                    continue
                if '__MACOSX' in name.parts or name.name.startswith('.'):
                    continue
                original = cache / f'{index}{name.suffix.lower()}'
                with archive.open(member) as source, original.open('wb') as output:
                    shutil.copyfileobj(source, output)
                assets.append(stage(original, name.name, project_id))
    else:
        name = unquote(Path(urlsplit(url).path).name)
        if Path(name).suffix.lower() not in extensions:
            raise ValueError(f'Unsupported {media_type} file: {name}')
        assets.append(stage(download, name, project_id))
    if not assets:
        raise ValueError(f'Source contained no supported {media_type} files')
    return assets


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--videos-only', action='store_true', help='Import only Dropbox videos')
    args = parser.parse_args()
    projects = json.loads((ROOT / 'src/data/old/projects.json').read_text())
    assets = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    failures = []
    for project in projects:
        for media in project.get('media', []):
            url = media['url']
            media_type = media['type']
            if media_type == 'video' and url.startswith('/media/projects/'):
                url = next((source for source, items in assets.items() if any(item['src'] == url for item in items)), url)
            if media_type not in {'image', 'video'} or not url.startswith(('https://', 'http://')):
                continue
            if args.videos_only and media_type != 'video':
                continue
            if media_type == 'video' and urlsplit(url).hostname not in {'www.dropbox.com', 'dropbox.com'}:
                continue
            if url in assets and all(
                (ROOT / 'public' / item['src'].lstrip('/')).exists()
                and (media_type != 'video' or item['src'].endswith('-web.mp4'))
                for item in assets[url]
            ):
                continue
            print(f"Importing {project['id']}…", flush=True)
            try:
                assets[url] = import_source(url, project['id'], media_type)
                MANIFEST.write_text(json.dumps(assets, ensure_ascii=False, indent=4) + '\n')
                print(f"  Staged {len(assets[url])} {media_type} files", flush=True)
            except Exception as error:
                failures.append((project['id'], str(error)))
                print(f'  Could not import: {error}', flush=True)
    print(f'Staged {sum(map(len, assets.values()))} media files from {len(assets)} sources.', flush=True)
    for project_id, error in failures:
        print(f'Unresolved: {project_id}: {error}', flush=True)
    return bool(failures)


if __name__ == '__main__':
    raise SystemExit(main())
