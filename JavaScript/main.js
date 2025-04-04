window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    const scrollBtn = document.getElementById("scrollBtn");
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollBtn.style.display = "block";
    } else {
        scrollBtn.style.display = "none";
    }
}

document.getElementById("scrollBtn").addEventListener("click", () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});

// nav 
const nav = document.getElementById('header');
const scrollUp = "scroll-up";
const scrollDown = "scroll-down";
let lastScroll = 0;

window.addEventListener("scroll", scrollHandler);

function scrollHandler() {
    const currentScroll = window.pageYOffset;
    if (currentScroll === 0) {
        nav.classList.remove(scrollDown, scrollUp);
        return;
    }
    if (currentScroll > lastScroll && !nav.classList.contains(scrollDown)) {
        nav.classList.remove(scrollUp);
        nav.classList.add(scrollDown);
    } else if (currentScroll < lastScroll && nav.classList.contains(scrollDown)) {
        nav.classList.remove(scrollDown);
        nav.classList.add(scrollUp);
    }
    lastScroll = currentScroll;
}

// cart 
const closeCart = document.querySelector('.closeCart');
const iconCart = document.querySelector('.icon-cart');
const body = document.querySelector('body');
const cartOverlay = document.querySelector('.cart-overlay'); // Select the cart overlay

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

cartOverlay.addEventListener('click', () => {
    body.classList.toggle('showCart'); // Close the cart when overlay is clicked
});

function viewCart() {
    window.location.href = "cart-page.html";
}