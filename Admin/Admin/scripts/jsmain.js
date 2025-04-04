document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadProducts();
    setupSearch();
    setupDragAndDrop(); // Initialize drag-and-drop functionality
});

let categories = [];
let products = []; // Lista de produse
let productCounter = 1; // Counter for unique product IDs
let categoryCounter = 1; // Counter for unique category IDs

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

function updateProductCount() {
    const totalProducts = products.length;
    document.querySelector('h2').textContent = `Produse (${totalProducts})`;
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

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = type;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
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

function selectCategory(category, index) {
    document.getElementById('selectedCategory').textContent = category;
    document.getElementById('itemFormContainer').style.display = 'block';
    document.getElementById('overlay').style.display = 'block'; // Show overlay

    // Reset image paths container
    updateImagePathsContainer([]);

    // Set unique ID based on the highest existing ID in the category
    const categoryProducts = products.filter(product => product.category === category);
    const highestId = categoryProducts.reduce((maxId, product) => {
        const productId = parseFloat(product.id.split('.')[1]);
        return productId > maxId ? productId : maxId;
    }, 0);
    const newProductId = `${index + 1}.${highestId + 1}`;
    document.getElementById('id').textContent = newProductId;

    // Store selected category in local storage
    localStorage.setItem('selectedCategory', category);

    filterProductsByCategory(category); // Filter products by selected category
}

function filterProductsByCategory(category) {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = ''; // Clear previous products

    const filteredProducts = products.filter(product => product.category === category);
    filteredProducts.forEach(product => {
        displayProduct(product); // Display each product in the selected category
    });

    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<p>Nu există produse disponibile în această categorie.</p>';
    }

    // Highlight the selected category in the categoryContainer
    document.querySelectorAll('.categoryContainer').forEach(container => {
        container.classList.remove('selectedCategory');
    });
    const selectedCategoryContainer = Array.from(document.querySelectorAll('.categoryContainer')).find(container => container.querySelector('.categoryName').textContent.includes(category));
    if (selectedCategoryContainer) {
        selectedCategoryContainer.classList.add('selectedCategory');
    }

    // Update product count text
    const totalProducts = products.length;
    const categoryProductCount = filteredProducts.length;
    document.querySelector('h2').textContent = `Produse (${totalProducts}) > ${category} (${categoryProductCount})`;
}

function saveProduct() {
    const id = document.getElementById('id').textContent;
    const name = document.getElementById('name').value.trim();
    let price = document.getElementById('price').value.trim();
    let images = document.getElementById('images').value.split(',').map(img => img.trim().replace(/\\/g, '/')).filter(img => img !== '');
    const category = localStorage.getItem('selectedCategory'); // Use the selected category from local storage
    const description = document.getElementById('description').value.trim();

    if (!name || !price || images.length === 0) {
        alert("Numele produsului, prețul și cel puțin o imagine sunt obligatorii.");
        return;
    }

    if (!price.toLowerCase().includes("mdl")) {
        price = `${price} MDL`;
    }

    const product = {
        id: id,
        name: name,
        price: price,
        images: images,
        category: category,
        description: description
    };

    const isTrending = document.getElementById('isTrending').checked;
    if (isTrending) product.isTrending = isTrending;

    let old_price = document.getElementById('old_price').value.trim();
    if (old_price) {
        if (!old_price.toLowerCase().includes("mdl")) {
            old_price = `${old_price} MDL`;
        }
        product.old_price = old_price;
    }

    const out_Of_stock = document.getElementById('out_Of_stock').checked;
    if (out_Of_stock) product.out_Of_stock = out_Of_stock;

    const isNew = document.getElementById('isNew').checked;
    if (isNew) product.isNew = isNew;

    const product_sizes = document.getElementById('product_sizes').value.split(',').map(size => size.trim()).filter(size => size !== '');
    if (product_sizes.length > 0) {
        product.product_sizes = product_sizes;
    }

    // Ensure product ID is unique and update existing product if found
    const existingProductIndex = products.findIndex(prod => prod.id === id);
    if (existingProductIndex !== -1) {
        products[existingProductIndex] = product;
    } else {
        products.push(product);
    }

    saveProductsToJSON();
    displayAllProducts(); // Refresh UI without refresh  
    resetProductForm();

    if (category) {
        filterProductsByCategory(category);
        // Store selected category in local storage
        localStorage.setItem('selectedCategory', category);
    }

    updateCategories(); // Update category product counts
    updateProductCount(); // Ensure product count is updated

    // Ensure the selected category remains selected
    document.getElementById('filterDropdown').value = category;
}

