// --- Funciones para el Modal del Código QR (en index.html) ---

function openQrModal() {
    document.getElementById('qrModal').style.display = "block";
}

function closeQrModal() {
    document.getElementById('qrModal').style.display = "none";
}

// =========================================================
// === LÓGICA: CARRUSEL AUTOMÁTICO DE VISTAS DE GORRA ===
// =========================================================

// 1. Definir las imágenes por gorra (rutas de los archivos subidos)
const hatVistas = [
    'img/othani_gold1_f.png', 
    'img/othani_gold2_f.png',
    'img/othani_gold3_f.png'
];

// 2. Definir el estado (índice actual de la imagen) para cada gorra
const hatStates = {
    hatImage_1: 0,
    hatImage_2: 0,
    hatImage_3: 0,
    // Añade más IDs de imágenes aquí si hay más gorras
};

// 3. Función para cambiar la vista de una gorra específica
function changeHatView(imageId) {
    const imgElement = document.getElementById(imageId);
    if (!imgElement) return;

    // Incrementa el índice y reinicia si llega al final
    let currentIndex = hatStates[imageId];
    currentIndex = (currentIndex + 1) % hatVistas.length;
    hatStates[imageId] = currentIndex;
    
    // Cambia la fuente de la imagen
    imgElement.src = hatVistas[currentIndex];
}

// 4. Iniciar el ciclo para todas las gorras
function startHatCarousels() {
    const imageIds = Object.keys(hatStates);
    const intervalTime = 2000; // 2000 milisegundos = 2 segundos

    imageIds.forEach(imageId => {
        // Ejecuta la función por primera vez, luego en el intervalo
        changeHatView(imageId);
        setInterval(() => changeHatView(imageId), intervalTime);
    });
}

// --- Lógica para cerrar los Modales y Ejecución Inicial ---

window.onclick = function(event) {
    // Cierra el modal de QR (si está abierto y se hace clic fuera)
    var qrModal = document.getElementById('qrModal');
    if (qrModal && event.target == qrModal) {
        closeQrModal();
    }
}

// Llama a la función del carrusel solo cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicia el carrusel en la página de preventas (services.html)
    if (document.body.classList.contains('services-page')) {
        startHatCarousels();
    }
});