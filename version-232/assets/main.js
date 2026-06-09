(function() {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('.menu-toggle');
    var mobileNav = qs('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            var isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
            menuButton.textContent = isOpen ? '×' : '☰';
        });
    }

    qsa('[data-hero]').forEach(function(hero) {
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var thumbs = qsa('[data-hero-thumb]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === current);
            });
            thumbs.forEach(function(thumb, i) {
                thumb.classList.toggle('active', i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        thumbs.forEach(function(thumb) {
            thumb.addEventListener('mouseenter', function() {
                show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    });

    qsa('[data-search-area]').forEach(function(area) {
        var input = qs('[data-search-input]');
        var clear = qs('[data-clear-search]');
        var empty = qs('[data-empty-state]');
        var cards = qsa('[data-search-card]', area);
        var activeFilter = 'all';
        var buttons = qsa('[data-filter-button]');

        function apply() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var shown = 0;
            cards.forEach(function(card) {
                var matchesTerm = !term || (card.getAttribute('data-search') || '').toLowerCase().indexOf(term) !== -1;
                var matchesFilter = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
                var visible = matchesTerm && matchesFilter;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (clear && input) {
            clear.addEventListener('click', function() {
                input.value = '';
                input.focus();
                apply();
            });
        }

        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                activeFilter = button.getAttribute('data-filter-button') || 'all';
                buttons.forEach(function(item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });

        apply();
    });
})();

function setupVideoPlayer(streamUrl) {
    var video = document.querySelector('.js-player');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.js-play-button'));
    var overlay = document.querySelector('.player-overlay');
    var hlsInstance = null;
    var loaded = false;

    if (!video || !streamUrl) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function play() {
        load();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function() {});
        }
    }

    buttons.forEach(function(button) {
        button.addEventListener('click', play);
    });

    video.addEventListener('click', play);
    video.addEventListener('play', function() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    window.addEventListener('pagehide', function() {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
