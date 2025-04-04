document.addEventListener("DOMContentLoaded", function () {
    fetch('Admin/Admin/json/categories.json')
        .then(response => response.json())
        .then(categories => {
            const categoriesContainer = document.querySelector('.shop_categories');
            categoriesContainer.innerHTML = `
                <a href="#" class="categories_link active" productCategory="Toate Produsele">Toate Produsele</a>
            `;
            categories.forEach(category => {
                const categoryLink = document.createElement('a');
                categoryLink.href = "#";
                categoryLink.className = "categories_link";
                categoryLink.setAttribute("productCategory", category);
                categoryLink.textContent = category;
                categoriesContainer.appendChild(categoryLink);
            });

            // Add event listeners to category links
            const categoryLinks = document.querySelectorAll('.categories_link');
            categoryLinks.forEach(link => {
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    const category = this.getAttribute('productCategory');
                    markActiveCategory(category);
                    getData(category);
                    // Save selected category to localStorage
                    localStorage.setItem('selectedCategory', category);
                    // Update URL with selected category
                    updateURL(category);
                    // Close the sidebar after selecting a category
                    toggleSidebar();
                });
            });

            // Load selected category from localStorage
            const savedCategory = localStorage.getItem('selectedCategory') || "Toate Produsele";
            markActiveCategory(savedCategory);
            getData(savedCategory);
        })
        .catch(error => console.error('Error fetching categories:', error));
});

function updateURL(category) {
    const newURL = `products.html?category=${category}`;
    window.history.pushState({ path: newURL }, "", newURL);
}
