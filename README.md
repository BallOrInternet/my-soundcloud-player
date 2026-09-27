# 🎧 My SoundCloud Player (Multi-Container Production Setup)
<img width="2509" height="1208" alt="image" src="https://github.com/user-attachments/assets/bc6ade11-6274-4ceb-bc6d-a1ad093341dd" />

A production-ready Python Flask media player application utilizing a multi-container architecture orchestrated via Docker Compose.

## 🏗️ Architecture Blueprint
- **Frontend/Backend:** Python 3.11 (Flask) web application container.
- **Database:** PostgreSQL 15 (Alpine-based) container for high-speed metadata caching.
- **Network:** Isolated virtual network bridging application and database together.

## 📂 Required Media Structure

Local media directories must follow a strict layout before mounting so the backend can pair audio files with artwork:

your-local-media-folder/
├── music/
│   └── [Album_Name]/               <-- Playlist title on the site
│       ├── track1.mp3              <-- Song title (without extension)
│       └── track2.mp3
└── covers/
    └── [Album_Name]/               <-- MUST match folder name in music/
        ├── track1.png (or .jpg)    <-- MUST match .mp3 filename
        └── track2.png (or .jpg)

## 🚀 How to Run Anywhere (Linux, Windows, Mac)

Using **Docker Compose**, the environment setup is identical for **Linux, Windows, and macOS**:

### 1. Clone this repository
```bash
git clone https://github.com
cd my-soundcloud-player
```

### 2. Launch the Ecosystem (App + Database)
```bash
docker compose up -d --build
```
Open your browser at: **http://localhost:5000**

## 📊 Management Commands
- **Check container ecosystem status:** `docker compose ps`
- **View application logs:** `docker compose logs sound_player`
- **View database logs:** `docker compose logs db`
- **Stop and remove containers smoothly:** `docker compose down`

