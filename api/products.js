const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
require('dotenv').config(); 

// =======================================================
// === 1. CONFIGURACIÓN DE LA BASE DE DATOS (DB) ===
// =======================================================
// CRÍTICO: Usa DB_URI, y si no existe (como en tu Vercel), usa MONGO_URI
const DB_URI = process.env.DB_URI || process.env.MONGO_URI; 

if (!DB_URI) {
    console.error("❌ ERROR: La variable de entorno DB_URI (o MONGO_URI) no está configurada.");
} else {
    // Conexión a MongoDB (Vercel maneja la persistencia)
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
});

const Product = mongoose.model('Product', ProductSchema);

// La función seedProducts() se ha omitido aquí para mantener el archivo limpio. 
// Si necesitas regenerar el inventario, descomenta y ejecuta en un entorno de prueba local.

// ===============================================
// === 3. CONFIGURACIÓN Y ENDPOINTS (APIs) ===
// ===============================================

const app = express();

app.use(express.json()); 

// CRÍTICO: CORS configurado para aceptar peticiones SOLO desde tu dominio de Vercel.
app.use(cors({
    origin: 'https://crownside.vercel.app', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Endpoint 1: Obtener todos los productos (Para el catálogo)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        // Devuelve un error 500 si falla la conexión a la DB
        res.status(500).json({ message: 'Error al obtener productos. Verifica la conexión a MongoDB.' });
    }
});

// Endpoint 2: Obtener UN solo producto por su ID (Para la página producto.html)
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id_producto: req.params.id });
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor al buscar por ID.' });
    }
});

// === CRÍTICO PARA VERCEL ===
// Vercel requiere que exportes la aplicación para que funcione como Serverless Function.
module.exports = app;