function loadProducts() {
    fetch('json/products.json')
        .then(response => response.json())
        .then(data => {
            products = data; // Save the products to the global variable
            data.forEach(product => {
                displayProduct(product); // Display each product
            });
            updateProductCount(); // Update total product count
            updateCategories(); // Update category product counts
        })
        .catch(error => console.error('Error loading products:', error));
}

function displayProduct(product) {
    const productsContainer = document.getElementById('productsContainer');

    // Eliminați produsul existent din DOM dacă există
    const existingProduct = document.querySelector(`.product[data-id="${product.id}"]`);
    if (existingProduct) {
        existingProduct.remove();
    }

    // Creați noul element pentru produs
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.setAttribute('data-id', product.id); // Adăugați un atribut pentru identificare
    productDiv.innerHTML = `
        <h3 style="cursor: pointer;" onclick="editProduct('${product.id}')">${product.name}</h3>
        <p>ID: ${product.id}</p>
        <p>Price: ${product.price}</p>
        <p>Description: ${product.description}</p>
        <p>Category: ${product.category}</p>
        <p>Images: ${product.images.join(', ')}</p>
        ${product.isTrending ? '<p>Trending: Yes</p>' : ''}
        ${product.old_price ? `<p>Old Price: ${product.old_price}</p>` : ''}
        ${product.out_Of_stock ? '<p>Out Of Stock: Yes</p>' : ''}
        ${product.isNew ? '<p>New: Yes</p>' : ''}
        ${product.product_sizes ? `<p>Sizes: ${product.product_sizes.join(', ')}</p>` : ''}
        <button class="editButton" onclick="editProduct('${product.id}')">Editează</button>
        <button class="deleteButton" onclick="deleteProduct('${product.id}')">Șterge</button>
    `;

    productsContainer.appendChild(productDiv);
}

function resetProductForm() {
    document.getElementById('productForm').reset(); // Reset all form fields
    document.getElementById('itemFormContainer').style.display = 'none'; // Hide the product form
    document.getElementById('overlay').style.display = 'none'; // Hide overlay
}

