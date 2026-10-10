#  My SoundCloud Player (Multi-Container Production Setup)
<img width="2509" height="1208" alt="image" src="https://github.com/user-attachments/assets/bc6ade11-6274-4ceb-bc6d-a1ad093341dd" />

A production-ready Python Flask media player application utilizing a multi-container architecture orchestrated via Docker Compose.

##  Architecture Blueprint
- **Frontend/Backend:** Python 3.11 (Flask, alpine-based) web application container.
- **Database:** PostgreSQL 15 (Alpine-based) container for high-speed metadata caching.
- **Network:** Isolated virtual network bridging application and database together.

##  Required Media Structure

Local media directories must follow a strict layout before mounting so the backend can pair audio files with artwork:

your-local-media-folder/
```
├── music/
│   └── [Album_Name]/               <-- Playlist title on the site
│       ├── track1.mp3              <-- Song title (without extension)
│       └── track2.mp3
└── covers/
    └── [Album_Name]/               <-- MUST match folder name in music/
        ├── track1.png (or .jpg)    <-- MUST match .mp3 filename
        └── track2.png (or .jpg)
        └── track2.png (or .jpg)
```

##  How to Run Anywhere (Linux, Windows, Mac)

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

##  Management Commands
- **Check container ecosystem status:** `docker compose ps`
- **View application logs:** `docker compose logs sound_player`
- **View database logs:** `docker compose logs db`
- **Stop and remove containers smoothly:** `docker compose down`

## Security & Network Architecture (Production-Ready)

The project architecture has been migrated to an isolated multi-network model to secure the infrastructure:
- **`frontend-net`**: Public-facing virtual network. Contains only the Flask application (`sound_player`), exposing port `5000` to your host machine's browser.
- **`backend-net`**: Completely isolated internal network. Dedicated exclusively for secure communication between the Flask app and the PostgreSQL database.

**Security Note:** The PostgreSQL database container has no exposed ports (`ports:` block is completely removed). It is physically impossible to access the database from the local area network (LAN), the internet, or even directly from the host system. This setup completely eliminates password-bruteforcing and port-scanning vulnerabilities from external devices on your network.

## System Maintenance & Garbage Collection
*Note: This command will only purge stopped containers and untagged images. Your active running player instance and database will remain completely safe and untouched.*
```bash
docker system prune -a
```

