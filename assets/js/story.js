document.addEventListener("DOMContentLoaded", async () => {

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


    /* CHECK FOR EDIT MODE */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const editingStoryId =
        params.get("id");


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


    /* FILL FORM FROM SAVED STORY */

    function fillForm(data) {

        Object.entries(data).forEach(
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


                if (
                    element.type === "checkbox"
                ) {

                    element.checked =
                        Boolean(value);

                    return;

                }


                element.value =
                    value ?? "";

            }
        );

    }


    /* LOAD STORY FOR EDITING */

    async function loadStoryForEditing() {

        if (!editingStoryId)
            return;


        status.textContent =
            "Loading your story...";


        try {

            const {
                data: userData,
                error: userError
            } =
                await supabaseClient.auth.getUser();


            if (userError)
                throw userError;


            const user =
                userData.user;


            if (!user) {

                window.location.href =
                    "login.html";

                return;

            }


            const {
                data: story,
                error
            } =
                await supabaseClient
                    .from("stories")
                    .select("*")
                    .eq("id", editingStoryId)
                    .eq("author_id", user.id)
                    .single();


            if (error)
                throw error;


            if (!story) {

                throw new Error(
                    "Story not found."
                );

            }


            let savedData = {};


            try {

                savedData =
                    JSON.parse(
                        story.content || "{}"
                    );

            } catch (error) {

                console.error(
                    "Unable to read saved story content.",
                    error
                );

            }


            fillForm(savedData);


            localStorage.setItem(
                storageKey,
                JSON.stringify(savedData)
            );


            if (save) {

                save.textContent =
                    "Save Changes";

            }


            status.textContent =
                "Your saved story has been loaded for editing.";


        } catch (error) {

            console.error(
                "Load story error:",
                error
            );


            status.textContent =
                "We couldn't load that story for editing.";


            setTimeout(() => {

                window.location.href =
                    "my-stories.html";

            }, 2000);

        }

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
            editingStoryId
                ? "Saving Changes..."
                : "Saving...";


        status.textContent =
            editingStoryId
                ? "Updating your story..."
                : "Saving your story...";


        try {

            /* GET CURRENT SIGNED-IN USER */

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


            /* EDIT EXISTING STORY */

            if (editingStoryId) {

                const {
                    data: result,
                    error
                } =
                    await supabaseClient
                        .from("stories")
                        .update({

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

                            updated_at:
                                new Date().toISOString()

                        })
                        .eq(
                            "id",
                            editingStoryId
                        )
                        .eq(
                            "author_id",
                            user.id
                        )
                        .select()
                        .single();


                if (error) {

                    throw error;

                }


                localStorage.setItem(
                    storageKey,
                    JSON.stringify(data)
                );


                status.textContent =
                    "Your story has been updated successfully.";


                console.log(
                    "Updated Supabase story:",
                    result
                );


            } else {

                /* CREATE NEW STORY */

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

            }


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
            editingStoryId
                ? "Save Changes"
                : "Save My Story Draft";

    };


    /* START */

    render();


    /* LOAD EDITING STORY AFTER FORM IS READY */

    await loadStoryForEditing();

});
