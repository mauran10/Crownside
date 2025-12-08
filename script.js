const API_BASE_URL = 'https://crownside.vercel.app/api'; 
const CART_STORAGE_KEY = 'crownsideCart';

// =======================================================
// === FUNCIONES DE UTILIDAD PARA PREVENTAS (FECHAS) ===
// =======================================================

/**
 * Calcula el tiempo restante hasta una fecha.
 * @param {Date} endTime - La fecha de finalización.
 * @returns {string} Tiempo restante formateado.
 */
function calculateTimeRemaining(endTime) {
    // Convierte la fecha final a milisegundos
    const total = Date.parse(endTime) - Date.parse(new Date());
    
    // Si la preventa ha terminado (o el tiempo es negativo), retorna un mensaje
    if (total <= 0) return 'Finalizada';

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Formatea una fecha para ser legible.
 * @param {Date} dateString - La fecha en formato ISO.
 * @returns {string} Fecha formateada.
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}


// =======================================================
// === FUNCIONES DE CARRITO ===
// =======================================================

function getCart() {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCounter();
}

function updateCartCounter() {
    const cart = getCart();
    const counterElement = document.getElementById('cart-counter');
    if (counterElement) {
        // Suma las cantidades de todos los ítems en el carrito
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        counterElement.textContent = totalItems.toString();
    }
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id_producto === product.id_producto);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        // Añade el producto al carrito. La bandera isPresale es útil para la lógica de checkout/envío.
        cart.push({ ...product, quantity, isPresale: !!product.presaleEndDate });
    }
    saveCart(cart);
}


// =======================================================
// === LÓGICA ESPECÍFICA DE PREVENTAS (PRESALES.HTML) ===
// =======================================================

/**
 * Renderiza una sola tarjeta de gorra de Preventa, usando las clases originales del catálogo.
 * @param {object} cap - Objeto de gorra de PresaleCap.
 * @returns {HTMLElement} El elemento div de la tarjeta.
 */
function createPresaleCapCard(cap) {
    const card = document.createElement('div');
    // CLASE ORIGINAL RESTAURADA
    card.className = 'hat-card'; 

    const endDate = new Date(cap.presaleEndDate);
    let isPresaleActive = Date.parse(endDate) > Date.parse(new Date());

    // --- 1. ETIQUETA DE ESTADO ---
    let statusText = isPresaleActive ? 'PREVENTA ACTIVA' : 'PREVENTA FINALIZADA';
    let statusClass = isPresaleActive ? 'presale-active' : 'presale-ended';
    
    // --- 2. CONTENIDO DE LA TARJETA (Markup del Canvas) ---
    card.innerHTML = `
        <!-- CLASE ORIGINAL RESTAURADA -->
        <div class="hat-image-container">
            <span class="presale-status-tag ${statusClass}">${statusText}</span>
            <!-- CLASE ORIGINAL RESTAURADA -->
            <img 
                src="${cap.imagenUrl || 'https://placehold.co/400x400/CCCCCC/333333?text=NO+IMAGE'}" 
                alt="${cap.nombre}" 
                class="hat-image"
                onerror="this.onerror=null;this.src='https://placehold.co/400x400/CCCCCC/333333?text=Error+Carga';"
            >
        </div>
        <!-- CLASE ORIGINAL RESTAURADA -->
        <div class="hat-details">
            <h4 class="product-name">${cap.nombre}</h4>
            <p class="price">$${cap.precio.toFixed(2)} MXN</p>
            <p class="shipping-date" style="font-size:11px; margin-top:-5px; color:#4A5568;">
                Envío estimado: ${formatDate(cap.estimatedShippingDate)}
            </p>
            
            <!-- Aquí irá el contador de tiempo restante -->
            <p id="countdown-${cap.id_producto}" style="font-size:10px; font-weight:700; color:${isPresaleActive ? '#E53E3E' : '#4A5568'}; margin-bottom: 10px;">
                ${isPresaleActive ? 'Calculando tiempo...' : '¡FINALIZADA!'}
            </p>

            <a href="javascript:void(0)" class="action-button ${!isPresaleActive ? 'disabled-link' : ''}" 
               data-id="${cap.id_producto}"
               data-name="${cap.nombre}"
               data-price="${cap.precio}">
                ${isPresaleActive ? 'RESERVAR AHORA' : 'PRONTO EN INVENTARIO'}
            </a>
        </div>
    `;

    // --- 3. LÓGICA DEL CONTADOR Y EL BOTÓN ---

    const countdownElement = card.querySelector(`#countdown-${cap.id_producto}`);
    const actionButton = card.querySelector('.action-button');
    const statusTag = card.querySelector('.presale-status-tag');


    // Función para actualizar el contador, se llama inmediatamente y luego cada segundo
    const updateCountdown = () => {
        const timeRemaining = calculateTimeRemaining(endDate);
        isPresaleActive = Date.parse(endDate) > Date.parse(new Date());

        countdownElement.textContent = isPresaleActive ? `Quedan: ${timeRemaining}` : '¡PREVENTA FINALIZADA!';
        
        // Si la preventa termina mientras el usuario está viendo, actualiza el estado
        if (timeRemaining === 'Finalizada' && actionButton.textContent === 'RESERVAR AHORA') {
             clearInterval(timerId);
             actionButton.classList.add('disabled-link');
             actionButton.textContent = 'PRONTO EN INVENTARIO';
             statusTag.textContent = 'PREVENTA FINALIZADA';
             statusTag.classList.remove('presale-active');
             statusTag.classList.add('presale-ended');
             countdownElement.style.color = '#4A5568';
        }
    };
    
    // Inicia el contador si está activa
    let timerId;
    if (isPresaleActive) {
        timerId = setInterval(updateCountdown, 1000); 
    }
    updateCountdown();

    // Añade el evento de clic al botón (solo si está activo)
    if (isPresaleActive) {
        actionButton.onclick = () => {
            addToCart(cap);
            // Retroalimentación visual al usuario
            actionButton.textContent = '¡AÑADIDO!';
            setTimeout(() => {
                actionButton.textContent = 'RESERVAR AHORA';
            }, 1000);
        };
    }

    return card;
}

