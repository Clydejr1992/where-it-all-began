document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("storyForm");

    if (!form) return;


    const steps = [
        ...form.querySelectorAll("fieldset")
    ];

    const next = document.getElementById("nextBtn");
    const prev = document.getElementById("prevBtn");
    const save = document.getElementById("saveBtn");

    const bar = document.getElementById("progressBar");
    const label = document.getElementById("stepLabel");
    const pct = document.getElementById("progressPercent");

    const status = document.getElementById("draftStatus");

    const topics = document.getElementById("storyTopics");


    let current = 0;

    const storageKey = "whereItAllBeganStoryDraft";


    /* LOAD SAVED DRAFT */

    try {

        const saved = JSON.parse(
            localStorage.getItem(storageKey) || "{}"
        );


        Object.entries(saved).forEach(([name, value]) => {

            const element = form.elements[name];

            if (!element) return;


            /*
             * MULTIPLE TOPICS
             */

            if (name === "topics" && topics) {

                const selectedTopics =
                    Array.isArray(value)
                        ? value
                        : [value];


                [...topics.options].forEach(option => {

                    option.selected =
                        selectedTopics.includes(option.value);

                });


                return;

            }


            /*
             * NORMAL FIELDS
             */

            element.value = value;

        });

    } catch (error) {

        console.log("No saved draft found.");

    }


    /* COLLECT FORM DATA */

    function collect() {

        const data = {};


        [...form.elements].forEach(element => {

            if (!element.name) return;


            /*
             * MULTIPLE SELECT TOPICS
             */

            if (
                element.name === "topics" &&
                element.multiple
            ) {

                data[element.name] =
                    [...element.selectedOptions]
                        .map(option => option.value);

                return;

            }


            /*
             * NORMAL FIELDS
             */

            data[element.name] =
                element.value;

        });


        return data;

    }


    /* SAVE DRAFT */

    function saveDraft(message) {

        try {

            localStorage.setItem(
                storageKey,
                JSON.stringify(collect())
            );


            if (status) {
                status.textContent = message;
            }


        } catch (error) {

            console.log(
                "Unable to save draft.",
                error
            );

        }

    }


    /* DISPLAY CURRENT STEP */

    function render() {

        steps.forEach((step, index) => {

            step.hidden =
                index !== current;

        });


        const number =
            current + 1;


        const percent =
            Math.round(
                number / steps.length * 100
            );


        label.textContent =
            `Chapter ${number} of ${steps.length}`;


        pct.textContent =
            percent + "%";


        bar.style.width =
            percent + "%";


        prev.disabled =
            current === 0;


        next.hidden =
            current === steps.length - 1;


        save.hidden =
            current !== steps.length - 1;

    }


    /* NEXT BUTTON */

    next.onclick = () => {

        if (current < steps.length - 1) {

            /*
             * Save before moving
             */

            saveDraft(
                "Draft saved on this device."
            );


            current++;

            render();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    };


    /* BACK BUTTON */

    prev.onclick = () => {

        if (current > 0) {

            current--;

            render();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    };


    /* AUTOMATICALLY SAVE DRAFT */

    form.addEventListener("input", () => {

        saveDraft(
            "Draft saved on this device."
        );

    });


    /* CATEGORY / TOPIC CHANGES */

    form.addEventListener("change", () => {

        saveDraft(
            "Draft saved on this device."
        );

    });


    /* FINAL SAVE BUTTON */

    form.onsubmit = (event) => {

        event.preventDefault();


        try {

            localStorage.setItem(
                storageKey,
                JSON.stringify(collect())
            );


            status.textContent =
                "Your story draft is saved on this device. Public submission is not connected yet.";

        } catch (error) {

            status.textContent =
                "Your browser could not save the draft.";

        }

    };


    /* START */

    render();

});
