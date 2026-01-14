
const API_URL = "https://crownside-backend-2025-pxtp.vercel.app";


// =======================================================
// 🛒 SISTEMA DE CARRITO (LocalStorage)
// =======================================================

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || {};
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();

    if (cart[product.id]) {
        cart[product.id].quantity++;
    } else {
        cart[product.id] = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,

            // 🔥 PREVENTA
            type: product.type || "normal",
            releaseDate: product.releaseDate || null
        };
    }

    saveCart(cart);
    updateCartCounter();
}


function updateCartCounter() {
    const cart = getCart();
    const total = Object.values(cart).reduce((acc, p) => acc + p.quantity, 0);

    const counter = document.getElementById("cart-counter");
    if (counter) counter.textContent = total > 0 ? total : "";
}

// =======================================================
// 📦 CATÁLOGO
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
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) throw new Error("Status " + response.status);

        productosGlobal = await response.json();

       // FILTRAR GORRAS PRIMERO
        const gorras = productosGlobal.filter(
            p => p.categoria === "gorra"
        );

        //  SOLO GORRAS AL ABRIR
        renderCatalog(gorras);

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
            <div class="hat-image-container">
                <img src="${p.imagenUrl}" alt="${p.nombre}">
            </div>
            
            <h3 class="hat-title">${p.nombre}</h3>
            <p class="hat-price">$${p.precio} MXN</p>
        </div>
    `).join("");
}


function filterCatalog(categoria) {
    document.querySelectorAll(".button_filter").forEach(btn => {
        btn.classList.remove("active");
    });

    const selectedButton = document.querySelector(`.button_filter[data-category="${categoria}"]`);
    if (selectedButton) selectedButton.classList.add("active");

    if (categoria === "todos") {
        renderCatalog(productosGlobal);
        return;
    }

    const filtrados = productosGlobal.filter(p => p.categoria === categoria);
    renderCatalog(filtrados);
}

function goToProduct(id) {
    window.location.href = `producto.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("catalog-container")) {
        loadCatalog();
    }
});

// =======================================================
// MOSTRAR CARRITO (cart.html)
// =======================================================

