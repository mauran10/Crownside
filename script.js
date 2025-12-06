// =======================================================
// CARGAR CATÁLOGO DESDE VERCEL
// =======================================================

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

        const productos = await response.json();

        if (productos.length === 0) {
            container.innerHTML = `
                <p style="color:white; text-align:center;">No hay productos disponibles.</p>
            `;
            return;
        }

        container.innerHTML = productos.map(p => `
            <div class="hat-item" onclick="goToProduct('${p.id_producto}')">
                <img src="${p.imagenUrl}" alt="${p.nombre}">
                <h3 class="hat-title">${p.nombre}</h3>
                <p class="hat-price">$${p.precio} MXN</p>
                <button class="purchase-button">Ver más</button>
            </div>
        `).join("");

    } catch (error) {
        container.innerHTML = `
            <div style="color:white; padding:20px;">
                <h3>Error al cargar productos</h3>
                <p>${error}</p>
            </div>
        `;
    }
}

// Abrir detalle del producto
function goToProduct(id) {
    window.location.href = `producto.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", loadCatalog);
