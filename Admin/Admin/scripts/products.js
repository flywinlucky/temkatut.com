let products = []; // Lista de produse

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

function updateProductCount() {
    const totalProducts = products.length;
    document.querySelector('h2').textContent = `Produse (${totalProducts})`;
}
