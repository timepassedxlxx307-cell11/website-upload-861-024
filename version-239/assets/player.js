(function () {
    function loadStream(video, streamUrl) {
        if (video.getAttribute('data-ready') === '1') {
            return Promise.resolve();
        }

        video.setAttribute('data-ready', '1');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            return new Promise(function (resolve) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function playFromShell(shell) {
        var video = shell.querySelector('video[data-stream]');
        var overlay = shell.querySelector('[data-player-overlay]');

        if (!video) {
            return;
        }

        var streamUrl = video.getAttribute('data-stream');
        if (!streamUrl) {
            return;
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        loadStream(video, streamUrl).then(function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        });
    }

    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));
    shells.forEach(function (shell) {
        var overlay = shell.querySelector('[data-player-overlay]');
        var video = shell.querySelector('video[data-stream]');

        if (overlay) {
            overlay.addEventListener('click', function () {
                playFromShell(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playFromShell(shell);
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }
    });
})();
