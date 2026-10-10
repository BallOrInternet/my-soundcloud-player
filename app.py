import os
import time
import urllib.parse  
from flask import Flask, render_template, send_from_directory, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

MUSIC_DIR = '/app/music'
COVERS_DIR = '/app/covers'

def get_db_connection():
    retries = 5
    while retries > 0:
        try:
            conn = psycopg2.connect(
                host='soundcloud-db',
                user='postgres',
                password='my_super_secret_password',
                database='soundcloud_metadata',
                cursor_factory=RealDictCursor
            )
            return conn
        except psycopg2.OperationalError:
            retries -= 1
            print("База данных еще не готова, ждем...")
            time.sleep(2)
    raise Exception("Не удалось подключиться к базе данных PostgreSQL")

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS tracks (
            id SERIAL PRIMARY KEY,
            album_name VARCHAR(255),
            track_name VARCHAR(255),
            audio_path VARCHAR(512),
            cover_path VARCHAR(512),
            last_position NUMERIC DEFAULT 0.0,
            is_last_played BOOLEAN DEFAULT FALSE
        );
    ''')
    conn.commit()
    cur.close()
    conn.close()

def scan_and_cache_media():
    """Сканирует папки и обновляет данные в базе данных"""
    if not os.path.exists(MUSIC_DIR):
        return

    conn = get_db_connection()
    cur = conn.cursor()
    
    for album in os.listdir(MUSIC_DIR):
        album_path = os.path.join(MUSIC_DIR, album)
        if os.path.isdir(album_path):
            for file in os.listdir(album_path):
                if file.endswith('.mp3'):
                    track_name = os.path.splitext(file)[0]
                    audio_path = f"/music/{album}/{file}"
                    
                    cover_file = f"{track_name}.png"
                    cover_abs_path = os.path.join(COVERS_DIR, album, cover_file)
                    if not os.path.exists(cover_abs_path):
                        cover_file = f"{track_name}.jpg"
                    
                    cover_path = f"/covers/{album}/{cover_file}"
                    
                    cur.execute('SELECT id FROM tracks WHERE audio_path = %s;', (audio_path,))
                    existing_track = cur.fetchone()
                    
                    if not existing_track:
                        cur.execute('''
                            INSERT INTO tracks (album_name, track_name, audio_path, cover_path, last_position, is_last_played)
                            VALUES (%s, %s, %s, %s, 0.0, FALSE);
                        ''', (album, track_name, audio_path, cover_path))

    conn.commit()
    cur.close()
    conn.close()

@app.route('/')
def index():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT album_name, track_name, audio_path, cover_path, last_position, is_last_played FROM tracks;')
    all_tracks = cur.fetchall()
    cur.close()
    conn.close()
    
    playlists = {}
    for track in all_tracks:
        album = track['album_name']
        playlists.setdefault(album, []).append({
            'title': track['track_name'],
            'music_url': track['audio_path'],
            'cover_url': track['cover_path'],
            'is_last_played': track['is_last_played']
        })
   
    print(f"=== ОТПРАВЛЯЕМ В HTML: {playlists} ===", flush=True)
    return render_template('index.html', playlists=playlists)

@app.route('/music/<path:filename>')
def serve_music(filename):
    return send_from_directory(MUSIC_DIR, filename)

@app.route('/covers/<path:filename>')
def serve_covers(filename):
    return send_from_directory(COVERS_DIR, filename)

@app.route('/api/save_progress', methods=['POST'])
def save_progress():
    data = request.json
    audio_path = data.get('audio_path')
    position = data.get('position', 0.0)

    audio_path = urllib.parse.unquote(audio_path)

    print(f"=== БРАУЗЕР ПРИСЛАЛ: {audio_path} ===", flush=True)

    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('UPDATE tracks SET is_last_played = FALSE;')
    cur.execute('''
        UPDATE tracks 
        SET last_position = %s, is_last_played = TRUE 
        WHERE audio_path = %s;
    ''', (position, audio_path))
    
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    init_db()
    scan_and_cache_media()
    app.run(host='0.0.0.0', port=5000)
