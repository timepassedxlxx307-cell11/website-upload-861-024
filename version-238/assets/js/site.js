(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var carousel = document.getElementById('heroCarousel');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    var show = function (target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    start();
  }

  var searchInput = document.querySelector('.movie-search');
  var filterChips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card, .wide-ranking .ranking-item'));
  var activeFilter = '';

  var applyFilters = function () {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
      var visible = (!keyword || haystack.indexOf(keyword) !== -1) && (!activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1);
      card.style.display = visible ? '' : 'none';
    });
  };

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filterChips.forEach(function (item) {
        item.classList.remove('is-active');
      });
      chip.classList.add('is-active');
      activeFilter = chip.getAttribute('data-filter') || '';
      applyFilters();
    });
  });

  var results = document.getElementById('searchResults');
  var input = document.getElementById('searchInput');
  var title = document.getElementById('searchTitle');

  if (results && input && Array.isArray(window.SITE_MOVIES)) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;

    var renderCard = function (movie) {
      var tags = movie.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a class="poster-link" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">' +
        '<span class="poster-play">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    };

    var runSearch = function (query) {
      var term = query.trim().toLowerCase();
      if (!term) {
        title.textContent = '推荐影片';
        return;
      }
      var matched = window.SITE_MOVIES.filter(function (movie) {
        return movie.search.toLowerCase().indexOf(term) !== -1;
      }).slice(0, 120);
      title.textContent = '搜索结果：' + query.trim();
      if (matched.length) {
        results.innerHTML = matched.map(renderCard).join('');
      } else {
        results.innerHTML = '<div class="empty-results">没有找到相关影片，请尝试其他关键词。</div>';
      }
    };

    runSearch(q);

    input.addEventListener('input', function () {
      runSearch(input.value);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }
})();
