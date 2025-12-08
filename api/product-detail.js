const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config(); 

// Obtiene la variable de entorno de conexión
const DB_URI = process.env.DB_URI; 

// Conexión a MongoDB
if (!DB_URI) {
    console.error("❌ ERROR: La variable de entorno DB_URI no está configurada.");
} else {
    mongoose.connect(DB_URI)
        .then(() => console.log('✅ Conexión a MongoDB exitosa.'))
        .catch(err => console.error('❌ Error de conexión a MongoDB:', err.message));
}

// ==================================================
// === DEFINICIÓN DEL MODELO ===
// ==================================================
const ProductSchema = new mongoose.Schema({
    id_producto: { type: String, required: true, unique: true }, 
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    descripcion: String,
    imagenUrl: String,
    // 🔥 CAMPO AÑADIDO: NECESARIO PARA EL CARRUSEL 🔥
    imagenesAdicionales: { 
        type: [String], // Array de Strings
        default: []      
    }
});

const Product = mongoose.model('Product', ProductSchema, 'products'); // Añadimos el nombre de la colección por si acaso

// ===============================================
// === ENDPOINT DE DETALLE ===
// ===============================================

const app = express();
app.use(express.json()); 

// Configuración de CORS
app.use(cors({
    origin: 'https://crownside.vercel.app', 
    methods: 'GET',
    credentials: true,
}));

// Endpoint para obtener UN solo producto por su ID
// Vercel mapea la URL /api/product-detail?id=X a esta función
app.get('/', async (req, res) => {
    // Comprobamos el estado de la conexión antes de intentar la consulta
    if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ message: 'Error de conexión. El servidor no pudo conectarse con MongoDB.' });
    }
    
    // Captura el ID desde la query string (el ?id=...)
    const id_producto = req.query.id;
    
    if (!id_producto) {
        return res.status(400).json({ message: 'Falta el parámetro ID del producto.' });
    }
    
    try {
        // Busca en la base de datos
        const product = await Product.findOne({ id_producto: id_producto });
        if (!product) {
            return res.status(404).json({ message: `Producto no encontrado con ID: ${id_producto}` });
        }
        res.json(product); // Envía el producto, ahora con imagenesAdicionales
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor al buscar por ID. Detalles: ' + err.message });
    }
});

// Exporta la aplicación para Vercel
module.exports = app;