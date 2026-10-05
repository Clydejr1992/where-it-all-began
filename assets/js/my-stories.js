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

    const storiesList =
        document.getElementById("storiesList");

    const emptyMessage =
        document.getElementById("emptyMessage");

    const errorMessage =
        document.getElementById("errorMessage");

    const signOutBtn =
        document.getElementById("signOutBtn");


    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    if (!user) {
        window.location.href = "login.html";
        return;
    }


    const {
        data: stories,
        error
    } = await supabaseClient
        .from("stories")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", {
            ascending: false
        });


    loading.hidden = true;


    if (error) {

        console.error(error);

        errorMessage.textContent =
            "We couldn't load your stories. Please try again.";

        errorMessage.hidden = false;

        return;
    }


    if (!stories || stories.length === 0) {

        emptyMessage.hidden = false;

        return;
    }


    stories.forEach(story => {

        const card =
            document.createElement("article");

        card.className = "story-card";


        const title =
            document.createElement("h2");

        title.textContent =
            story.title || "Untitled Story";


        const category =
            document.createElement("p");

        category.className = "form-help";

        category.textContent =
            story.category
                ? `Category: ${story.category}`
                : "No category selected";


        const status =
            document.createElement("p");

        status.className = "form-help";

        status.textContent =
            `Status: ${story.status}`;


        const date =
            document.createElement("p");

        date.className = "form-help";

        date.textContent =
            `Saved: ${new Date(
                story.created_at
            ).toLocaleDateString()}`;


        card.appendChild(title);
        card.appendChild(category);
        card.appendChild(status);
        card.appendChild(date);

        storiesList.appendChild(card);

    });


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

                signOutBtn.disabled = false;

                signOutBtn.textContent =
                    "Sign Out";

                return;
            }


            window.location.href =
                "login.html";

        }
    );

});
