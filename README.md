# 🎧 My SoundCloud Player (Dockerized)

A simple Python Flask media player application. This repository demonstrates core DevOps practices: Docker containerization, proper workspace multi-stage/volume handling, and cross-platform architecture isolation.

## 🚀 How to Run Anywhere (Linux, Windows, Mac)

You don't need Python, virtual environments, or system dependencies installed on your machine. You only need **Docker**.

### 1. Clone this repository
```bash
git clone https://github.com
cd my-soundcloud-player
```

### 2. Build the Isolated Docker Image
```bash
docker build -t my-soundcloud-app .
```

### 3. Run the Container with your own Music & Covers
To stream your personal music tracks and see covers, mount your local directories into the container using **Docker Volumes**.

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
