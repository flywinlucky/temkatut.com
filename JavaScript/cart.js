let cart = [];
let products = [];
let totalPrice = document.getElementById("total_price");
let cartCounter = document.getElementById("cart-counter");
let cartItemsCount = document.getElementById("cart_counts");
const cartTextElements = document.querySelectorAll(".cart_products");
const btnControl = document.querySelector(".btn_control");
const cartTotal = document.querySelector(".cart_total");

// Include CryptoJS library
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js";
document.head.appendChild(script);

loadCart();
getData();
checkCart();

async function getData() {
    let response = await fetch(`Admin/Admin/json/products.json?cache_bust=${new Date().getTime()}`);
    let json = await response.json();
    products = json;
}

function loadCart() {
    let storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId, inputQuantity = 1, selectedSize = "Mărime necunoscută") {
    let product = products.find(p => p.id === productId);
    if (product) {
        // Verificăm dacă produsul există deja în coș cu aceeași mărime
        let existingProduct = cart.find(p => p.id === productId && p.size === selectedSize);
        if (existingProduct) {
            // Dacă există, actualizăm cantitatea
            existingProduct.quantity += inputQuantity;
        } else {
            // Dacă nu există, adăugăm produsul cu mărimea selectată
            let productWithQuantity = {
                ...product,
                quantity: inputQuantity,
                size: selectedSize // Salvăm mărimea selectată
            };
            cart.push(productWithQuantity);
        }
        saveCart(); // Salvăm coșul în localStorage
        checkCart(); // Actualizăm UI-ul
    }
}

