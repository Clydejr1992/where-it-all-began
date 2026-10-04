document.addEventListener("DOMContentLoaded", () => {

    const search = document.getElementById("storySearch");
    const category = document.getElementById("storyCategory");

    const cards = [
        ...document.querySelectorAll(".story-card")
    ];

    const empty = document.getElementById("noStories");


    if (!search) return;


    function filterStories() {

        const query =
            search.value.toLowerCase().trim();

        const selectedCategory =
            category.value;

        let shown = 0;


        cards.forEach(card => {

            const title =
                card.dataset.title.toLowerCase();

            const cardCategory =
                card.dataset.category;


            const matchesSearch =
                !query ||
                title.includes(query);


            const matchesCategory =
                selectedCategory === "all" ||
                cardCategory === selectedCategory;


            const show =
                matchesSearch &&
                matchesCategory;


            card.hidden = !show;


            if (show) {
                shown++;
            }

        });


        empty.hidden = shown !== 0;

    }


    search.addEventListener(
        "input",
        filterStories
    );


    category.addEventListener(
        "change",
        filterStories
    );


});
