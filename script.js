// Asumo que esta constante existe en la parte superior de tu script.js
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
    const total = Date.parse(endTime) - Date.parse(new Date());
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
        // Asegura que, si es preventa, se añada con una bandera para el checkout
        cart.push({ ...product, quantity, isPresale: !!product.presaleEndDate });
    }
    saveCart(cart);
}


// =======================================================
// === LÓGICA ESPECÍFICA DE PREVENTAS (PRESALES.HTML) ===
// =======================================================

/**
 * Renderiza una sola tarjeta de gorra de Preventa.
 * @param {object} cap - Objeto de gorra de PresaleCap.
 * @returns {HTMLElement} El elemento div de la tarjeta.
 */
function createPresaleCapCard(cap) {
    const card = document.createElement('div');
    card.className = 'hat-card presale-card'; 

    // Bloque de información de Preventa (Contador y Envío)
    const presaleInfo = document.createElement('div');
    presaleInfo.className = 'presale-info';
    
    const endDate = new Date(cap.presaleEndDate);
    const shippingDate = formatDate(cap.estimatedShippingDate);

    // Renderiza el contador de tiempo restante
    const countdown = document.createElement('p');
    countdown.className = 'countdown-timer';
    countdown.id = `countdown-${cap.id_producto}`;
    
    // Función para actualizar el contador, se llama inmediatamente y luego cada segundo
    const updateCountdown = () => {
        countdown.textContent = `Quedan: ${calculateTimeRemaining(endDate)}`;
        if (Date.parse(endDate) <= Date.parse(new Date())) {
            clearInterval(timerId); // Detiene la cuenta regresiva si ya terminó
            countdown.textContent = '¡PREVENTA FINALIZADA!';
            // Opcional: Deshabilitar el botón de reserva aquí
        }
    };
    
    const timerId = setInterval(updateCountdown, 1000); 
    updateCountdown();

    const shippingInfo = document.createElement('p');
    shippingInfo.className = 'shipping-date';
    shippingInfo.innerHTML = `<i class="fas fa-truck-ramp-box"></i> Envío estimado: <span>${shippingDate}</span>`;
    
    presaleInfo.appendChild(countdown);
    presaleInfo.appendChild(shippingInfo);

    // Contenido de la tarjeta (Imagen, Nombre, Precio)
    card.innerHTML = `
        <img src="${cap.imagenUrl}" alt="${cap.nombre}" class="hat-image">
        <h4 class="hat-name">${cap.nombre}</h4>
        <p class="hat-description">${cap.descripcion}</p>
        <p class="hat-price presale-price">PREVENTA: $${cap.precio.toFixed(2)} MXN</p>
    `;

    // Botón de preventa
    const button = document.createElement('button');
    button.className = 'add-to-cart-btn presale-btn';
    button.textContent = 'Reservar Ahora (Añadir al carrito)';
    button.onclick = () => {
        if (Date.parse(endDate) > Date.parse(new Date())) {
            addToCart(cap);
        } else {
            // Reemplazar con un modal de error si se presiona después de la fecha límite
            console.warn(`Preventa de ${cap.nombre} ha finalizado.`);
        }
    };
    
    card.prepend(presaleInfo);
    card.appendChild(button);

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

        caps.forEach(cap => {
            const card = createPresaleCapCard(cap);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error al cargar las preventas:', error);
        container.innerHTML = '<p class="error-message" style="text-align:center; color:red;">Error al cargar el catálogo de preventas. Intenta más tarde.</p>';
    }
}


// =======================================================
// === LÓGICA DE CATÁLOGO PRINCIPAL (TU CÓDIGO ANTERIOR) ===
// =======================================================

/**
 * Carga el catálogo principal de productos (para services.html o index.html).
 */
async function loadCatalog() {
    const container = document.getElementById("catalog-container");

    container.innerHTML = `
        <div style="text-align:center; color:white;">
            <p>Cargando productos...</p>
        </div>
    `;

    try {
        // CRÍTICO: Usa API_BASE_URL para llamar al endpoint completo
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

        // Si estás en index.html, podrías querer solo un subconjunto, o el total si es el contenedor principal
        container.innerHTML = productos.map(p => `
            <div class="hat-item" onclick="goToProduct('${p.id_producto}')">
                <img src="${p.imagenUrl}" alt="${p.nombre}">
                <h3 class="hat-title">${p.nombre}</h3>
                <p class="hat-price">$${p.precio.toFixed(2)} MXN</p>
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
    } else if (path.includes('services.html') || path.includes('index.html')) {
        // Si estamos en el catálogo o inicio, cargamos el catálogo normal
        loadCatalog();
    } 
    // Aquí puedes añadir lógica para otras páginas como 'cart.html', 'producto.html', etc.
});