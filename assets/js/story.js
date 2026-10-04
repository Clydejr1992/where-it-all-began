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


    let current = 0;

    const key = "whereItAllBeganStoryDraft";


    /* LOAD SAVED DRAFT */

    try {

        const saved = JSON.parse(
            localStorage.getItem(key) || "{}"
        );

        Object.entries(saved).forEach(([key, value]) => {

            if (form.elements[key]) {
                form.elements[key].value = value;
            }

        });

    } catch (error) {

        console.log("No saved draft found.");

    }


    /* COLLECT FORM DATA */

    function collect() {

        const data = {};

        [
            ...form.elements
        ].forEach(element => {

            if (element.name) {
                data[element.name] = element.value;
            }

        });

        return data;
    }


    /* DISPLAY CURRENT STEP */

    function render() {

        steps.forEach((step, index) => {

            step.hidden = index !== current;

        });


        const number = current + 1;

        const percent = Math.round(
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

            current++;

            render();

            window.scrollTo(0, 0);

        }

    };


    /* BACK BUTTON */

    prev.onclick = () => {

        if (current > 0) {

            current--;

            render();

            window.scrollTo(0, 0);

        }

    };


    /* AUTOMATICALLY SAVE DRAFT */

    form.addEventListener("input", () => {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(collect())
            );

            status.textContent =
                "Draft saved on this device.";

        } catch (error) {

            console.log(
                "Unable to save draft."
            );

        }

    });


    /* FINAL SAVE BUTTON */

    form.onsubmit = (event) => {

        event.preventDefault();


        try {

            localStorage.setItem(
                key,
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
