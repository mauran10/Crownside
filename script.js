// =======================================================
// === 1. DATOS Y LÓGICA DE CARRUSEL AUTOMÁTICO (services.html) ===
// =======================================================

// 🛑 ¡CRÍTICO! DEFINE LA URL DE TU API EN VERCEL AQUÍ.
// CORRECCIÓN: Apuntando directamente a tu dominio de Vercel para evitar el error de localhost:3000.
const API_BASE_URL = 'https://crownside.vercel.app'; 

// 🚨 IMPORTANTE: DEFINE AQUÍ LAS VISTAS DE CADA GORRA 🚨
// Las claves deben coincidir con las 'id_producto' que tienes en MongoDB.
// Asegúrate de que las rutas de las imágenes sean correctas (ej: 'img/nombre_archivo.png').
const hatViews = {
    // Gorra 1: Edición 'El Contable'
    'contable_01': [
        'img/othani_gold1_f.png',    // Vista 1: Frente
        'img/othani_gold2_f.png',    // Vista 2: Lado 
        'img/othani_gold3_f.png'     // Vista 3: Atrás 
    ],
    // Gorra 2: Clásica 'Minimal'
    'minimal_02': [
        'img/minimal_b.png',         
        'img/minimal_b_side.png',    
        'img/minimal_b_back.png'     
    ]
    // AGREGA AQUÍ CADA GORRA ADICIONAL Y SUS VISTAS
};

// Objeto para llevar el seguimiento de la imagen actual (índice 0, 1, 2, etc.)
const hatStates = {}; 

/**
 * Función que cambia la vista de una gorra específica cada cierto intervalo.
 */
function changeHatView(productId) {
    // El ID del elemento IMG en el catálogo será 'img-' + productId
    const imgElement = document.getElementById(`img-${productId}`);
    if (!imgElement) return;

    const vistasEspecificas = hatViews[productId];
    if (!vistasEspecificas || vistasEspecificas.length === 0) {
        return;
    }

    if (hatStates[productId] === undefined) {
        hatStates[productId] = 0;
    }

    let currentIndex = (hatStates[productId] + 1) % vistasEspecificas.length;
    hatStates[productId] = currentIndex;
    
    // Cambia la fuente de la imagen
    imgElement.src = vistasEspecificas[currentIndex];
}

/**
 * Inicia el carrusel automático para todas las gorras.
 */
function startHatCarousels(productIds) {
    const intervalTime = 2000; // Intervalo de 2 segundos (2000ms)

    productIds.forEach(productId => {
        // Inicia el carrusel para cada producto en la lista
        setInterval(() => changeHatView(productId), intervalTime);
    });
}


// =======================================================
// === 2. LÓGICA DE CONEXIÓN Y DETALLES (producto.html) ===
// =======================================================

/**
 * Obtiene la ID del producto de la URL (Usado en producto.html).
 */
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Carga los detalles de UN producto desde el servidor.
 */
async function loadProductDetails() {
    const productId = getProductIdFromUrl();
    if (!productId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        
        if (!response.ok) {
            document.getElementById('detailTitle').textContent = 'Producto no disponible';
            document.getElementById('productDescription').textContent = 'El producto solicitado no existe.';
            return;
        }

        const product = await response.json();
        
        // 🚨 ACTUALIZA LOS ELEMENTOS HTML DE PRODUCTO.HTML 🚨
        document.getElementById('detailTitle').textContent = product.nombre; 
        document.getElementById('productDescription').textContent = product.descripcion; 
        
        document.getElementById('productImage').src = product.imagenUrl;
        document.getElementById('productImage').alt = product.nombre;

        // Guarda la información para el botón de 'Agregar al Carrito'.
        const cartButton = document.getElementById('addToCartButton');
        if (cartButton) {
            cartButton.dataset.id = product.id_producto;
            cartButton.dataset.name = product.nombre;
            // El precio es necesario para el carrito.
            cartButton.dataset.price = product.precio; 
        }

    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        document.getElementById('detailTitle').textContent = 'Error de conexión';
        document.getElementById('productDescription').textContent = 'No se pudo cargar la información del servidor. ¿Está el servidor activo y la base de datos conectada?';
    }
}


// =====================================================
// === 3. LÓGICA DE CATÁLOGO (services.html) ===
// =====================================================

/**
 * Función que crea la tarjeta de presentación de cada gorra.
 */
function createProductCard(product) {
    // Usamos tus clases CSS para mantener el diseño
    return `
        <div class="hat-item">
            <img id="img-${product.id_producto}" src="${product.imagenUrl}" alt="${product.nombre}"> 
            <h4 class="hat-title">${product.nombre}</h4>
            <p class="hat-description">${product.descripcion}</p>
            
            <div class="purchase-button-container">
                <a href="producto.html?id=${product.id_producto}" class="purchase-button">Ver mas</a>
            </div>
        </div>
    `;
}

/**
 * Carga todos los productos desde el servidor y los inserta en el catálogo (services.html).
 */
