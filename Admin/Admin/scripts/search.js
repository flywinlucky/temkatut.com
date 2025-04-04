function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        searchProducts(query);
    });
}

function searchProducts(query) {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = ''; // Clear previous products

    const filteredProducts = products.filter(product => {
        return product.name.toLowerCase().includes(query) ||
            product.id.toLowerCase().includes(query) ||
            product.price.toString().includes(query);
    });

    filteredProducts.forEach(product => {
        displayProduct(product); // Display each matching product
    });

    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<p>Nu există produse care să corespundă căutării.</p>';
    }
}