function renderCartPage() {
    const container = document.getElementById("cart-items-container");
    const summary = document.getElementById("cart-summary");

    if (!container || !summary) return;

    const cart = getCart();
    const items = Object.values(cart);
    const today = new Date(); 

    if (items.length === 0) {
        container.innerHTML = `<p class="empty-cart">Tu carrito está vacío.</p>`;
        summary.innerHTML = "";
        return;
    }

    container.innerHTML = items.map(item => {
        const isPresale = item.type === "preventa" && item.releaseDate;
        const releaseDate = isPresale ? new Date(item.releaseDate) : null;
        const blocked = isPresale && today < releaseDate;

        return `
            <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image || 'img/placeholder.png'}" class="cart-item-img">
            </div>
                <div class="cart-item-info">
                    <h3>
                        ${item.name}
                        ${isPresale ? `<span style="color:red;font-size:12px;">(Preventa)</span>` : ""}
                    </h3>

                    <p class="cart-price">$${item.price.toFixed(2)}</p>

                    ${
                        blocked
                            ? `<p style="color:red;font-size:13px;">
                                Disponible a partir del ${releaseDate.toLocaleDateString()}
                              </p>`
                            : ""
                    }

                    <div class="quantity-control">
                        <button onclick="changeQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity('${item.id}', 1)">+</button>
                    </div>

                    <button onclick="removeFromCart('${item.id}')" class="remove-btn">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join("");

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    summary.innerHTML = `
        <h3>Total a pagar: <span class="total-price">$${total.toFixed(2)}</span></h3>
    `;
}


window.changeQuantity = function (id, amount) {
    const cart = getCart();
    if (!cart[id]) return;

    cart[id].quantity += amount;
    if (cart[id].quantity <= 0) delete cart[id];

    saveCart(cart);
    updateCartCounter();
    renderCartPage();
};

window.removeFromCart = function (id) {
    const cart = getCart();
    delete cart[id];

    saveCart(cart);
    updateCartCounter();
    renderCartPage();
};

document.addEventListener("DOMContentLoaded", renderCartPage);

// =======================================================
// ✉️ COMPRA POR CORREO (EMAILJS)
// =======================================================

// INICIALIZA EMAILJS
emailjs.init("Pyo8AGn4gqKjgOFO0");

document.getElementById("checkout-form")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const cart = getCart();
    const items = Object.values(cart);
    const today = new Date();

    const blockedPresale = items.find(item =>
        item.type === "preventa" &&
        item.releaseDate &&
        new Date(item.releaseDate) > today
    );

    if (blockedPresale) {
        alert(`⛔ La preventa "${blockedPresale.name}" estará disponible el ${new Date(blockedPresale.releaseDate).toLocaleDateString()}`);
        return;
    }

    if (items.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    let productos = "";
    let total = 0;

    items.forEach(item => {
        productos += `${item.name} x${item.quantity} - $${item.price}\n`;
        total += item.price * item.quantity;
    });

    const data = {
        name: this.name.value,
        email: this.email.value,
        phone: this.phone.value,
        address: this.address.value,
        products: productos,
        total: `$${total} MXN`
    };

    emailjs.send(
        "service_4a8n179",
        "template_hpshzpj",
        data
    ).then(() => {
        alert("✅ Compra enviada. Revisa tu correo.");
        localStorage.removeItem("cart");
        window.location.href = "index.html";
    }).catch(err => {
        alert("❌ Error al enviar pedido");
        console.error(err);
    });
});

/* =========================================
    PAYPAL + BACKEND + EMAILJS
========================================= */

function getCartTotalAmount() {
    const cart = getCart();
    return Object.values(cart)
        .reduce((acc, item) => acc + item.price * item.quantity, 0)
        .toFixed(2);
}

function getCartProductsText() {
    const cart = getCart();
    return Object.values(cart)
        .map(item => `${item.name} x${item.quantity} - $${item.price}`)
        .join("\n");
}


let backendOrderId = null;

paypal.Buttons({
    createOrder: function (data, actions) {
        const total = getCartTotalAmount();

        if (!total || total <= 0) {
            alert("Tu carrito está vacío");
            return;
        }

        const cart = getCart();
        const today = new Date();

        const blockedPresale = Object.values(cart).find(item =>
            item.type === "preventa" &&
            item.releaseDate &&
            new Date(item.releaseDate) > today
        );

        if (blockedPresale) {
            alert(`⛔ La preventa "${blockedPresale.name}" estará disponible el ${new Date(blockedPresale.releaseDate).toLocaleDateString()}`);
            return;
        }


        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: total
                }
            }]
        });
    },

    onApprove: function (data, actions) {
        return actions.order.capture().then(async function (details) {

            const cart = JSON.parse(localStorage.getItem("cart")) || {};

            const products = Object.values(cart).map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }));

            const orderData = {
                paypalOrderId: details.id,
                payerName: details.payer.name.given_name,
                payerEmail: details.payer.email_address,
                products: products,
                total: getCartTotalAmount(),
                status: details.status,
                date: new Date()
            };


            // 📦 Guardar orden en MongoDB
            try {
                await fetch("https://crownside-backend-2025-pxtp.vercel.app/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderData)
                });
            } catch (err) {
                console.error("Error guardando orden:", err);
            }

            // 📧 Enviar correo
            emailjs.send(
                "service_4a8n179",
                "template_hpshzpj",
                {
                    name: orderData.payerName,
                    email: orderData.payerEmail,
                    products: getCartProductsText(),
                    total: `$${orderData.total} MXN`,
                    date: new Date().toLocaleString()
                }
            );

            localStorage.removeItem("cart");
            updateCartCounter();
            renderCartPage();

            alert("✅ Pago realizado con éxito");
        });

    },

    onError: function (err) {
        console.error("PayPal error:", err);
        alert("❌ Error en el pago");
    }
}).render("#paypal-button-container");

