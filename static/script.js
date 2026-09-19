const audio = document.getElementById("audio");
const tracks = Array.from(document.querySelectorAll(".track"));
const playlistSections = Array.from(document.querySelectorAll(".playlist"));
const albumCards = Array.from(document.querySelectorAll(".album-card"));

const playButton = document.getElementById("play-button");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const playerTitle = document.getElementById("player-title");
const playerSubtitle = document.getElementById("player-subtitle");
const playerCover = document.getElementById("player-cover");
const currentTimeText = document.getElementById("current-time");
const durationText = document.getElementById("duration");

const search = document.getElementById("search");
const homeButton = document.getElementById("home-button");
const libraryView = document.getElementById("library-view");
const nowPlayingView = document.getElementById("now-playing-view");
const closeNowPlayingButton = document.getElementById("close-now-playing");

const nowPlayingTitle = document.getElementById("now-playing-title");
const nowPlayingArtist = document.getElementById("now-playing-artist");
const nowPlayingAlbum = document.getElementById("now-playing-album");
const nowPlayingCover = document.getElementById("now-playing-cover");
const recordDisc = document.getElementById("record-disc");
const recordLabel = document.getElementById("record-label");

let currentTrack = null;
let selectedPlaylist = null;

audio.muted = false;
audio.volume = Number(volume.value);

function noteIconSvg() {
    return `
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
        </svg>
    `;
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}

function splitTrackTitle(rawTitle) {
    if (!rawTitle.includes(" - ")) {
        return {
            artist: "My SoundCloud",
            title: rawTitle,
        };
    }

    const parts = rawTitle.split(" - ");

    return {
        artist: parts[0],
        title: parts.slice(1).join(" - "),
    };
}

function setBackgroundArt(element, cover) {
    if (cover) {
        element.style.backgroundImage = `url("${cover}")`;
        element.classList.add("has-image");
        element.innerHTML = "";
        return;
    }

    element.style.backgroundImage = "none";
    element.classList.remove("has-image");
    element.innerHTML = noteIconSvg();
}

function showPlayIcon() {
    playButton.innerHTML = `
        <svg viewBox="0 0 24 24" class="control-icon" aria-hidden="true">
            <polygon points="7,4 20,12 7,20"></polygon>
        </svg>
    `;
    playButton.setAttribute("aria-label", "Воспроизвести");
}

function showPauseIcon() {
    playButton.innerHTML = `
        <svg viewBox="0 0 24 24" class="control-icon" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
    `;
    playButton.setAttribute("aria-label", "Пауза");
}

