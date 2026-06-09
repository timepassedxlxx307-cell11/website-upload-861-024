(function () {
  Array.prototype.forEach.call(document.querySelectorAll(".player-wrap"), function (wrap) {
    var video = wrap.querySelector("video");
    var button = wrap.querySelector(".player-cover");
    var url = wrap.getAttribute("data-video-url");
    var attached = false;
    var instance = null;

    function attachSource() {
      if (attached || !video || !url) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(url);
        instance.attachMedia(video);
        return;
      }

      video.src = url;
    }

    function playVideo() {
      attachSource();

      if (button) {
        button.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (instance && typeof instance.destroy === "function") {
        instance.destroy();
      }
    });
  });
})();