function addCartToHTML() {
    let content = ``;
    cart.forEach((product, index) => {
        let price = parseFloat(product.price.replace('$', '')); // Eliminăm $
        let totalPrice = price * product.quantity;
        content += `
        <div class="cart_product">
            <div class="cart_product_img">  
                <img src=${product.images[0]} alt="${product.name}">
            </div>
            <div class="cart_product_info">  
                <div class="top_card">
                    <div class="left_card">
                        <h4 class="product_name">${product.name}</h4>
                        <span class="product_price">${price.toFixed(2)} MDL</span>
                        <br> <!-- Adăugăm un break pentru a muta mărimea pe un rând nou -->
                        ${product.size && product.size !== "Mărime necunoscută" ? `<span class="product_size">Mărime: ${product.size}</span>` : ''} <!-- Afișăm mărimea doar dacă există -->
                    </div>
                    <div class="remove_product" onclick="removeFromCart(${index})">
                        <ion-icon name="close-outline"></ion-icon>
                    </div>
                </div>
                <div class="buttom_card">
                    <div class="counts">
                        <button class="counts_btns minus" onclick="decreaseQuantity(${index})">-</button>
                        <input type="number" inputmode="numeric" name="productCount" min="1" step="1" max="999"
                            class="product_count" value=${product.quantity}>
                        <button class="counts_btns plus" onclick="increaseQuantity(${index})">+</button>
                    </div>
                    <span class="total_price">${totalPrice.toFixed(2)} MDL</span>
                </div>
            </div>
        </div>`;
    });
    cartTextElements.forEach(element => {
        element.innerHTML = content;
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    checkCart();
}

function increaseQuantity(index) {
    cart[index].quantity += 1;
    saveCart();
    checkCart();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        saveCart();
        checkCart();
    } else {
        removeFromCart(index);
    }
}

function updateTotalPrice() {
    let total = cart.reduce((sum, product) => {
        let price = parseFloat(product.price.replace('$', '')); // Eliminăm $
        return sum + (price * product.quantity);
    }, 0);
    totalPrice.innerHTML = `${total.toFixed(2)} MDL`;
    localStorage.setItem("total price", total + 0); // Adaugă livrarea dacă e necesar
    return total;
}

// Initial call to display the cart products on page load
function checkCart() {
    if (cart.length == 0) {
        cartTextElements.forEach(element => {
            element.classList.add("empty");
            element.innerHTML = "Coșul dvs. este gol";
        });
        cartCounter.innerHTML = 0;
        btnControl.style.display = "none";
        cartTotal.style.display = "none";
        checkCartPage(0, 0);
    } else {
        cartTextElements.forEach(element => {
            element.classList.remove("empty");
        });
        addCartToHTML();
        let totalQuantity = cart.reduce((sum, product) => sum + product.quantity, 0);
        cartCounter.innerHTML = totalQuantity;
        btnControl.style.display = "flex";
        cartTotal.style.display = "flex";
        let total = updateTotalPrice();
        checkCartPage(total, totalQuantity);
    }
}

// Add cart page not cart section
function checkCartPage(total, totalQuantity) {
    if (window.location.pathname.includes("cart-page.html")) {
        if (cart.length == 0) {
            cartItemsCount.innerHTML = `(0 Itemi)`;
            document.getElementById("Subtotal").innerHTML = `$0.00`;
            document.getElementById("total_order").innerHTML = `$0.00`;
        } else {
            cartItemsCount.innerHTML = `(${totalQuantity} Itemi)`;
            displayInCartPage(total);
        }
    }
}

async function displayInCartPage(total) {
    let subTotal = document.getElementById("Subtotal");
    subTotal.innerHTML = `${total.toFixed(2)} MDL`;
    let totalOrder = parseFloat(subTotal.innerHTML.replace('MDL', '')) + 0; // Adaugăm taxa de livrare
    document.getElementById("total_order").innerHTML = `${totalOrder.toFixed(2)} MDL`;

    // Convert total order to USD and display
    const totalInUSD = await convertToUSD(totalOrder);
    document.getElementById("total_order_usd").innerHTML = `${totalInUSD} USD`;
}

async function convertToUSD(amountInMDL) {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/MDL');
    const data = await response.json();
    const rate = data.rates.USD;
    return (amountInMDL * rate).toFixed(2);
}

function checkOut() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    const shippingName = document.getElementById('shippingName').value.trim();
    const shippingPhone = document.getElementById('shippingPhone').value.trim();
    const shippingEmail = document.getElementById('shippingEmail').value.trim();
    const shippingTelegram = document.getElementById('shippingTelegram').value.trim();
    const shippingRaion = document.getElementById('shippingRaion').value.trim();
    const shippingOras = document.getElementById('shippingOras').value.trim();
    const shippingAdresa = document.getElementById('shippingAdresa').value.trim();
    const shippingPostalCode = document.getElementById('shippingPostalCode').value.trim();

    if (!shippingName || !shippingPhone || !shippingEmail || !shippingTelegram || !shippingRaion || !shippingOras || !shippingAdresa || !shippingPostalCode) {
        alert("Vă rugăm să completați toate câmpurile de livrare.");
        return;
    }

    if (!paymentMethod) {
        alert("Vă rugăm să selectați o metodă de plată.");
        return;
    }

    if (paymentMethod.value === 'cash') {
        processCashOrder();
    } else if (paymentMethod.value === 'card') {
        processCardOrder();
    }
}

function processCashOrder() {
    // Preluarea informațiilor de livrare
    let shippingInfo = {
        Nume: document.getElementById('shippingName').value,
        Telefon: document.getElementById('shippingPhone').value,
        Email: document.getElementById('shippingEmail').value,
        Telegram: document.getElementById('shippingTelegram').value,
        Raion: document.getElementById('shippingRaion').value,
        Oras: document.getElementById('shippingOras').value,
        Adresa: document.getElementById('shippingAdresa').value,
        CodulPostal: document.getElementById('shippingPostalCode').value
    };

    // Generarea timestamp-ului
    let currentDate = new Date();
    let formattedDate = `${currentDate.toLocaleDateString()} | ${currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;

    // Crearea mesajului de comandă
    let orderDetails = `Detalii Comandă:\nItemi:\nData ${formattedDate}\n\n`;
    cart.forEach((product, index) => {
        orderDetails += `${index + 1}) ${product.name} | Cantitate x${product.quantity} | ${product.size && product.size !== "Mărime necunoscută" ? `Mărime ${product.size}` : ''}\nImagine: ${product.images[0]}\n\n`;
    });

    let totalOrderPrice = `${updateTotalPrice().toFixed(2)} MDL`;
    orderDetails += `Total: ${totalOrderPrice}\n\n`;
    orderDetails += `Nume: ${shippingInfo.Nume}\n`;
    orderDetails += `Telefon: ${shippingInfo.Telefon}\n`;
    orderDetails += `Email: ${shippingInfo.Email}\n`;
    orderDetails += `Telegram: ${shippingInfo.Telegram}\n`;
    orderDetails += `Raion: ${shippingInfo.Raion}\n`;
    orderDetails += `Oras: ${shippingInfo.Oras}\n`;
    orderDetails += `Adresa: ${shippingInfo.Adresa}\n`;
    orderDetails += `Codul Postal: ${shippingInfo.CodulPostal}`;

    // Save order details to localStorage
    localStorage.setItem("orderDetails", orderDetails);

    // Trimiterea mesajului prin Telegram API
    const telegramApiUrls = [
        `https://api.telegram.org/bot7566897555:AAG-7T_y31rmY5Adtwz3d8oxdTo2uNXuj-U/sendMessage?chat_id=6953089880&text=${encodeURIComponent(orderDetails)}`
    ];

    Promise.all(telegramApiUrls.map(url => fetch(url)))
        .then(responses => {
            if (responses.every(response => response.ok)) {
                cart = []; // Golește coșul
                saveCart();
                checkCart(); // Actualizează interfața
                // Redirecționează către pagina de succes
                window.location.href = "payment-successful.html";
            } else {
                // Redirecționează către pagina de eșec
                window.location.href = "payment-failed.html";
            }
        })
        .catch(error => {
            console.error("Eroare la trimiterea detaliilor comenzii:", error);
            // Redirecționează către pagina de eșec
            window.location.href = "payment-failed.html";
        });
}

