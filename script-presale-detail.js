const API_URL = "https://crownside.vercel.app/api/presale-detail";

async function loadPresaleDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.body.innerHTML = "<p style='color:red;'>ID no proporcionado.</p>";
    return;
  }

  try {
    const res = await fetch(`${API_URL}?id=${id}`);
    const data = await res.json();

    if (!data || data.message === "Preventa no encontrada") {
      document.body.innerHTML = "<p style='color:red;'>Preventa no encontrada.</p>";
      return;
    }

    document.getElementById("product-img").src = data.imagenUrl;
    document.getElementById("product-name").textContent = data.nombre;
    document.getElementById("product-price").textContent = `$${data.precio}`;
    document.getElementById("product-description").textContent = data.descripcion;

    const gallery = document.getElementById("extra-images");
    gallery.innerHTML = "";

    if (data.imagenesAdicionales.length > 0) {
      data.imagenesAdicionales.forEach(img => {
        const imgEl = document.createElement("img");
        imgEl.src = img;
        imgEl.classList.add("extra-img");
        gallery.appendChild(imgEl);
      });
    }
  } catch (error) {
    document.body.innerHTML = `<p style="color:red;">Error al cargar detalles.</p>`;
  }
}

loadPresaleDetail();