async function loadCatalog() {
    const catalogContainer = document.getElementById('catalog-container');
    if (!catalogContainer) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error('No se pudo cargar el catálogo. (Server status: ' + response.status + ')');

        const products = await response.json();
        
        let htmlContent = '';
        const productIdsToStartCarousel = []; 

        products.forEach(product => {
            htmlContent += createProductCard(product);
            // Si la gorra tiene vistas definidas, la añadimos para el carrusel
            if (hatViews[product.id_producto]) {
                productIdsToStartCarousel.push(product.id_producto);
            }
        });

        catalogContainer.innerHTML = htmlContent;
        
        // 🚨 INICIA EL CARRUSEL 🚨
        startHatCarousels(productIdsToStartCarousel);

    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        catalogContainer.innerHTML = '<p class="error-message">Error al conectar con la base de datos o el servidor no está corriendo. Revisa la consola para detalles.</p>';
    }
}


// =====================================================
// === 4. LÓGICA DE CARRITO (USANDO localStorage) ===
// =====================================================

function getCart() {
    const cart = localStorage.getItem('shoppingCart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

function showCustomMessage(message) {
    const container = document.body;
    const msgElement = document.createElement('div');
    msgElement.textContent = message;
    msgElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #333;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-family: 'Inter', sans-serif;
        font-size: 16px;
    `;
    container.appendChild(msgElement);
    
    setTimeout(() => {
        msgElement.remove();
    }, 2000);
}

function addToCart(productId, name, price, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, name, price, quantity });
    }

    saveCart(cart);
    showCustomMessage(`"${name}" agregado al carrito.`);
}

function handleAddToCartClick(event) {
    const button = event.target.closest('#addToCartButton');
    if (!button) return;

    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);

    if (id && name && !isNaN(price)) {
        addToCart(id, name, price);
    } else {
        showCustomMessage('Error: Datos del producto no cargados.');
    }
}

/** Renderiza la lista de productos y el resumen de pago */
function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    let subtotal = 0;
    
    if (!container || !summary) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío. ¡Empieza a agregar preventas!</p>';
        summary.innerHTML = '';
        return;
    }

    let itemsHtml = '';
    cart.forEach(item => {
        // Asumiendo que el precio es un número y la cantidad también
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHtml += `
            <div class="cart-item-card">
                <div class="item-info">
                    <p class="item-name">${item.name}</p>
                    <p class="item-price-unit">Precio Unitario: $${item.price.toFixed(2)} MXN</p>
                </div>
                <div class="item-controls">
                    <button class="quantity-button decrease" data-id="${item.id}">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-button increase" data-id="${item.id}">+</button>
                    <button class="remove-button" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
                <div class="item-total">
                    Total: $${itemTotal.toFixed(2)} MXN
                </div>
            </div>
        `;
    });

    container.innerHTML = itemsHtml;
    
    // Renderizado del resumen (Total)
    summary.innerHTML = `
        <h4 class="summary-title">Resumen del Pedido</h4>
        <p>Subtotal: <span>$${subtotal.toFixed(2)} MXN</span></p>
        <p>Envío: <span>GRATIS</span></p>
        <h3 class="total-price">Total a Pagar: <span>$${subtotal.toFixed(2)} MXN</span></h3>
        <button id="checkoutButton" class="buy-button large-button">
            Proceder al Checkout (WhatsApp)
        </button>
    `;

    // Agregar listeners a los botones de control (aumentar/disminuir/eliminar)
    addCartControlListeners();
}

/** Modifica la cantidad de un producto en el carrito */
function updateQuantity(productId, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;

        // Si la cantidad llega a cero, eliminar el producto
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }

    saveCart(cart);
    renderCart(); // Vuelve a renderizar el carrito
}

/** Elimina un producto por completo del carrito */
function removeCartItem(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    
    saveCart(cart);
    renderCart(); // Vuelve a renderizar el carrito
}

/** Genera el enlace de WhatsApp con el resumen del pedido */
function generateWhatsappLink() {
    const cart = getCart();
    if (cart.length === 0) return showCustomMessage('El carrito está vacío.'); 

    let message = '¡Hola! Me gustaría hacer un pedido de Crownside:\n\n';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        message += `* ${item.quantity}x ${item.name} ($${item.price.toFixed(2)} c/u)\n`;
    });

    message += `\nSubtotal: $${subtotal.toFixed(2)} MXN`;
    message += `\nEnvío: GRATIS`;
    message += `\n*TOTAL FINAL: $${subtotal.toFixed(2)} MXN*\n\n`;
    message += 'Por favor, confírmame los detalles y el proceso de pago.';

    // Codificar el mensaje y el número (REEMPLAZA ESTE NÚMERO CON EL TUYO)
    const whatsappNumber = '5218123456789'; // Ejemplo: Cambia esto por tu número
    const encodedMessage = encodeURIComponent(message);
    
    const url = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
    
    window.open(url, '_blank');
}


// =====================================================
// === 5. INICIALIZACIÓN (PUNTO DE ENTRADA) ===
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en la página de catálogo (services.html)
    if (document.body.classList.contains('services-page')) {
        loadCatalog(); 
    }
    
    // Si estamos en la página de detalles del producto (producto.html)
    if (document.body.classList.contains('product-page')) {
        loadProductDetails();
    }

    // 🚨 Si estamos en la página de carrito (cart.html)
    if (document.body.classList.contains('cart-page')) {
        renderCart(); 
    }
    
    // Añadir listener para el botón de Agregar al Carrito (Disponible en producto.html)
    const cartButton = document.getElementById('addToCartButton');
    if (cartButton) {
        cartButton.addEventListener('click', handleAddToCartClick);
    }
});