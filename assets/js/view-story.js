document.addEventListener("DOMContentLoaded", async () => {

    const SUPABASE_URL =
        "https://rdqtwuksydmyxgnxvipl.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_E9357c8Z3hxAgOqWGJFGVw_XpKXtlCO";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    const loading =
        document.getElementById("loading");

    const storyTitle =
        document.getElementById("storyTitle");

    const storyDetails =
        document.getElementById("storyDetails");

    const storyContent =
        document.getElementById("storyContent");

    const storyText =
        document.getElementById("storyText");

    const errorMessage =
        document.getElementById("errorMessage");

    const signOutBtn =
        document.getElementById("signOutBtn");


    // Get the logged-in user's session
    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    const user = session?.user;


    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    // Get the story ID from the web address
    const params =
        new URLSearchParams(
            window.location.search
        );

    const storyId =
        params.get("id");


    if (!storyId) {

        loading.hidden = true;

        errorMessage.textContent =
            "No story was selected.";

        errorMessage.hidden = false;

        return;
    }


    // Load only this user's selected story
    const {
        data: story,
        error
    } =
        await supabaseClient
            .from("stories")
            .select("*")
            .eq("id", storyId)
            .eq("author_id", user.id)
            .single();


    loading.hidden = true;


    if (error || !story) {

        console.error(error);

        errorMessage.textContent =
            "We couldn't find that story.";

        errorMessage.hidden = false;

        return;
    }


    // Display the story information
    storyTitle.textContent =
        story.title || "Untitled Story";


    storyDetails.textContent =
        story.category
            ? `Category: ${story.category} • Status: ${story.status}`
            : `Status: ${story.status}`;


    // Display the story itself
    storyText.textContent =
        story.content || "This story does not have any content yet.";


    storyContent.hidden = false;


    // Sign out
    signOutBtn.addEventListener(
        "click",
        async () => {

            signOutBtn.disabled = true;

            signOutBtn.textContent =
                "Signing Out...";


            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(error);

                signOutBtn.disabled =
                    false;

                signOutBtn.textContent =
                    "Sign Out";

                return;
            }


            window.location.href =
                "login.html";

        }
    );

});