function editProduct(productId) {
    const product = products.find(prod => prod.id === productId);
    if (product) {
        document.getElementById('id').textContent = product.id; // Use textContent instead of value
        document.getElementById('name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('images').value = product.images.join(', ');
        document.getElementById('description').value = product.description;
        document.getElementById('old_price').value = product.old_price || '';
        document.getElementById('isTrending').checked = product.isTrending || false;
        document.getElementById('out_Of_stock').checked = product.out_Of_stock || false;
        document.getElementById('isNew').checked = product.isNew || false;
        document.getElementById('product_sizes').value = product.product_sizes ? product.product_sizes.join(', ') : '';

        // Update image paths container
        updateImagePathsContainer(product.images);

        // Update description character count
        updateDescriptionCharCount();

        document.getElementById('itemFormContainer').style.display = 'block'; // Show form for editing
        document.getElementById('overlay').style.display = 'block'; // Show overlay

        // Store selected category in local storage
        localStorage.setItem('selectedCategory', product.category); // Ensure the correct category is stored
    } else {
        alert("Produsul nu a fost găsit.");
    }
}

function updateDescriptionCharCount() {
    const description = document.getElementById('description').value;
    const charCount = description.length;
    const charCountDisplay = document.getElementById('charCountDisplay');
    const descriptionLabel = document.querySelector('label[for="description"]');
    if (charCountDisplay) {
        charCountDisplay.textContent = ` (${charCount}) Char`;
    } else {
        const newCharCountDisplay = document.createElement('span');
        newCharCountDisplay.id = 'charCountDisplay';
        newCharCountDisplay.textContent = ` (${charCount}) Char`;
        if (descriptionLabel) {
            descriptionLabel.appendChild(newCharCountDisplay);
        }
    }
}

document.getElementById('description').addEventListener('input', updateDescriptionCharCount);

function deleteProduct(productId) {
    const confirmation = confirm(`Sigur doriți să ștergeți produsul cu ID: ${productId}?`);
    if (confirmation) {
        // Găsim indexul produsului în array
        const productIndex = products.findIndex(product => product.id === productId);
        if (productIndex !== -1) {
            // Eliminăm produsul din array
            products.splice(productIndex, 1);

            // Salvăm lista actualizată în JSON
            saveProductsToJSON();

            // Eliminăm produsul din DOM
            const productElement = document.querySelector(`.product[data-id="${productId}"]`);
            if (productElement) {
                productElement.remove();
            }

            alert(`Produsul cu ID: ${productId} a fost șters.`);

            // Dacă nu mai există produse, afișăm un mesaj în container
            if (products.length === 0) {
                const productsContainer = document.getElementById('productsContainer');
                productsContainer.innerHTML = '<p>Nu există produse disponibile.</p>';
            }
        } else {
            alert("Produsul nu a fost găsit.");
        }
    }
    displayAllProducts(); // Refresh product display after deleting
    updateCategories(); // Update category product counts
    updateProductCount(); // Ensure product count is updated

    const selectedCategory = document.getElementById('selectedCategory').textContent;
    if (selectedCategory) {
        filterProductsByCategory(selectedCategory);
        // Store selected category in local storage
        localStorage.setItem('selectedCategory', selectedCategory);
    }
}

function saveProductsToJSON() {
    products.forEach(product => {
        product.images = product.images.map(img => img.replace(/\\/g, '/'));
    });

    fetch('save_product.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(products)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                showNotification("Produse salvate cu succes în JSON.", "success");
                displayAllProducts(); // Refresh products without refresh  
                updateCategories(); // Update category product counts
                updateProductCount(); // Ensure product count is updated

                // Ensure the selected category remains selected
                const selectedCategory = localStorage.getItem('selectedCategory');
                if (selectedCategory) {
                    filterProductsByCategory(selectedCategory);
                    document.getElementById('filterDropdown').value = selectedCategory;
                }
            } else {
                showNotification("Eroare la salvarea produselor: " + data.message, "error");
            }
        })
        .catch(error => showNotification('Eroare: ' + error, "error"));
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

function displayAllProducts() {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = ''; // Clear previous products

    products.forEach(product => {
        displayProduct(product); // Display each product
    });

    if (products.length === 0) {
        productsContainer.innerHTML = '<p>Nu există produse disponibile.</p>';
    }

    // Retrieve selected category from local storage and filter products
    const selectedCategory = localStorage.getItem('selectedCategory');
    if (selectedCategory) {
        filterProductsByCategory(selectedCategory);
        document.getElementById('filterDropdown').value = selectedCategory;
    } else {
        document.getElementById('filterDropdown').value = ""; // Set to "Toate categoriile"
        updateProductCount(); // Update total product count
    }
}

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

function addImagePath() {
    const fileInput = document.getElementById('imageFileInput');
    const imagesInput = document.getElementById('images');
    const imagePathsContainer = document.getElementById('imagePathsContainer');
    const file = fileInput.files[0];
    const category = document.getElementById('selectedCategory').textContent.trim(); // Get the selected category

    if (file && category) {
        let filePath;

        // Check if webkitRelativePath is available (useful for directory uploads)
        if (file.webkitRelativePath) {
            filePath = file.webkitRelativePath;
        } else {
            // Manually construct the full path within 'images/'
            let fileName = file.name;
            let fullPath = fileInput.value.replace(/^.*[\\\/]/, ''); // Extracts the relative path
            filePath = `images/Catalog/${category}/${fullPath}`;
        }

        // Add to input only if not already present
        const currentImages = imagesInput.value ? imagesInput.value.split(', ').map(img => img.trim()) : [];
        if (!currentImages.includes(filePath)) {
            currentImages.push(filePath);
        }

        imagesInput.value = currentImages.join(', ');
        updateImagePathsContainer(currentImages);
    }
}

