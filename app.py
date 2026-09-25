import os
import time
from flask import Flask, render_template, send_from_directory
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

MUSIC_DIR = '/app/music'
COVERS_DIR = '/app/covers'

# Функция для безопасного подключения к базе данных с повторными попытками
def get_db_connection():
    retries = 5
    while retries > 0:
        try:
            # Магия Docker: в качестве host мы указываем имя сервиса 'db' из docker-compose.yml
            conn = psycopg2.connect(
                host='db',
                user='uropbrako',
                password='my_super_secret_password',
                database='soundcloud_metadata',
                cursor_factory=RealDictCursor
            )
            return conn
        except psycopg2.OperationalError:
            # Если база еще запускается, ждем 2 секунды и пробуем снова
            retries -= 1
            print("База данных еще не готова, ждем...")
            time.sleep(2)
    raise Exception("Не удалось подключиться к базе данных PostgreSQL")

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    # Создаем таблицу для треков, если её не существует
    cur.execute('''
        CREATE TABLE IF NOT EXISTS tracks (
            id SERIAL PRIMARY KEY,
            album_name VARCHAR(255),
            track_name VARCHAR(255),
            audio_path VARCHAR(512),
            cover_path VARCHAR(512)
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
    
    # Очищаем старый кэш для чистоты эксперимента
    cur.execute('DELETE FROM tracks;')
    
    # Сканируем файловую систему
    for album in os.listdir(MUSIC_DIR):
        album_path = os.path.join(MUSIC_DIR, album)
        if os.path.isdir(album_path):
            for file in os.listdir(album_path):
                if file.endswith('.mp3'):
                    track_name = os.path.splitext(file)[0]
                    audio_path = f"/music/{album}/{file}"
                    
                    # Ищем обложку с таким же именем (png или jpg)
                    cover_file = f"{track_name}.png"
                    cover_abs_path = os.path.join(COVERS_DIR, album, cover_file)
                    if not os.path.exists(cover_abs_path):
                        cover_file = f"{track_name}.jpg"
                    
                    cover_path = f"/covers/{album}/{cover_file}"
                    
                    # Сохраняем метаданные в PostgreSQL
                    cur.execute('''
                        INSERT INTO tracks (album_name, track_name, audio_path, cover_path)
                        VALUES (%s, %s, %s, %s);
                    ''', (album, track_name, audio_path, cover_path))
                    
    conn.commit()
    cur.close()
    conn.close()

@app.route('/')
def index():
    # Забираем плейлисты мгновенно из базы данных PostgreSQL!
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT album_name, track_name, audio_path, cover_path FROM tracks;')
    all_tracks = cur.fetchall()
    cur.close()
    conn.close()
    
    # Группируем треки по альбомам для вывода на веб-страницу
    playlists = {}
    for track in all_tracks:
        album = track['album_name']
        playlists.setdefault(album, []).append({
            'title': track['track_name'],
            'music_url': track['audio_path'],  # Точно как в HTML!
            'cover_url': track['cover_path']   # Точно как в HTML!
        })
   
    return render_template('index.html', playlists=playlists)

@app.route('/music/<path:filename>')
def serve_music(filename):
    return send_from_directory(MUSIC_DIR, filename)

@app.route('/covers/<path:filename>')
def serve_covers(filename):
    return send_from_directory(COVERS_DIR, filename)

if __name__ == '__main__':
    init_db()
    scan_and_cache_media()
    app.run(host='0.0.0.0', port=5000)

