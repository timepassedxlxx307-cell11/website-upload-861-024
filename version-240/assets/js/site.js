(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".site-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector(".js-hero-carousel");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-index")) || 0);
        startTimer();
      });
    });

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    startTimer();
  }

  Array.prototype.forEach.call(document.querySelectorAll(".filter-scope"), function (scope) {
    var input = scope.querySelector(".js-filter-input");
    var selects = Array.prototype.slice.call(scope.querySelectorAll(".js-filter-select"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(input ? input.value : "");

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre")
        ].join(" "));

        var matched = !query || text.indexOf(query) !== -1;

        selects.forEach(function (select) {
          var field = select.getAttribute("data-filter-field");
          var value = normalize(select.value);
          var cardValue = normalize(card.getAttribute("data-" + field));

          if (value && cardValue.indexOf(value) === -1) {
            matched = false;
          }
        });

        card.classList.toggle("is-filter-hidden", !matched);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q && input) {
      input.value = q;
      applyFilters();
    }
  });
})();
