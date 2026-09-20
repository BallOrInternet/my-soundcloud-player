#  My SoundCloud Player (Dockerized)

A simple Python Flask media player application. This repository demonstrates core DevOps practices: Docker containerization, proper workspace volume handling, and cross-platform architecture isolation.

##  Screenshots

<!-- After pushing your screenshots to the repository, you can display them here -->
<!-- ![App Screenshot 1](screenshot1.png) -->
<!-- ![App Screenshot 2](screenshot2.png) -->

##  Required Media Structure

To avoid any confusion and ensure the application correctly pairs audio files with their respective artwork, your local media directories **must** follow this strict structural layout before mounting:

```text
your-local-media-folder/
├── music/
│   └── [Album_Name]/               <-- This folder name becomes the Playlist title on the site
│       ├── track1.mp3              <-- The file name (without extension) becomes the Song title
│       └── track2.mp3
└── covers/
    └── [Album_Name]/               <-- MUST strictly match the folder name in music/
        ├── track1.png (or .jpg)    <-- MUST strictly match the filename of the .mp3
        └── track2.png (or .jpg)
```

> ⚠️ **Important:** If your track is named `LSD.mp3`, the corresponding cover image in the exact same album directory under `covers/` must be named strictly `LSD.png` or `LSD.jpg`. The Python Flask backend automatically strips the extension to match and display the song title and image in real-time.

---

##  How to Run Anywhere (Linux, Windows, Mac)

You do not need Python, virtual environments, or system dependencies installed on your machine. You only need **Docker**.

### 1. Clone this repository
```bash
git clone https://github.com
cd my-soundcloud-player
```

### 2. Build the Isolated Docker Image
```bash
docker build -t my-soundcloud-app .
```

### 3. Run the Container
Mount your local `music` and `covers` folders (structured as shown above) into the container using **Docker Volumes**.

**For Linux / macOS:**
```bash
docker run -d -p 5000:5000 \
  -v "\$(pwd)/music:/app/music" \
  -v "\$(pwd)/covers:/app/covers" \
  --name soundcloud my-soundcloud-app
```

**For Windows (PowerShell):**
```powershell
docker run -d -p 5000:5000 `
  -v "\${PWD}/music:/app/music" `
  -v "${PWD}/covers:/app/covers" `
  --name soundcloud my-soundcloud-app
```

Now open your web browser and navigate to: **http://localhost:5000**

---
*Note: This application is a mockup stub used for infrastructure deployment training purposes.*
