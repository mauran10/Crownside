const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config(); 

// =======================================================
// === 1. CONFIGURACIÓN DE LA BASE DE DATOS (DB) ===
// =======================================================
const DB_URI = process.env.DB_URI; 

if (!DB_URI) {
    console.error("❌ ERROR CRÍTICO: La variable de entorno DB_URI no está configurada.");
} else {
    // Conexión a MongoDB (Vercel maneja la persistencia)
    mongoose.connect(DB_URI)
        .then(() => console.log('✅ Conexión a MongoDB exitosa.'))
        .catch(err => {
            console.error('❌ ERROR 500: Fallo en la conexión a MongoDB. Revisa DB_URI en Vercel.', err.message);
        });
}

// ==================================================
// === 2. DEFINICIÓN DEL MODELO ===
// ==================================================
const ProductSchema = new mongoose.Schema({
    id_producto: { type: String, required: true, unique: true }, 
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    descripcion: String,
    imagenUrl: String,
});

// CRÍTICO: El nombre de la colección debe coincidir exactamente con el nombre en tu MongoDB Atlas
// Si tu colección se llama "productos", cámbialo aquí:
const Product = mongoose.model('Product', ProductSchema, 'products'); // <--- AÑADIDO: 'products'

// ===============================================
// === 3. CONFIGURACIÓN Y ENDPOINTS (APIs) ===
// ===============================================

const app = express();

app.use(express.json()); 

app.use(cors({
    origin: 'https://crownside.vercel.app', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Endpoint 1: Obtener todos los productos (Para el catálogo)
app.get('/api/products', async (req, res) => {
    // Verifica si la conexión está lista. Si no, devuelve 500.
    if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ 
            message: 'Error de conexión a la base de datos. Por favor, revisa la variable DB_URI en Vercel.',
            status: 'DB_DISCONNECTED'
        });
    }
    
    try {
        const products = await Product.find({});
        console.log(`✅ API /api/products: Encontrados ${products.length} productos.`); 
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener productos. Detalles: ' + err.message });
    }
});

// === CRÍTICO PARA VERCEL ===
module.exports = app;