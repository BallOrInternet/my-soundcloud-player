from pathlib import Path

from flask import Flask, render_template, send_from_directory, url_for

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
MUSIC_DIR = BASE_DIR / "music"
COVERS_DIR = BASE_DIR / "covers"

AUDIO_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".ogg",
    ".flac",
    ".m4a",
    ".aac",
    ".opus",
}

COVER_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


def find_cover(playlist, song_stem):
    cover_folder = COVERS_DIR / playlist

    if not cover_folder.exists():
        return None

    for extension in COVER_EXTENSIONS:
        cover = cover_folder / f"{song_stem}{extension}"

        if cover.exists():
            return cover.name

    return None


@app.route("/")
def index():
    playlists = {}

    for playlist_folder in sorted(MUSIC_DIR.iterdir()):

        if not playlist_folder.is_dir():
            continue

        playlist_name = playlist_folder.name

        songs = []

        for file in sorted(playlist_folder.iterdir()):

            if not file.is_file():
                continue

            if file.suffix.lower() not in AUDIO_EXTENSIONS:
                continue

            cover = find_cover(
                playlist_name,
                file.stem
            )

            songs.append({
                "title": file.stem,
                "filename": file.name,

                "music_url": url_for(
                    "music_file",
                    playlist=playlist_name,
                    filename=file.name
                ),

                "cover_url": (
                    url_for(
                        "cover_file",
                        playlist=playlist_name,
                        filename=cover
                    )
                    if cover
                    else None
                ),
            })

        playlists[playlist_name] = songs

    return render_template(
        "index.html",
        playlists=playlists
    )


@app.route("/music/<playlist>/<path:filename>")
def music_file(playlist, filename):
    return send_from_directory(
        MUSIC_DIR / playlist,
        filename
    )


@app.route("/covers/<playlist>/<path:filename>")
def cover_file(playlist, filename):
    return send_from_directory(
        COVERS_DIR / playlist,
        filename
    )


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
