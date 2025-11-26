// ===============================================================
// === CONFIGURACIÓN DE API (AJUSTA SEGÚN VERCEL O LOCAL) ========
// ===============================================================
const API_BASE_URL = "https://crownside-final.vercel.app"; 
// Si estás local, usa: "http://localhost:3000"

// ===============================================================
// === CARGAR PRODUCTOS EN services.html ==========================
// ===============================================================
async function loadCatalog() {
    const container = document.getElementById("catalog-container");
    if (!container) return; // Solo aplica en services.html

    container.innerHTML = `<p style="color:white;">Cargando productos...</p>`;

    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const productos = await response.json();

        if (!Array.isArray(productos)) throw new Error("Respuesta inválida");

        container.innerHTML = "";

        productos.forEach(p => {
            const card = document.createElement("div");
            card.classList.add("hat-card");

            card.innerHTML = `
                <img src="${p.imagenUrl}" alt="${p.nombre}">
                <p class="hat-name">${p.nombre}</p>
                <p class="hat-price">$${p.precio} MXN</p>

                <button onclick="goToDetail('${p.id_producto}')">
                    Ver Detalles
                </button>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = `
            <p style="color:white;">❌ Error al cargar productos</p>
            <p style="color:white;">${error}</p>
        `;
    }
}

// Ir al detalle del producto
function goToDetail(id) {
    window.location.href = `producto.html?id=${id}`;
}

// ===============================================================
// === CARGAR DETALLE DEL PRODUCTO EN producto.html ===============
// ===============================================================
async function loadProductDetail() {
    const container = document.getElementById("product-content");
    if (!container) return; // Solo aplica en producto.html

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id) {
        container.innerHTML = `<p style="color:white;">❌ ID de producto no recibido.</p>`;
        return;
    }

    container.innerHTML = `<p style="color:white;">Cargando producto...</p>`;

    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);

        if (!response.ok) throw new Error("Producto no encontrado");

        const p = await response.json();

        container.innerHTML = `
            <div class="product-image-display">
                <img src="${p.imagenUrl}" class="main-product-image" alt="${p.nombre}">
            </div>

            <div class="product-info-details">
                <h2 class="detail-title">${p.nombre}</h2>
                <p class="detail-description">${p.descripcion}</p>
                <p class="detail-price">$<span>${p.precio}</span> MXN</p>
                <p class="product-stock">Stock disponible: ${p.stock}</p>

                <button class="purchase-button" onclick="addToCart('${p.id_producto}')">
                    Agregar al Carrito
                </button>
            </div>
        `;

    } catch (error) {
        container.innerHTML = `
            <h2 style="color:white;">❌ Error al cargar el producto</h2>
            <p style="color:white;">${error}</p>
        `;
    }
}

// ===============================================================
// === CARRITO ================================================
// ===============================================================
function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(id);
    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCounter();
    alert("Producto agregado al carrito 🛒");
}

function updateCartCounter() {
    const counter = document.getElementById("cart-counter");
    if (!counter) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    counter.textContent = cart.length;
}

// ===============================================================
// === INICIALIZACIÓN GENERAL ====================================
// ===============================================================
document.addEventListener("DOMContentLoaded", () => {
    loadCatalog();
    loadProductDetail();
    updateCartCounter();
});
