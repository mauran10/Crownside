
// =======================================================
// 🛒 SISTEMA DE CARRITO (LocalStorage)
// =======================================================

// Obtener carrito
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || {};
}

// Guardar carrito
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// 🔥 FUNCIÓN PRINCIPAL DE AGREGAR AL CARRITO
function addToCart(product) {
    const cart = getCart();

    if (cart[product.id]) {
        cart[product.id].quantity += 1;
    } else {
        cart[product.id] = {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1
        };
    }

    saveCart(cart);
    updateCartCounter();
}


// =======================================================
// 🔄 NORMALIZADOR PARA CATÁLOGO + PREVENTAS
// =======================================================
function normalizeProduct(p) {
    return {
        id: p.id || p._id || p.id_producto,
        name: p.name || p.nombre || "Producto sin nombre",
        price: p.price || p.precio || p.precio_preventa || 0,
        image: p.image || p.imagen || p.imagenUrl || p.mainImage || "",

    };
}


// =======================================================
// ➕ AGREGAR AL CARRITO DESDE EL CATÁLOGO
// =======================================================
function addToCartById(idProducto) {
    const p = productosGlobal.find(item => item.id_producto == idProducto);

    if (!p) {
        alert("Error: producto no encontrado");
        return;
    }

    const product = normalizeProduct(p);
    addToCart(product);
}



// =======================================================
// 🧮 CONTADOR DEL ÍCONO DEL CARRITO
// =======================================================
function updateCartCounter() {
    const cart = getCart();
    const total = Object.values(cart).reduce((acc, p) => acc + p.quantity, 0);

    const counter = document.getElementById("cart-counter");
    if (counter) counter.textContent = total > 0 ? total : "";
}



// =======================================================
// 📦 CARGAR CATÁLOGO
// =======================================================
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

        if (!response.ok) throw new Error("Status " + response.status);

        productosGlobal = await response.json();

        // Mostrar gorras primero
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



// =======================================================
// 🎨 RENDER DE CATÁLOGO
// =======================================================
function renderCatalog(lista) {
    const container = document.getElementById("catalog-container");

    if (lista.length === 0) {
        container.innerHTML = `<p style="color:white; text-align:center;">No hay productos disponibles.</p>`;
        return;
    }

    container.innerHTML = lista
        .map(p => {
            const product = normalizeProduct(p);
            return `
                <div class="hat-item">
                    <img src="${product.image}" alt="${product.name}">
                    <h3 class="hat-title">${product.name}</h3>
                    <p class="hat-price">$${product.price} MXN</p>

                    <button class="add-to-cart-btn"
                        onclick="addToCartById('${p.id_producto}')">
                        Agregar al carrito
                    </button>

                    <button class="view-detail-btn"
                        onclick="goToProduct('${p.id_producto}')">
                        Ver producto
                    </button>
                </div>
            `;
        })
        .join("");
}



// =======================================================
// 🔍 FILTRO DEL CATÁLOGO
// =======================================================
function filterCatalog(categoria) {

    document.querySelectorAll(".button_filter").forEach(btn =>
        btn.classList.remove("active")
    );

    const selectedButton = document.querySelector(
        `.button_filter[data-category="${categoria}"]`
    );
    if (selectedButton) selectedButton.classList.add("active");

    if (categoria === "todos") {
        renderCatalog(productosGlobal);
        return;
    }

    const filtrados = productosGlobal.filter(p => p.categoria === categoria);
    renderCatalog(filtrados);
}



// =======================================================
// 🔗 IR A PRODUCTO
// =======================================================
function goToProduct(id) {
    window.location.href = `producto.html?id=${id}`;
}



// =======================================================
// 🛒 RENDER EN cart.html
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

    container.innerHTML = items
        .map(item => `
            <div class="cart-item">
                <img src="${item.image}" class="cart-item-img" alt="${item.name}">

                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p class="price">$${item.price}</p>

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

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    summary.innerHTML = `
        <h3>Total a pagar: <span class="total-price">$${total}</span></h3>
    `;
}



// =======================================================
// ➕➖ CAMBIAR CANTIDAD
// =======================================================
window.changeQuantity = function(id, amount) {
    const cart = getCart();

    if (!cart[id]) return;

    cart[id].quantity += amount;

    if (cart[id].quantity <= 0) delete cart[id];

    saveCart(cart);
    updateCartCounter();
    renderCartPage();
};



// =======================================================
// 🗑 ELIMINAR PRODUCTO
// =======================================================
window.removeFromCart = function(id) {
    const cart = getCart();
    if (cart[id]) delete cart[id];
    saveCart(cart);
    updateCartCounter();
    renderCartPage();
};



// =======================================================
// 🚀 INICIADORES
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    updateCartCounter();
    if (document.getElementById("catalog-container")) loadCatalog();
    if (document.getElementById("cart-items-container")) renderCartPage();
});

