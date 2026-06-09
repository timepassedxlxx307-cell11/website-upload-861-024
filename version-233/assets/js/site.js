(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalizeRoot(root) {
        if (!root) {
            return ".";
        }
        return root.replace(/\/$/, "");
    }

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        var mobileMenu = document.querySelector(".mobile-menu");

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener("click", function () {
                var opened = mobileMenu.classList.toggle("is-open");
                menuToggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        document.querySelectorAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var keyword = input ? input.value.trim() : "";
                if (!keyword) {
                    return;
                }
                var root = normalizeRoot(form.getAttribute("data-search-root"));
                window.location.href = root + "/search.html?q=" + encodeURIComponent(keyword);
            });
        });

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var current = 0;
            var timer;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function autoplay() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    autoplay();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    autoplay();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    autoplay();
                });
            });

            show(0);
            autoplay();
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-card-search]");
            var select = panel.querySelector("[data-year-filter]");
            var clear = panel.querySelector("[data-clear-filter]");
            var list = panel.parentElement.querySelector("[data-card-list]");
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var year = select ? select.value : "";

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = !year || card.getAttribute("data-year") === year;
                    card.hidden = !(matchKeyword && matchYear);
                });
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            if (select) {
                select.addEventListener("change", applyFilter);
            }

            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (select) {
                        select.value = "";
                    }
                    applyFilter();
                });
            }
        });

        var searchForm = document.querySelector("[data-search-page-form]");
        var searchResults = document.getElementById("searchResults");

        if (searchForm && searchResults && typeof SITE_MOVIE_INDEX !== "undefined") {
            var searchInput = searchForm.querySelector("input[name='q']");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";

            function renderResults(keyword) {
                var query = keyword.trim().toLowerCase();
                if (searchInput) {
                    searchInput.value = keyword;
                }
                if (!query) {
                    return;
                }

                var matches = SITE_MOVIE_INDEX.filter(function (movie) {
                    var text = [
                        movie.title,
                        movie.year,
                        movie.region,
                        movie.type,
                        movie.genre,
                        movie.category,
                        movie.oneLine,
                        (movie.tags || []).join(" ")
                    ].join(" ").toLowerCase();
                    return text.indexOf(query) !== -1;
                }).slice(0, 120);

                searchResults.innerHTML = matches.map(function (movie) {
                    return [
                        "<article class=\"movie-card\">",
                        "<a href=\"" + escapeHtml(movie.url) + "\">",
                        "<div class=\"poster-wrap\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "海报\" loading=\"lazy\"><span class=\"poster-play\">▶</span></div>",
                        "<div class=\"movie-info\"><div class=\"meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
                        "<h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.oneLine) + "</p>",
                        "<div class=\"card-tags\">" + (movie.tags || []).slice(0, 3).map(function (tag) { return "<span>" + escapeHtml(tag) + "</span>"; }).join("") + "</div></div>",
                        "</a></article>"
                    ].join("");
                }).join("");

                if (!matches.length) {
                    searchResults.innerHTML = "<div class=\"empty-state\"><h2>没有找到匹配内容</h2><p>可以尝试更短的片名、类型、地区或年份关键词。</p></div>";
                }
            }

            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                renderResults(searchInput ? searchInput.value : "");
            });

            if (initial) {
                renderResults(initial);
            }
        }
    });

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }
})();
