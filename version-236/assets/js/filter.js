(function () {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    var empty = document.querySelector("[data-empty-state]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var clearButton = document.querySelector("[data-filter-clear]");

    if (!input || !list) {
        return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));

    function applyFilter(value) {
        var query = (value || "").trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
            var text = card.getAttribute("data-search") || "";
            var matched = query === "" || text.indexOf(query) !== -1;
            card.style.display = matched ? "" : "none";

            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    input.addEventListener("input", function () {
        applyFilter(input.value);
    });

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            input.value = chip.getAttribute("data-filter-chip") || "";
            applyFilter(input.value);
            input.focus();
        });
    });

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            input.value = "";
            applyFilter("");
            input.focus();
        });
    }
})();
