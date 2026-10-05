document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("authForm");
    const signUpBtn = document.getElementById("signUpBtn");
    const signInBtn = document.getElementById("signInBtn");
    const status = document.getElementById("authStatus");

    if (!form) return;


    const SUPABASE_URL =
        "https://rdqtwuksydmyxgnxvipl.supabase.co";


    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_E9357c8Z3hxAgOqWGJFGVw_XpKXtlCO";


    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    function getCredentials() {

        return {

            email:
                document
                    .getElementById("email")
                    .value
                    .trim(),

            password:
                document
                    .getElementById("password")
                    .value

        };

    }


    // SIGN IN
    signInBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            const {
                email,
                password
            } = getCredentials();


            if (!email || !password) {

                status.textContent =
                    "Please enter your email and password.";

                return;
            }


            signInBtn.disabled = true;

            status.textContent =
                "Signing in...";


            try {

                const {
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email,
                            password

                        });


                if (error) {
                    throw error;
                }


                status.textContent =
                    "You are signed in. Taking you to your stories...";


                // SEND USER TO THEIR STORIES
                window.location.href =
                    "my-stories.html";


            } catch (error) {

                console.error(error);

                status.textContent =
                    error.message ||
                    "Unable to sign in.";

            }


            signInBtn.disabled = false;

        }
    );


    // CREATE ACCOUNT
    signUpBtn.addEventListener(
        "click",
        async () => {

            const {
                email,
                password
            } = getCredentials();


            if (!email || !password) {

                status.textContent =
                    "Please enter an email and password first.";

                return;
            }


            signUpBtn.disabled = true;

            status.textContent =
                "Creating your account...";


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signUp({

                            email,
                            password

                        });


                if (error) {
                    throw error;
                }


                if (
                    data.user &&
                    !data.session
                ) {

                    status.textContent =
                        "Account created. Check your email to confirm your account, then come back and sign in.";

                } else {

                    status.textContent =
                        "Account created successfully. Taking you to your stories...";


                    window.location.href =
                        "my-stories.html";

                }


            } catch (error) {

                console.error(error);

                status.textContent =
                    error.message ||
                    "Unable to create your account.";

            }


            signUpBtn.disabled = false;

        }
    );

});
