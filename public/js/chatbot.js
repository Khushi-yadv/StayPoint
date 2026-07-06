const form = document.getElementById("chatForm");
const chatbox = document.getElementById("chatbox");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const message =
        document.getElementById("message").value;

    chatbox.innerHTML +=
        `<p><b>You:</b> ${message}</p>`;

    try {

        const response =
            await fetch("/chatbot/ask", {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message: message
                })
            });

        console.log(response);

        const data =
            await response.json();

        console.log(data);

        chatbox.innerHTML +=
            `<p>
                <b>AI:</b>
                ${data.reply}
            </p>`;

    }
    catch (err) {

        console.log(err);

        chatbox.innerHTML +=
            `<p style="color:red">
                ERROR:
                ${err.message}
            </p>`;
    }

    document.getElementById("message").value = "";
});

// Floating chatbot icon click
const icon =
document.getElementById(
    "chatbot-icon"
);

if (icon) {

    icon.addEventListener(
        "click",
        () => {
            window.location =
            "/chatbot";
        }
    );
}