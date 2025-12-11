
// =======================================================
// 🛒 SISTEMA DE CARRITO (LocalStorage)
// =======================================================

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || {};
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();

    if (cart[product.id]) {
        cart[product.id].quantity++;
    } else {
        cart[product.id] = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        };
    }

    saveCart(cart);
    updateCartCounter();
}

function updateCartCounter() {
    const cart = getCart();
    const total = Object.values(cart).reduce((acc, p) => acc + p.quantity, 0);

    const counter = document.getElementById("cart-counter");
    if (counter) counter.textContent = total > 0 ? total : "";
}


let productosGlobal = [];

async function loadCatalog() {
    const container = document.getElementById("catalog-container");

    container.innerHTML = `
        <div style="text-align:center; color:white;">
            <p>Cargando productos...</p>
        </div>
    `;

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Status " + response.status);
        }

        productosGlobal = await response.json();

        // Mostrar solo gorras al iniciar
        filterCatalog("gorra");

    } catch (error) {
        container.innerHTML = `
            <div style="color:white; padding:20px;">
                <h3>Error al cargar productos</h3>
                <p>${error}</p>
            </div>
        `;
    }
}

function renderCatalog(lista) {
    const container = document.getElementById("catalog-container");

    if (lista.length === 0) {
        container.innerHTML = `<p style="color:white; text-align:center;">No hay productos disponibles.</p>`;
        return;
    }

    container.innerHTML = lista.map(p => `
        <div class="hat-item" onclick="goToProduct('${p.id_producto}')">
            <img src="${p.imagenUrl}" alt="${p.nombre}">
            <h3 class="hat-title">${p.nombre}</h3>
            <p class="hat-price">$${p.precio} MXN</p>
        </div>
    `).join("");
}

function filterCatalog(categoria) {

    // Quitar "active" de todos
    document.querySelectorAll(".button_filter").forEach(btn => {
        btn.classList.remove("active");
    });

    // Agregar "active" al seleccionado
    const selectedButton = document.querySelector(`.button_filter[data-category="${categoria}"]`);
    if (selectedButton) {
        selectedButton.classList.add("active");
    }

    // Mostrar todo
    if (categoria === "todos") {
        renderCatalog(productosGlobal);
        return;
    }

    // Filtrar por categoría
    const filtrados = productosGlobal.filter(p => p.categoria === categoria);
    renderCatalog(filtrados);
}

// Abrir detalle del producto
function goToProduct(id) {
    window.location.href = `producto.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("catalog-container")) {
        loadCatalog();
    }
});


// =======================================================
// 📌 MOSTRAR CARRITO EN cart.html
// =======================================================

function renderCartPage() {
    const container = document.getElementById("cart-items-container");
    const summary = document.getElementById("cart-summary");

    if (!container || !summary) return; 

    const cart = getCart();
    const items = Object.values(cart);

    if (items.length === 0) {
        container.innerHTML = `<p class="empty-cart">🛒 Tu carrito está vacío.</p>`;
        summary.innerHTML = "";
        return;
    }


    

    // HTML de productos del carrito
   container.innerHTML = items
        .map(item => `
            <div class="cart-item">
                <img src="${item.image || 'img/placeholder.png'}" class="cart-item-img" alt="${item.name || 'Producto Desconocido'}">
                
                <div class="cart-item-info">
                    <h3>${item.name || 'Producto Desconocido'}</h3>
                    <p class="cart-price">$${(item.price || 0).toFixed(2)}</p>

                    <div class="quantity-control">
                        <button onclick="changeQuantity('${item.id}', -1)" class="qty-btn">-</button>
                        <span class="qty">${item.quantity}</span>
                        <button onclick="changeQuantity('${item.id}', 1)" class="qty-btn">+</button>
                    </div>

                    <button onclick="removeFromCart('${item.id}')" class="remove-btn">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `)
        .join("");

    // SUMATORIA DEL TOTAL (Asegurando que el precio no sea nulo)
    const total = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

    summary.innerHTML = `
        <h3>Total a pagar: <span class="total-price">$${total.toFixed(2)}</span></h3>
    `;
}

// =======================================================
//  CAMBIAR CANTIDAD
// =======================================================
window.changeQuantity = function (id, amount) {
    const cart = getCart();

    if (!cart[id]) return;

    cart[id].quantity += amount;

    if (cart[id].quantity <= 0) delete cart[id];

    saveCart(cart);
    updateCartCounter();
    renderCartPage();
};

// =======================================================
//  ELIMINAR PRODUCTO
// =======================================================
window.removeFromCart = function (id) {
    const cart = getCart();

    if (cart[id]) delete cart[id];

    saveCart(cart);
    updateCartCounter();
    renderCartPage();
};

// =======================================================
//  AUTO-CARGA DEL CARRITO EN cart.html
// =======================================================
document.addEventListener("DOMContentLoaded", renderCartPage);