function openNowPlayingView() {
    libraryView.hidden = true;
    nowPlayingView.classList.add("active");
    nowPlayingView.setAttribute("aria-hidden", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeNowPlayingView() {
    libraryView.hidden = false;
    nowPlayingView.classList.remove("active");
    nowPlayingView.setAttribute("aria-hidden", "true");
}

function getPlaylistTracks(track) {
    return tracks.filter(
        item => item.dataset.playlist === track.dataset.playlist
    );
}

function updateTrackInfo(track) {
    const cover = track.dataset.cover;
    const info = splitTrackTitle(track.dataset.title);
    const playlist = track.dataset.playlist || "My SoundCloud";

    playerTitle.textContent = track.dataset.title;
    playerSubtitle.textContent = playlist;

    if (cover) {
        playerCover.innerHTML = `<img src="${cover}" alt="">`;
    } else {
        playerCover.innerHTML = noteIconSvg();
    }

    nowPlayingTitle.textContent = info.title;
    nowPlayingArtist.textContent = info.artist;
    nowPlayingAlbum.textContent = playlist;

    setBackgroundArt(nowPlayingCover, cover);
    setBackgroundArt(recordLabel, cover);
}

function updateMediaSession(track) {
    if (!("mediaSession" in navigator) || !("MediaMetadata" in window)) {
        return;
    }

    try {
        const info = splitTrackTitle(track.dataset.title);
        const cover = track.dataset.cover;
        const artwork = cover ? [{ src: cover }] : [];

        navigator.mediaSession.metadata = new MediaMetadata({
            title: info.title,
            artist: info.artist,
            album: track.dataset.playlist || "My SoundCloud",
            artwork,
        });
    } catch (error) {
        console.warn("Media Session недоступен:", error);
    }
}

async function loadTrack(track) {
    if (!track) {
        return;
    }

    tracks.forEach(item => item.classList.remove("active"));
    track.classList.add("active");

    currentTrack = track;
    updateTrackInfo(track);
    updateMediaSession(track);

    audio.src = track.dataset.src;
    audio.muted = false;

    try {
        await audio.play();
    } catch (error) {
        console.error("Ошибка воспроизведения:", error);
    }
}

function playNextTrack() {
    if (!currentTrack) {
        return;
    }

    const playlistTracks = getPlaylistTracks(currentTrack);
    const currentIndex = playlistTracks.indexOf(currentTrack);
    const nextIndex = (currentIndex + 1) % playlistTracks.length;

    loadTrack(playlistTracks[nextIndex]);
}

function playPreviousTrack() {
    if (!currentTrack) {
        return;
    }

    const playlistTracks = getPlaylistTracks(currentTrack);
    const currentIndex = playlistTracks.indexOf(currentTrack);
    const previousIndex =
        (currentIndex - 1 + playlistTracks.length) % playlistTracks.length;

    loadTrack(playlistTracks[previousIndex]);
}

function updateView() {
    const query = search.value.toLowerCase().trim();

    playlistSections.forEach(section => {
        const playlist = section.dataset.playlist;

        if (selectedPlaylist && playlist !== selectedPlaylist) {
            section.hidden = true;
            return;
        }

        let visibleTracks = 0;

        section.querySelectorAll(".track").forEach(track => {
            const matches = track.dataset.title
                .toLowerCase()
                .includes(query);

            track.hidden = !matches;

            if (matches) {
                visibleTracks += 1;
            }
        });

        section.hidden = visibleTracks === 0;
    });

    albumCards.forEach(card => {
        card.classList.toggle(
            "active",
            selectedPlaylist === card.dataset.playlist
        );
    });
}

tracks.forEach(track => {
    track.addEventListener("click", () => {
        if (track === currentTrack) {
            if (audio.paused) {
                audio.play().catch(error => {
                    console.error("Ошибка воспроизведения:", error);
                });
            }

            return;
        }

        loadTrack(track);
    });
});

playerCover.addEventListener("click", () => {
    if (!currentTrack) {
        return;
    }

    openNowPlayingView();
});

playButton.addEventListener("click", () => {
    if (!currentTrack) {
        return;
    }

    if (audio.paused) {
        audio.play().catch(error => {
            console.error("Ошибка воспроизведения:", error);
        });
    } else {
        audio.pause();
    }
});

previousButton.addEventListener("click", playPreviousTrack);
nextButton.addEventListener("click", playNextTrack);

closeNowPlayingButton.addEventListener("click", closeNowPlayingView);

homeButton.addEventListener("click", () => {
    selectedPlaylist = null;
    search.value = "";
    closeNowPlayingView();
    updateView();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

albumCards.forEach(card => {
    card.addEventListener("click", () => {
        selectedPlaylist = card.dataset.playlist;
        search.value = "";
        closeNowPlayingView();
        updateView();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});

search.addEventListener("input", updateView);

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    audio.muted = false;
});

progress.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
    }

    audio.currentTime =
        (Number(progress.value) / 100) * audio.duration;
});

audio.addEventListener("play", () => {
    showPauseIcon();
    recordDisc.classList.add("playing");
});

audio.addEventListener("pause", () => {
    showPlayIcon();
    recordDisc.classList.remove("playing");
});

audio.addEventListener("ended", playNextTrack);

audio.addEventListener("loadedmetadata", () => {
    durationText.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
    currentTimeText.textContent = formatTime(audio.currentTime);
    durationText.textContent = formatTime(audio.duration);

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        progress.value = (audio.currentTime / audio.duration) * 100;
    }
});

document.addEventListener("keydown", event => {
    const typing =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement;

    if (typing || !currentTrack) {
        return;
    }

    const skip = event.shiftKey ? 15 : 5;

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - skip);
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        audio.currentTime = Math.min(
            Number.isFinite(audio.duration) ? audio.duration : audio.currentTime + skip,
            audio.currentTime + skip
        );
    }
});

if ("mediaSession" in navigator) {
    try {
        navigator.mediaSession.setActionHandler("play", () => audio.play());
        navigator.mediaSession.setActionHandler("pause", () => audio.pause());
        navigator.mediaSession.setActionHandler("nexttrack", playNextTrack);
        navigator.mediaSession.setActionHandler("previoustrack", playPreviousTrack);

        navigator.mediaSession.setActionHandler("seekbackward", details => {
            audio.currentTime = Math.max(
                0,
                audio.currentTime - (details.seekOffset || 10)
            );
        });

        navigator.mediaSession.setActionHandler("seekforward", details => {
            const nextTime = audio.currentTime + (details.seekOffset || 10);
            audio.currentTime = Number.isFinite(audio.duration)
                ? Math.min(audio.duration, nextTime)
                : nextTime;
        });
    } catch (error) {
        console.warn("Не удалось зарегистрировать Media Session:", error);
    }
}

updateView();
