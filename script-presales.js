// =======================================================
// 🔥 CARGAR COLECCIÓN DE PREVENTAS
// =======================================================

const API_URL = "https://crownside.vercel.app/api/preventas"; 
const container = document.getElementById("catalog-container");

// Cargar contador del carrito
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const counter = document.getElementById("cart-counter");
    if (counter) counter.textContent = cart.length;
}
updateCartCounter();

// =======================================================
// 🔌 FUNCIÓN PRINCIPAL: CARGAR PREVENTAS
// =======================================================
async function loadPreSales() {
    container.innerHTML = `
        <div style="text-align:center; color:black;">
            <p>Cargando preventas...</p>
        </div>
    `;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `
                <p style="text-align:center;">No hay preventas disponibles.</p>
            `;
            return;
        }

        // Pintar tarjetas
        container.innerHTML = data
            .map(producto => `
                <div class="hat-card" onclick="goToDetail('${producto.id_producto}')">
                    <img src="${producto.imagenUrl}" class="hat-img" alt="${producto.nombre}">
                    <h4>${producto.nombre}</h4>
                    <p class="price">$${producto.precio}</p>
                </div>
            `)
            .join("");

    } catch (err) {
        container.innerHTML = `
            <p style="text-align:center; color:red;">
                Error al cargar preventas.
            </p>
        `;
        console.error("❌ Error cargando preventas:", err);
    }
}

// Ir al detalle con tipo=preventa
function goToDetail(id) {
    window.location.href = `producto.html?id=${id}&type=preventa`;
}

// Iniciar carga
loadPreSales();
