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

        renderCatalog(productosGlobal);

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
    if (categoria === "todos") {
        renderCatalog(productosGlobal);
        return;
    }

    const filtrados = productosGlobal.filter(p => p.categoria === categoria);
    renderCatalog(filtrados);
}


// Abrir detalle del producto
function goToProduct(id) {
    window.location.href = `producto.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", loadCatalog);
