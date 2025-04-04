window.addEventListener("load", () => {
    clearCart();
    updateTotalPrice();
});

function clearCart() {
    localStorage.removeItem('cart');
}

function updateTotalPrice() {
    let totalPrice = document.getElementById("total_price");

    let total = localStorage.getItem('total price');
    if (total) {
        total = parseFloat(total);
        totalPrice.innerHTML = `$${total.toFixed(2)}`;
    } else {
        totalPrice.innerHTML = `$0.00`;
    }
}

function backHome() {
    window.location.href = "index.html";
}