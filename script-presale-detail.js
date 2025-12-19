const API_URL = "https://crownside-backend-2025-pxtp.vercel.app/api/presales";
const FRONTEND_URL = "https://crownside.vercel.app";

async function loadPresaleDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.body.innerHTML = "<p style='color:red;'>ID no proporcionado.</p>";
    return;
  }

  try {
    const res = await fetch(`${API_URL}?id=${id}`);
    if (!res.ok) throw new Error("Error en la API");

    const data = await res.json();

    if (!data || data.message === "Preventa no encontrada") {
      document.body.innerHTML = "<p style='color:red;'>Preventa no encontrada.</p>";
      return;
    }

    // Imagen principal
    document.getElementById("product-img").src =
      `${FRONTEND_URL}/${data.imagenUrl}`;

    document.getElementById("product-name").textContent = data.nombre;
    document.getElementById("product-price").textContent = `$${data.precio}`;
    document.getElementById("product-description").textContent = data.descripcion;

    // Galería
    const gallery = document.getElementById("extra-images");
    gallery.innerHTML = "";

    if (Array.isArray(data.imagenesAdicionales)) {
      data.imagenesAdicionales.forEach(img => {
        const imgEl = document.createElement("img");
        imgEl.src = `${FRONTEND_URL}/${img}`;
        imgEl.classList.add("extra-img");
        gallery.appendChild(imgEl);
      });
    }

  } catch (error) {
    console.error("❌ Error preventa:", error);
    document.body.innerHTML =
      `<p style="color:red;">Error al cargar detalles.</p>`;
  }
}

loadPresaleDetail();