window.processCardOrder = async function () {
    const totalOrderPriceMDL = updateTotalPrice().toFixed(2);
    const totalOrderPriceUSD = await convertToUSD(totalOrderPriceMDL);

    const merchantId = '60399';
    const secretWord1 = 'A2^NvFJm]c6]!m8';
    const orderId = new Date().getTime(); // Unique order ID
    const signature = md5(`${merchantId}:${totalOrderPriceUSD}:${secretWord1}:${orderId}`);

    alert(`FreeKassa Parameters:\nMerchant ID: ${merchantId}\nAmount in USD: ${totalOrderPriceUSD}\nOrder ID: ${orderId}\nSignature: ${signature}`);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://pay.freekassa.ru/';
    form.target = '_blank';

    const params = {
        m: merchantId,
        oa: totalOrderPriceUSD,
        o: orderId,
        s: signature,
        currency: 'USD',
        us_user: 'USER_ID',
        lang: 'en',
        i: 'USD',
        debug: '1'
    };

    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = params[key];
            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form); // Remove the form after submission
}

function md5(string) {
    return CryptoJS.MD5(string).toString();
}

let appliedPromoCodes = [];
let currentDiscount = 0;

function applyPromoCode() {
    const promoCodeInput = document.querySelector('input[placeholder="PROMOCODE"]');
    const promoCode = promoCodeInput.value.trim().toUpperCase();

    if (appliedPromoCodes.includes(promoCode)) {
        alert("Acest promo cod a fost deja folosit.");
        return;
    }

    if (promoCode === "GIFTHOUSE10") {
        currentDiscount = 0.10; // 10% discount
    } else {
        alert("Promo cod invalid.");
        return;
    }

    appliedPromoCodes.push(promoCode);
    updateTotalPriceWithDiscount();
}

async function updateTotalPriceWithDiscount() {
    let total = cart.reduce((sum, product) => {
        let price = parseFloat(product.price.replace('$', '')); // Eliminăm $
        return sum + (price * product.quantity);
    }, 0);

    total = total - (total * currentDiscount);
    totalPrice.innerHTML = `${total.toFixed(2)} MDL`;
    localStorage.setItem("total price", total + 0); // Adaugă livrarea dacă e necesar

    // Update the total order and converted price in USD
    let subTotal = document.getElementById("Subtotal");
    subTotal.innerHTML = `${total.toFixed(2)} MDL`;
    let totalOrder = parseFloat(subTotal.innerHTML.replace('MDL', '')) + 0; // Adaugăm taxa de livrare
    document.getElementById("total_order").innerHTML = `${totalOrder.toFixed(2)} MDL`;

    const totalInUSD = await convertToUSD(totalOrder);
    document.getElementById("total_order_usd").innerHTML = `${totalInUSD} USD`;

    return total;
}