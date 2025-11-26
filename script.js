// Asegúrate de que esta URL sea la de tu proyecto desplegado.
const API_BASE_URL = 'https://crownside.vercel.app'; 

// =================================================================
// === UTILIDADES ===
// =================================================================

/**
 * Obtiene el ID del producto de la URL (ej. de ?id=contable_01)
 * @returns {string | null} El ID del producto o null si no se encuentra.
 */
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Navega a la página de detalle del producto, pasando el ID como parámetro.
 * @param {string} productId - El ID único del producto.
 */
function goToProductPage(productId) {
    window.location.href = `producto.html?id=${productId}`;
}

// =================================================================
// === FUNCIÓN PARA LA PÁGINA DE CATÁLOGO (services.html) ===
// =================================================================

/**
 * Carga todos los productos desde la API y los renderiza en la cuadrícula.
 */
async function loadCatalog() {
    const catalogContainer = document.getElementById('catalog-container');
    if (!catalogContainer) return;

    catalogContainer.innerHTML = '<h2>Cargando catálogo...</h2>'; 

    try {
        const url = `${API_BASE_URL}/api/products`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.json().catch(() => ({ message: 'Error JSON o servidor desconocido.' }));
            throw new Error(`No se pudo cargar catálogo. Status: ${response.status}. Mensaje: ${errorText.message}`);
        }

        const products = await response.json();

        if (products.length === 0) {
            catalogContainer.innerHTML = `
                <div style="text-align:center;padding:40px;border:1px solid #ccc;background:#f9f9f9;border-radius:8px;margin-top:20px;">
                    <h2>¡El catálogo está vacío!</h2>
                    <p>La API funciona, pero no hay productos en MongoDB.</p>
                </div>
            `;
            return;
        }

        catalogContainer.innerHTML = '';

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('hat-item');

            productElement.onclick = () => goToProductPage(product.id_producto);

            productElement.innerHTML = `
                <img src="${product.imagenUrl}" alt="${product.nombre}">
                <h3 class="hat-title">${product.nombre}</h3>
                <p class="hat-description">${product.descripcion.substring(0, 50)}...</p>
                <p class="hat-price">$${product.precio.toFixed(2)} MXN</p>
                <button class="purchase-button">Ver más</button>
            `;

            catalogContainer.appendChild(productElement);
        });

    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        catalogContainer.innerHTML = `
            <h2>Error al cargar productos</h2>
            <p>${error.message}</p>
        `;
    }
}

// =================================================================
// === FUNCIÓN PARA LA PÁGINA DE DETALLE (producto.html) ===
// =================================================================

/**
 * Carga un producto específico por ID y lo renderiza.
 */
async function loadProductDetails() {
    const productId = getProductIdFromUrl();
    const detailContainer = document.getElementById('product-detail-container');

    if (!productId || !detailContainer) {
        if (detailContainer) {
            detailContainer.innerHTML = '<h2>Error: ID de producto no encontrado.</h2>';
        }
        return;
    }

    detailContainer.innerHTML = '<h2>Cargando detalle del producto...</h2>';

    try {
        // EL ENDPOINT CORRECTO
        const url = `${API_BASE_URL}/api/products/${productId}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.json().catch(() => ({ message: 'Error JSON o servidor desconocido.' }));
            throw new Error(`Error al obtener producto. Status: ${response.status}. Mensaje: ${errorText.message}`);
        }

        const product = await response.json();

        detailContainer.innerHTML = `
            <div class="detail-content">
                <div class="image-section">
                    <img src="${product.imagenUrl}" alt="${product.nombre}">
                </div>
                <div class="info-section">
                    <h1 class="product-title">${product.nombre}</h1>
                    <p class="product-price">$${product.precio.toFixed(2)} MXN</p>
                    <p class="product-stock">Disponibilidad: ${product.stock > 0 ? 'En Stock' : 'Agotado'}</p>
                    <div class="product-description">
                        <h2>Descripción</h2>
                        <p>${product.descripcion}</p>
                    </div>
                    <button class="add-to-cart-button">Añadir al Carrito</button>
                    <button onclick="window.location.href='services.html'" class="back-button">
                        ← Volver al Catálogo
                    </button>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error al cargar detalles:', error);
        detailContainer.innerHTML = `
            <h2>No se pudo cargar el producto</h2>
            <p>${error.message}</p>
        `;
    }
}

// =================================================================
// === INICIO DE LA APLICACIÓN ===
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('services.html')) {
        loadCatalog();
    } else if (path.includes('producto.html')) {
        loadProductDetails();
    }
});
