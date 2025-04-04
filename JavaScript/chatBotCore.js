const chatBody = document.getElementById('chatBody');
const chatContainer = document.getElementById('chatContainer');
const overlay = document.getElementById('overlay');
const chatButton = document.getElementById('chatButton');
const chatIcon = document.getElementById('chatIcon');

function toggleChat() {
    if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
        chatContainer.style.display = "block";
        overlay.style.display = "block";
        chatIcon.src = "images/Chat Bot/Chat Off.png"; // Change to chat off icon
    } else {
        chatContainer.style.display = "none";
        overlay.style.display = "none";
        chatIcon.src = "images/Chat Bot/Chat On.png"; // Change back to chat on icon
    }
}

function sendPresetMessage(presetMessage) {
    appendMessage(presetMessage, 'message-user');

    setTimeout(() => {
        let botResponse = getBotResponse(presetMessage);
        appendMessage(botResponse.message, 'message-bot');

        if (botResponse.button) {
            appendButton(botResponse.button.text, botResponse.button.link);
        }

        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);

    chatBody.scrollTop = chatBody.scrollHeight;
}

function appendMessage(message, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', className);
    messageElement.innerText = message;
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function appendButton(buttonText, link) {
    const buttonElement = document.createElement('button');
    buttonElement.classList.add('preset-button');
    if (buttonText === "Contactați operatorul") {
        buttonElement.classList.add('contact-operator-button'); // Add a special class for the green button
    }
    buttonElement.innerText = buttonText;
    buttonElement.onclick = function () {
        window.location.href = link;
    };
    chatBody.appendChild(buttonElement);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function getBotResponse(message) {
    const responses = {
        "În câte zile ajunge livrarea?": "Livrarea ajunge la dumneavoastră în decurs de 2 până la 5 zile.",
        "Care sunt opțiunile de livrare disponibile?": "Oferim livrare Gratuită/ Curier în raza orașului Chișinău, și livrare prin poștă în toată Moldova.",
        "Cum pot să urmăresc statusul comenzii mele?": "Vei primi mesaj de confirmare a comenzii pe număr de telefon, că comandă a fost livrată.",
        "Achitarea se efectuează la primire sau cu cardul?": "Detaliile achitării întrebați de operator."
    };

    if (responses[message]) {
        if (message === "Achitarea se efectuează la primire sau cu cardul?") {
            return {
                message: responses[message],
                button: { text: "Contactați operatorul", link: "https://t.me/jewelryady" }
            };
        }
        return { message: responses[message] };
    } else {
        return {
            message: "Pentru întrebări mai complexe, puteți întreba de operatorul nostru pe Telegram.",
            button: { text: "Contactați operatorul", link: "https://t.me/jewelryady" }
        };
    }
}