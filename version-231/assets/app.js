(function () {
  function closestHeader(element) {
    while (element && !element.classList.contains('site-header')) {
      element = element.parentElement;
    }
    return element;
  }

  function setupMenu() {
    var buttons = document.querySelectorAll('[data-menu-toggle]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var header = closestHeader(button);
        if (header) {
          header.classList.toggle('is-open');
        }
      });
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('[data-site-search]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var value = input ? input.value.trim() : '';
        if (value) {
          window.location.href = './search.html?q=' + encodeURIComponent(value);
        }
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(next) {
      index = next % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (slides.length > 1) {
      show(0);
      start();
    }
  }

  function setupCatalogFilter() {
    var input = document.querySelector('[data-catalog-filter]');
    if (!input) {
      return;
    }
    var select = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var typeValue = select ? select.value : 'all';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var type = card.getAttribute('data-type');
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = typeValue === 'all' || type === typeValue;
        card.classList.toggle('hidden', !(matchedKeyword && matchedType));
      });
    }

    input.addEventListener('input', apply);
    if (select) {
      select.addEventListener('change', apply);
    }
  }

  function setupSearchPage() {
    var box = document.querySelector('[data-search-page]');
    if (!box || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    var results = document.querySelector('[data-search-results]');

    if (input) {
      input.value = query;
      input.addEventListener('input', function () {
        render(input.value.trim());
      });
    }

    function createCard(movie) {
      var link = document.createElement('a');
      link.className = 'search-card';
      link.href = movie.url;
      link.innerHTML = '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '">' +
        '<div><span class="badge">' + escapeHtml(movie.type) + '</span>' +
        '<h3>' + escapeHtml(movie.title) + '</h3>' +
        '<p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>' +
        '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p></div>';
      return link;
    }

    function render(value) {
      var keyword = value.toLowerCase();
      var matched = window.SITE_MOVIES.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return (movie.title + ' ' + movie.genre + ' ' + movie.region + ' ' + movie.tags + ' ' + movie.oneLine).toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 80);

      if (title) {
        title.textContent = value ? '搜索：' + value : '站内搜索';
      }
      if (!results) {
        return;
      }
      results.innerHTML = '';
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到相关影片';
        results.appendChild(empty);
        return;
      }
      matched.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });
    }

    render(query);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.sitePlayer = function (videoId, buttonId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    var started = false;

    if (!video || !streamUrl) {
      return;
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function start() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (started) {
        playVideo();
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }

      video.src = streamUrl;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  setupMenu();
  setupSearchForms();
  setupHero();
  setupCatalogFilter();
  setupSearchPage();
})();
