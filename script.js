// =======================================================
// === 1. Cargar productos en el Catálogo (services.html) ===
// =======================================================

async function loadCatalog() {
    const grid = document.getElementById("catalog-grid");
    if (!grid) return; // Evita errores si no estamos en services.html

    try {
        const res = await fetch("https://crownside-backend.vercel.app/api/products");

        if (!res.ok) {
            throw new Error("Error al obtener productos: " + res.status);
        }

        const productos = await res.json();
        grid.innerHTML = "";

        productos.forEach(prod => {
            grid.innerHTML += `
                <div class="product-card">
                    <img src="${prod.imagenUrl}" alt="${prod.nombre}">
                    <h3 class="product-name">${prod.nombre}</h3>
                    <p class="product-description">${prod.descripcion}</p>
                    <p class="product-price">$${prod.precio} MXN</p>
                    <button onclick="addToCart('${prod.id_producto}')">Agregar al carrito</button>
                </div>
            `;
        });

    } catch (err) {
        console.error("Error cargando catálogo:", err);
        grid.innerHTML = `
            <p style="color:red; text-align:center;">
                ❌ Error al cargar el catálogo.
            </p>
        `;
    }
}


// =======================================================
// === 2. Mostrar producto individual (product.html) ===
// =======================================================

async function loadProduct() {
    const container = document.getElementById("product-detail");
    if (!container) return; // Evita errores si no estamos en product.html

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        container.innerHTML = "<p>Producto no encontrado.</p>";
        return;
    }

    try {
        const res = await fetch(`https://crownside-backend.vercel.app/api/products/${id}`);

        if (!res.ok) {
            throw new Error("Error al obtener producto: " + res.status);
        }

        const prod = await res.json();

        container.innerHTML = `
            <div class="product-detail-card">
                <img src="${prod.imagenUrl}" alt="${prod.nombre}">
                
                <h2>${prod.nombre}</h2>

                <p>${prod.descripcion}</p>

                <p class="product-price">$${prod.precio} MXN</p>

                <p class="product-stock">Stock disponible: ${prod.stock}</p>

                <button onclick="addToCart('${prod.id_producto}')">
                    Agregar al Carrito
                </button>

                <a href="services.html" class="back-button">
                    <i class="fas fa-arrow-left"></i> Volver al Catálogo
                </a>
            </div>
        `;

    } catch (err) {
        console.error("Error cargando producto:", err);

        container.innerHTML = `
            <p style="color:red;">
                ❌ Error al cargar la información del producto.
            </p>
        `;
    }
}


// =======================================================
// === 3. Carrito (localStorage) ===
// =======================================================

function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Verificar si ya existe en el carrito
    const exists = cart.find(p => p.id === id);

    if (exists) {
        exists.quantity += 1;
    } else {
        cart.push({ id: id, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCounter();

    alert("Producto agregado al carrito 🛒");
}

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const counter = document.getElementById("cart-counter");

    if (counter) {
        const total = cart.reduce((sum, p) => sum + p.quantity, 0);
        counter.textContent = total;
    }
}

updateCartCounter();


// =======================================================
// === 4. Inicializar funciones según la página ===
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
    loadCatalog();
    loadProduct();
});
