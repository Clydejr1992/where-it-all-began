document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");

    if (!form) return;


    form.onsubmit = (event) => {

        event.preventDefault();


        const data = new FormData(form);


        const name =
            data.get("name");

        const email =
            data.get("email");

        const topic =
            data.get("topic");

        const message =
            data.get("message");


        const subject =
            encodeURIComponent(
                "[Where It All Began] " + topic
            );


        const body =
            encodeURIComponent(
                `Name: ${name}

Email: ${email}

Message:

${message}`
            );


        location.href =
            `mailto:hello@whereitallbegan.blog?subject=${subject}&body=${body}`;


        const status =
            document.getElementById(
                "contactStatus"
            );


        if (status) {

            status.textContent =
                "Your email app should open with the message prepared.";

        }

    };

});
