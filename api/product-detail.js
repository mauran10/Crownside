const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config(); 

// Obtiene la variable de entorno de conexión
const DB_URI = process.env.DB_URI; 

// Conexión a MongoDB
if (!DB_URI) {
    console.error("❌ ERROR CRÍTICO: La variable de entorno DB_URI no está configurada.");
} else {
    mongoose.connect(DB_URI)
        .then(() => console.log('✅ Conexión a MongoDB exitosa.'))
        .catch(err => {
            console.error('❌ ERROR 500: Fallo en la conexión a MongoDB. Revisa DB_URI en Vercel.', err.message);
        });
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
});

const Product = mongoose.model('Product', ProductSchema);

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
app.get('/', async (req, res) => {
    // Verifica si la conexión está lista. Si no, devuelve 500.
    if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ 
            message: 'Error de conexión a la base de datos. Por favor, revisa la variable DB_URI en Vercel.',
            status: 'DB_DISCONNECTED'
        });
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
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor al buscar por ID. Detalles: ' + err.message });
    }
});

// Exporta la aplicación para Vercel
module.exports = app;