// =======================================================
// 🔥 CARGAR COLECCIÓN DE PREVENTAS
// =======================================================

const API_URL = "https://crownside.vercel.app/api/presales"; 
const container = document.getElementById("catalog-container");

// Cargar contador del carrito
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    const total = Object.values(cart).reduce((acc, p) => acc + p.quantity, 0);

    const counter = document.getElementById("cart-counter");
    if (counter) counter.textContent = total > 0 ? total : "";
}

updateCartCounter();


function showReleaseDate(presales) {
    if (!presales || presales.length === 0) return;

    // Tomamos la primera preventa
    const presale = presales[0];

    if (!presale.fechaLanzamiento) return;

    const date = new Date(presale.fechaLanzamiento);

    const formatted = date.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const dateEl = document.getElementById("release-date");
    if (dateEl) {
        dateEl.textContent = `Lanzamiento: ${formatted}`;
    }
}


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

        // 👀 Ver respuesta REAL antes de intentar convertir a JSON
        const raw = await response.text();
        console.log("📌 RAW RESPONSE DESDE LA API:", raw);

        // Intentar convertir raw a JSON
        const data = JSON.parse(raw);

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `
                <p style="text-align:center;">No hay preventas disponibles.</p>
            `;
            return;
        }

        showReleaseDate(data);


        // Pintar tarjetas
        container.innerHTML = data
            .map(producto => `
                <div class="hat-card" onclick="goToDetail('${producto.id_producto}')">
                    <img src="${producto.imagenUrl}" class="hat-img" alt="${producto.nombre}">
                    <h4 class="title">${producto.nombre}</h4>
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

// Ir al detalle con type=preventa
function goToDetail(id) {
    window.location.href = `producto.html?id=${id}&type=preventa`;
}

// Iniciar carga
loadPreSales();
