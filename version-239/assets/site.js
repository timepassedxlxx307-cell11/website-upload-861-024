(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
        });
    }

    var carousel = document.querySelector('[data-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === current);
            });
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                showSlide(position);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters(scope) {
        var filterInput = scope.querySelector('[data-page-filter]');
        var yearSelect = scope.querySelector('[data-year-filter]');
        var regionSelect = scope.querySelector('[data-region-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
        var empty = scope.querySelector('[data-empty-state]');

        if (!cards.length) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region'));
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
            var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
            var visible = matchesQuery && matchesYear && matchesRegion;
            card.hidden = !visible;
            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', shown === 0);
        }
    }

    var filterScopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    filterScopes.forEach(function (scope) {
        var filterInput = scope.querySelector('[data-page-filter]');
        var yearSelect = scope.querySelector('[data-year-filter]');
        var regionSelect = scope.querySelector('[data-region-filter]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && filterInput && scope.hasAttribute('data-search-page')) {
            filterInput.value = query;
        }

        [filterInput, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', function () {
                    applyFilters(scope);
                });
                control.addEventListener('change', function () {
                    applyFilters(scope);
                });
            }
        });

        applyFilters(scope);
    });
})();
