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
    if (!catalogContainer) return; // Si no estamos en la página del catálogo, salimos.

    // Usamos el indicador de carga que ya tenías
    catalogContainer.innerHTML = '<h2>Cargando catálogo...</h2>'; 

    try {
        // Llama al endpoint de catálogo completo
        const url = `${API_BASE_URL}/api/products`; 
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.json().catch(() => ({ message: 'Error de servidor desconocido o formato JSON inválido.' }));
            throw new Error(`No se pudo cargar el catálogo. (Server status: ${response.status}). Mensaje: ${errorText.message}`);
        }

        const products = await response.json();
        
        // ===============================================
        // === NUEVO MANEJO DE CATÁLOGO VACÍO (CRÍTICO) ===
        // ===============================================
        if (products.length === 0) {
            catalogContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; border: 1px solid #ccc; background: #f9f9f9; border-radius: 8px; margin-top: 20px; color: #333;">
                    <h2>¡El Catálogo Está Vacío!</h2>
                    <p>La API se conectó con éxito, pero la base de datos no devolvió ningún producto.</p>
                    <p><strong>ACCIONES:</strong> Asegúrate de que tienes documentos (productos) en tu colección de MongoDB Atlas.</p>
                </div>
            `;
            return;
        }
        // ===============================================

        // Limpiamos el contenedor y empezamos a construir la cuadrícula
        catalogContainer.innerHTML = ''; 
        
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('hat-item');
            
            // Usamos la función goToProductPage al hacer clic en cualquier parte del elemento
            productElement.onclick = () => goToProductPage(product.id_producto);

            // CRÍTICO: Asegúrate de que los nombres de las propiedades coincidan con tu base de datos
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
            <h2>Error al cargar los productos</h2>
            <p>Ocurrió un fallo de red o la API no está respondiendo correctamente.</p>
            <p style="color: red;">Detalles del error: ${error.message}</p>
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
    const detailContainer = document.getElementById('product-detail-container'); // Asumo que tienes un contenedor principal con este ID en producto.html

    if (!productId || !detailContainer) {
        if (detailContainer) {
            detailContainer.innerHTML = '<h2>Error: ID de producto no encontrado.</h2>';
        }
        return;
    }
    
    detailContainer.innerHTML = '<h2>Cargando detalle del producto...</h2>'; // Indicador de carga
    
    try {
        // CRÍTICO: Usa el nuevo endpoint de Serverless con el parámetro ?id=
        const url = `${API_BASE_URL}/api/product-detail?id=${productId}`; 
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.json().catch(() => ({ message: 'Error de servidor desconocido o formato JSON inválido.' }));
            throw new Error(`Producto no encontrado o error en el servidor. (Status: ${response.status}). Mensaje: ${errorText.message}`);
        }

        const product = await response.json();

        // Limpiamos el contenedor y renderizamos el detalle
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
        console.error('Error al cargar detalles del producto:', error);
        detailContainer.innerHTML = `
            <h2>No se pudo cargar el producto.</h2>
            <p>El producto con ID "${productId}" no existe o hubo un error de conexión.</p>
            <p class="error-detail">(Detalles: ${error.message})</p>
        `;
    }
}


// =================================================================
// === INICIO DE LA APLICACIÓN ===
// =================================================================

// Determina qué función ejecutar basándose en la página actual
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.includes('services.html')) {
        loadCatalog();
    } else if (path.includes('producto.html')) {
        loadProductDetails();
    } 
    
    // Aquí podrías añadir otras funciones de inicialización global si las necesitas.
});