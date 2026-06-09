function startMoviePlayer(streamUrl) {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playerCover");
    var hlsInstance = null;
    var started = false;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (started) {
            return;
        }
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function playNow(event) {
        if (event) {
            event.preventDefault();
        }
        attachStream();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", playNow);
    }

    video.addEventListener("click", function () {
        if (!started || video.paused) {
            playNow();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
