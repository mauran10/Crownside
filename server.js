const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config(); 

// =======================================================
// === 1. CONFIGURACIÓN DE LA BASE DE DATOS (DB) ===
// =======================================================
// CRÍTICO: Usa DB_URI, y si no existe (como en tu Vercel), usa MONGO_URI
const DB_URI = process.env.DB_URI || process.env.MONGO_URI; 
const PORT = process.env.PORT || 3000; 

if (!DB_URI) {
    // Este error solo debe verse en local si no usas .env o en Vercel si no configuras la variable.
    console.error("❌ ERROR: La variable de entorno DB_URI (o MONGO_URI) no está configurada. Verifica Vercel.");
} else {
    mongoose.connect(DB_URI)
        .then(() => console.log('✅ Conexión a MongoDB exitosa.'))
        .catch(err => console.error('❌ Error de conexión a MongoDB:', err));
}

// ==================================================
// === 2. DEFINICIÓN DEL MODELO (ESTRUCTURA DE GORRAS) ===
// ==================================================
const ProductSchema = new mongoose.Schema({
    id_producto: { type: String, required: true, unique: true }, 
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    descripcion: String,
    imagenUrl: String,
    // 🔥 CAMBIO AÑADIDO: Incluye el campo para el carrusel 🔥
    imagenesAdicionales: { 
        type: [String], // Array de Strings
        default: []      
    }
});

const Product = mongoose.model('Product', ProductSchema);


// ===============================================
// === 3. FUNCIÓN PARA LLENAR EL INVENTARIO (SEEDER) ===
// ===============================================
async function seedProducts() {
    try {
        await Product.deleteMany({});
        
        const initialProducts = [
            { 
                id_producto: 'contable_01', 
                nombre: 'Edición "El Contable"', 
                precio: 450.00, 
                stock: 15,
                descripcion: 'Diseño premium con bordado 3D, visera curva. Incluye bolsa protectora.', 
                imagenUrl: 'img/othani_gold1_f.png',
                imagenesAdicionales: ['img/othani_gold2_f.png', 'img/othani_gold3_f.png'] // Agregamos imágenes al seeder
            },
            { 
                id_producto: 'minimal_02', 
                nombre: 'Clásica "Minimal"', 
                precio: 350.00, 
                stock: 20,
                descripcion: 'Ajuste perfecto con logo discreto en la parte frontal y trasera.', 
                imagenUrl: 'img/minimal_b.png',
                imagenesAdicionales: [] 
            }
        ];

        await Product.insertMany(initialProducts);
        console.log('✅ Gorras iniciales insertadas. Inventario creado.');
        
    } catch (error) {
        console.error('❌ Error al insertar datos iniciales (Seeding):', error.message);
    }
}
// Si quieres recargar la base de datos con los dos productos iniciales, descomenta la siguiente línea:
// seedProducts(); 


// ===============================================
// === 4. CONFIGURACIÓN Y ENDPOINTS (APIs) ===
// ===============================================

const app = express();

app.use(express.json()); 

// CRÍTICO: CORS configurado para aceptar peticiones SOLO desde tu dominio de Vercel.
app.use(cors({
    origin: 'https://crownside.vercel.app', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Permite que el servidor sirva archivos estáticos.
app.use(express.static(__dirname)); 

// Endpoint: Obtener todos los productos (Para el catálogo)
// Ruta: /api/products
app.get('/api/products', async (req, res) => {
    try {
        // Ahora Product.find({}) devolverá también imagenesAdicionales
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        // Devuelve un error 500 si falla la conexión a la DB
        res.status(500).json({ message: 'Error al obtener productos. El servidor falló al conectar con la base de datos.' });
    }
});

// ❌ RUTA ELIMINADA: El endpoint para producto individual por ID de ruta (/api/products/:id)
// se maneja ahora con parámetros de consulta en api/product-detail.js para evitar conflictos.


// === CRÍTICO PARA VERCEL ===
// En lugar de app.listen(), exportamos la aplicación para que Vercel la pueda ejecutar
// como una función Serverless.
// Mantenemos app.listen solo para pruebas locales.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Express escuchando en el puerto ${PORT}`);
    });
}

module.exports = app;