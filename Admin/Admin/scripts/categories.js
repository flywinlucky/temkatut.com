let categories = [];

function addCategory() {
    const categoryName = document.getElementById('categoryName').value.trim();
    if (categoryName) {
        if (!categories.includes(categoryName)) { // Ensure category is unique
            categories.push(categoryName);
            updateCategories();
            saveCategoriesToJSON(); // Save categories to JSON file
            document.getElementById('categoryName').value = ''; // Clear input
            populateFilterDropdown(); // Update filter dropdown
        } else {
            alert("Categoria există deja.");
        }
    } else {
        alert("Introduceți un nume valid pentru categorie.");
    }
}

function updateCategories() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    categoriesContainer.innerHTML = ''; // Clear previous categories

    categories.forEach((category, index) => {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'categoryContainer';

        const categoryName = document.createElement('span');
        categoryName.className = 'categoryName';
        const productCount = products.filter(product => product.category === category).length;
        categoryName.textContent = `${category} (${productCount})`;

        const categoryActions = document.createElement('div');
        categoryActions.className = 'categoryActions';

        const addItemButton = document.createElement('button');
        addItemButton.className = 'addItemButton';
        addItemButton.textContent = 'Adaugă Produs Nou';
        addItemButton.onclick = () => selectCategory(category, index);

        const deleteCategoryButton = document.createElement('button');
        deleteCategoryButton.className = 'deleteCategoryButton';
        deleteCategoryButton.textContent = 'Șterge Categoria';
        deleteCategoryButton.onclick = () => deleteCategory(category, index);

        categoryActions.appendChild(addItemButton);
        categoryActions.appendChild(deleteCategoryButton);

        categoryContainer.appendChild(categoryName);
        categoryContainer.appendChild(categoryActions);

        // Add event listener to categoryContainer for loading and selecting products
        categoryContainer.addEventListener('click', () => {
            filterProductsByCategory(category);
            document.getElementById('filterDropdown').value = category;

            // Highlight the selected category
            document.querySelectorAll('.categoryContainer').forEach(container => {
                container.classList.remove('selectedCategory');
            });
            categoryContainer.classList.add('selectedCategory');
        });

        categoriesContainer.appendChild(categoryContainer);
    });

    updateProductCount();
}

function deleteCategory(category, index) {
    const confirmation = confirm(`Sigur doriți să ștergeți categoria "${category}" și toate produsele din ea?`);
    if (confirmation) {
        // Remove the category
        categories.splice(index, 1);
        saveCategoriesToJSON();

        // Remove all products in the category
        products = products.filter(product => product.category !== category);
        saveProductsToJSON();

        // Update the UI
        updateCategories();
        displayAllProducts();
        populateFilterDropdown(); // Update filter dropdown

        // Refresh the page
        location.reload();
    }
}

function saveCategoriesToJSON() {
    fetch('save_categories.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categories) // Send updated categories list
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                showNotification("Categorii salvate cu succes în JSON.", "success");
            } else {
                showNotification("Eroare la salvarea categoriilor: " + data.message, "error");
            }
        })
        .catch(error => showNotification('Eroare: ' + error, "error"));
}

function loadCategories() {
    fetch('json/categories.json')
        .then(response => response.json())
        .then(data => {
            categories = data; // Save the categories to the global variable
            updateCategories();
            populateFilterDropdown(); // Update filter dropdown
        })
        .catch(error => console.error('Error loading categories:', error));
}

function populateFilterDropdown() {
    const filterDropdown = document.getElementById('filterDropdown');
    filterDropdown.innerHTML = '<option value="">Toate categoriile</option>'; // Default option

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterDropdown.appendChild(option);
    });

    filterDropdown.addEventListener('change', () => {
        const selectedCategory = filterDropdown.value;
        if (selectedCategory) {
            filterProductsByCategory(selectedCategory);
        } else {
            displayAllProducts();
        }
    });
}
