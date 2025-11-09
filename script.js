// =========================================================
// === LÓGICA: CARRUSEL AUTOMÁTICO DE VISTAS DE GORRA ===
// =========================================================

// 1. Definir las imágenes por gorra (¡Asegúrate de que estas rutas sean correctas en tu carpeta 'img'!)
const hatVistas = {
    hatImage_1: [
        'img/othani_gold1_f.png',  // Vista frontal 
        'img/othani_gold2_f.png',    // Vista lateral
        'img/othani_gold3_f.png'     // Vista trasera
    ],
    // *** DEBES AGREGAR IMÁGENES REALES PARA ESTAS GORRAS ***
    hatImage_2: [
        'img/gorra_clasica_frente.jpg', // Ejemplo: Reemplaza con tus archivos
        'img/gorra_clasica_lado.jpg',
        'img/gorra_clasica_atras.jpg'
    ],
    hatImage_3: [
        'img/gorra_deportiva_frente.jpg', // Ejemplo: Reemplaza con tus archivos
        'img/gorra_deportiva_lado.jpg',
        'img/gorra_deportiva_atras.jpg'
    ]
};

// 2. Definir el estado (índice actual de la imagen) para cada gorra
const hatStates = {
    hatImage_1: 0,
    hatImage_2: 0,
    hatImage_3: 0,
};

// 3. Función para cambiar la vista de una gorra específica
function changeHatView(imageId) {
    const imgElement = document.getElementById(imageId);
    if (!imgElement) return;

    // Obtener el array de vistas para esta gorra específica
    const vistasEspecificas = hatVistas[imageId];
    if (!vistasEspecificas || vistasEspecificas.length === 0) {
        return;
    }

    // Incrementa el índice y reinicia si llega al final de las vistas de ESTA GORRA
    let currentIndex = hatStates[imageId];
    currentIndex = (currentIndex + 1) % vistasEspecificas.length;
    hatStates[imageId] = currentIndex;
    
    // Cambia la fuente de la imagen
    imgElement.src = vistasEspecificas[currentIndex];
}

// 4. Iniciar el ciclo para todas las gorras
function startHatCarousels() {
    const imageIds = Object.keys(hatStates);
    const intervalTime = 2000; // 2000 milisegundos = 2 segundos

    imageIds.forEach(imageId => {
        // Ejecuta la función por primera vez, luego en el intervalo
        setInterval(() => changeHatView(imageId), intervalTime);
    });
}

// --- Ejecución Inicial ---

// Llama a la función del carrusel solo cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicia el carrusel en la página de preventas (services.html)
    if (document.body.classList.contains('services-page')) {
        startHatCarousels();
    }
});