/**
 * Carga los productos de preventa desde el nuevo endpoint de la API y los renderiza.
 */
async function loadPresaleCaps() {
    const container = document.getElementById('catalog-container');
    if (!container) return; 

    // Muestra un mensaje de carga específico
    container.innerHTML = '<p class="loading-message" style="text-align:center; color:#333;">Cargando preventas...</p>';

    try {
        // Llama al nuevo endpoint de preventas
        const response = await fetch(`${API_BASE_URL}/presales`); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const caps = await response.json();

        if (caps.length === 0) {
            container.innerHTML = '<p class="no-data-message" style="text-align:center; color:#333;">¡Aún no hay preventas disponibles! Vuelve pronto.</p>';
            return;
        }

        container.innerHTML = ''; 

        const validCaps = caps.filter(cap => cap.id_producto && cap.nombre && cap.precio && cap.presaleEndDate);

        validCaps.forEach(cap => {
            const card = createPresaleCapCard(cap);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error al cargar las preventas:', error);
        container.innerHTML = '<p class="error-message" style="text-align:center; color:red;">Error al cargar el catálogo de preventas. Intenta más tarde.</p>';
    }
}


// =======================================================
// === LÓGICA DE CATÁLOGO PRINCIPAL (CLASES ORIGINALES) ===
// =======================================================

/**
 * Carga el catálogo principal de productos (para catalogo.html o index.html).
 */
async function loadCatalog() {
    const container = document.getElementById("catalog-container");

    if (!container) return;


    container.innerHTML = `
        <div style="text-align:center; color:white;">
            <p>Cargando productos...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/products`); 

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

        // Usamos las CLASES ORIGINALES (hat-card, hat-image-container, etc.)
        container.innerHTML = productos.map(p => `
            <div class="hat-card" onclick="goToProduct('${p.id_producto}')">
                <div class="hat-image-container">
                    <img 
                        src="${p.imagenUrl || 'https://placehold.co/400x400/CCCCCC/333333?text=NO+IMAGE'}" 
                        alt="${p.nombre}" 
                        class="hat-image"
                        onerror="this.onerror=null;this.src='https://placehold.co/400x400/CCCCCC/333333?text=Error+Carga';"
                    >
                    <!-- Overlay Button for Add to Cart -->
                    <button 
                        class="add-to-cart-btn-overlay" 
                        onclick="event.stopPropagation(); addToCart({id_producto: '${p.id_producto}', nombre: '${p.nombre}', precio: ${p.precio}, imagenUrl: '${p.imagenUrl}'}); this.textContent='¡AÑADIDO!';"
                    >
                        + AGREGAR
                    </button>
                </div>
                <div class="hat-details">
                    <h4>${p.nombre}</h4>
                    <p class="price">$${p.precio.toFixed(2)} MXN</p>
                </div>
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

// =======================================================
// === INICIO DE LA APLICACIÓN (LÓGICA DE RUTEO) ===
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();

    const path = window.location.pathname;
    
    // Ruteo: Ejecuta la función correcta según la página
    if (path.includes('presales.html')) {
        // Si estamos en la página de preventas, cargamos las gorras de preventa
        loadPresaleCaps();
        
    // CORREGIDO: Buscamos "catalogo.html" en lugar de "catalog.html"
    } else if (path.includes('catalogo.html') || path.includes('index.html')) {
        // Si estamos en el catálogo o inicio, cargamos el catálogo normal
        loadCatalog();
    } 
    // Aquí puedes añadir lógica para otras páginas como 'cart.html', 'producto.html', etc.
});

// =======================================================
// === FUNCIÓN DE DETALLE DE PRODUCTO (FRAGEMENTO MANTENIDO) ===
// =======================================================

// Esta es la función que necesitas cambiar para el detalle
async function loadProductDetails(productId) {
    const url = `${API_BASE_URL}/products?id=${productId}`; 
    
    try {
        const response = await fetch(url);
        // ... el resto de tu lógica de manejo de respuesta ...
    } catch (error) {
        console.error("Error al cargar detalles del producto:", error);
    }
}