function updateImagePathsContainer(imagePaths) {
    const imagePathsContainer = document.getElementById('imagePathsContainer');
    imagePathsContainer.innerHTML = ''; // Clear previous paths

    imagePaths.forEach((path, index) => {
        const pathDiv = document.createElement('div');
        pathDiv.className = 'imagePath';
        pathDiv.setAttribute('draggable', true);
        pathDiv.dataset.index = index;

        const pathText = document.createElement('span');
        pathText.className = 'pathText';
        pathText.textContent = path;

        const iconContainer = document.createElement('div');
        iconContainer.className = 'iconContainer';

        const dragIcon = document.createElement('span');
        dragIcon.className = 'dragIcon';
        dragIcon.textContent = '↕️';

        const editIcon = document.createElement('span');
        editIcon.className = 'editIcon';
        editIcon.textContent = '✏️';
        editIcon.onclick = () => editImagePath(index);

        const deleteIcon = document.createElement('span');
        deleteIcon.className = 'deleteIcon';
        deleteIcon.textContent = '❌';
        deleteIcon.onclick = () => deleteImagePath(index);

        iconContainer.appendChild(dragIcon);
        iconContainer.appendChild(editIcon);
        iconContainer.appendChild(deleteIcon);
        pathDiv.appendChild(pathText);
        pathDiv.appendChild(iconContainer);
        imagePathsContainer.appendChild(pathDiv);
    });

    // Update the image count display
    const imagesLabel = document.querySelector('label[for="images"]');
    if (imagesLabel) {
        imagesLabel.textContent = `Imagini (${imagePaths.length})`;
    }

    setupDragAndDrop(); // Reinitialize drag-and-drop events
}

function editImagePath(index) {
    const fileInput = document.getElementById('imageFileInput');
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        const category = document.getElementById('selectedCategory').textContent.trim(); // Get the selected category
        if (file && category) {
            // Construct the file path with category
            const filePath = `images/Catalog/${category}/${file.name}`;
            const imagesInput = document.getElementById('images');
            let currentImages = imagesInput.value ? imagesInput.value.split(', ').map(img => img.trim()) : [];
            currentImages[index] = filePath; // Update the image path at the specified index
            imagesInput.value = currentImages.join(', ');
            updateImagePathsContainer(currentImages);
        }
        fileInput.onchange = addImagePath; // Reset the onchange handler
    };
    fileInput.click(); // Trigger the file input click
}

function deleteImagePath(index) {
    const imagesInput = document.getElementById('images');
    let currentImages = imagesInput.value ? imagesInput.value.split(', ').map(img => img.trim()) : [];
    currentImages.splice(index, 1); // Remove the image path at the specified index
    imagesInput.value = currentImages.join(', ');
    updateImagePathsContainer(currentImages);
}

function setupDragAndDrop() {
    const imagePathsContainer = document.getElementById('imagePathsContainer');
    imagePathsContainer.addEventListener('dragstart', handleDragStart);
    imagePathsContainer.addEventListener('dragover', handleDragOver);
    imagePathsContainer.addEventListener('drop', handleDrop);
}

function handleDragStart(event) {
    if (event.target.classList.contains('imagePath')) {
        event.dataTransfer.setData('text/plain', event.target.dataset.index);
        event.target.classList.add('dragging');
    }
}

function handleDragOver(event) {
    event.preventDefault();
    const draggingElement = document.querySelector('.dragging');
    const targetElement = event.target.closest('.imagePath');
    if (targetElement && targetElement !== draggingElement) {
        const imagePathsContainer = document.getElementById('imagePathsContainer');
        const draggingIndex = parseInt(draggingElement.dataset.index, 10);
        const targetIndex = parseInt(targetElement.dataset.index, 10);
        if (draggingIndex < targetIndex) {
            imagePathsContainer.insertBefore(draggingElement, targetElement.nextSibling);
        } else {
            imagePathsContainer.insertBefore(draggingElement, targetElement);
        }
    }
}

function handleDrop(event) {
    event.preventDefault();
    const draggingElement = document.querySelector('.dragging');
    draggingElement.classList.remove('dragging');
    updateImagePathsOrder();
}

function updateImagePathsOrder() {
    const imagePathsContainer = document.getElementById('imagePathsContainer');
    const imagePaths = Array.from(imagePathsContainer.querySelectorAll('.imagePath .pathText')).map(pathSpan => pathSpan.textContent.trim());
    document.getElementById('images').value = imagePaths.join(', ');
}