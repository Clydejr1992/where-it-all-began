document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("storyForm");

    if (!form) return;


    /* SUPABASE */

    const SUPABASE_URL =
        "https://rdqtwuksydmyxgnxvipl.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_E9357c8Z3hxAgOqWGJFGVw_XpKXtlCO";


    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    /* FORM ELEMENTS */

    const steps = [
        ...form.querySelectorAll("fieldset")
    ];

    const next =
        document.getElementById("nextBtn");

    const prev =
        document.getElementById("prevBtn");

    const save =
        document.getElementById("saveBtn");

    const bar =
        document.getElementById("progressBar");

    const label =
        document.getElementById("stepLabel");

    const pct =
        document.getElementById("progressPercent");

    const status =
        document.getElementById("draftStatus");

    const topics =
        document.getElementById("storyTopics");


    let current = 0;

    const storageKey =
        "whereItAllBeganStoryDraft";


    /* LOAD LOCAL DRAFT */

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(storageKey) || "{}"
            );


        Object.entries(saved).forEach(
            ([name, value]) => {

                const element =
                    form.elements[name];

                if (!element) return;


                if (
                    name === "topics" &&
                    topics
                ) {

                    const selectedTopics =
                        Array.isArray(value)
                            ? value
                            : [value];


                    [
                        ...topics.options
                    ].forEach(option => {

                        option.selected =
                            selectedTopics.includes(
                                option.value
                            );

                    });


                    return;

                }


                element.value = value;

            }
        );

    } catch (error) {

        console.log(
            "No saved draft found."
        );

    }


    /* COLLECT FORM DATA */

    function collect() {

        const data = {};


        [...form.elements].forEach(
            element => {

                if (!element.name)
                    return;


                if (
                    element.name === "topics" &&
                    element.multiple
                ) {

                    data[element.name] =
                        [
                            ...element.selectedOptions
                        ].map(
                            option => option.value
                        );

                    return;

                }


                data[element.name] =
                    element.value;

            }
        );


        return data;

    }


    /* SAVE LOCAL DRAFT */

    function saveLocalDraft(message) {

        try {

            localStorage.setItem(
                storageKey,
                JSON.stringify(
                    collect()
                )
            );


            if (status) {

                status.textContent =
                    message;

            }

        } catch (error) {

            console.log(
                "Unable to save local draft.",
                error
            );

        }

    }


    /* DISPLAY CURRENT STEP */

    function render() {

        steps.forEach(
            (step, index) => {

                step.hidden =
                    index !== current;

            }
        );


        const number =
            current + 1;


        const percent =
            Math.round(
                number /
                steps.length *
                100
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
            current ===
            steps.length - 1;


        save.hidden =
            current !==
            steps.length - 1;

    }


    /* NEXT */

    next.onclick = () => {

        saveLocalDraft(
            "Draft saved on this device."
        );


        if (
            current <
            steps.length - 1
        ) {

            current++;

            render();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    };


    /* BACK */

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


    /* AUTOMATIC LOCAL SAVE */

    form.addEventListener(
        "input",
        () => {

            saveLocalDraft(
                "Draft saved on this device."
            );

        }
    );


    form.addEventListener(
        "change",
        () => {

            saveLocalDraft(
                "Draft saved on this device."
            );

        }
    );


    /* SAVE TO SUPABASE */

    form.onsubmit = async (event) => {

        event.preventDefault();


        const data =
            collect();


        save.disabled = true;

        save.textContent =
            "Saving...";


        status.textContent =
            "Saving your story...";


        try {

            /* GET THE CURRENT SIGNED-IN USER */

            const {
                data: userData,
                error: userError
            } =
                await supabaseClient.auth.getUser();


            if (userError) {

                throw userError;

            }


            const user =
                userData.user;


            if (!user) {

                throw new Error(
                    "You must be signed in before saving your story."
                );

            }


            /* SAVE STORY */

            const {
                data: result,
                error
            } =
                await supabaseClient
                    .from("stories")
                    .insert({

                        author_id:
                            user.id,

                        title:
                            data.name
                                ? `${data.name}'s Story`
                                : "Untitled Story",

                        content:
                            JSON.stringify(data),

                        category:
                            data.category || null,

                        topics:
                            data.topics || [],

                        status:
                            "draft"

                    })
                    .select()
                    .single();


            if (error) {

                throw error;

            }


            /* KEEP LOCAL COPY TOO */

            localStorage.setItem(
                storageKey,
                JSON.stringify(data)
            );


            status.textContent =
                "Your story draft has been saved successfully.";


            console.log(
                "Supabase story:",
                result
            );


        } catch (error) {

            console.error(
                "Supabase save error:",
                error
            );


            status.textContent =
                "We couldn't save your story to the server yet. Your local draft is still saved on this device.";

        }


        save.disabled = false;

        save.textContent =
            "Save My Story Draft";

    };


    /* START */

    render();

});
