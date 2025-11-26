const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// =======================================================
// === 1. CONEXIÓN A MONGODB ===
// =======================================================

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
    console.error("❌ ERROR: La variable DB_URI no está configurada en Vercel.");
} else {
    mongoose.connect(DB_URI)
        .then(() => console.log("✅ Conectado a MongoDB correctamente"))
        .catch(err => console.error("❌ Error al conectar a MongoDB:", err.message));
}

// =======================================================
// === 2. MODELO DE PRODUCTO (Colección: products) ===
// =======================================================

const ProductSchema = new mongoose.Schema({
    id_producto: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    descripcion: String,
    imagenUrl: String,
});

// Tercer parámetro = nombre exacto de la colección en MongoDB
const Product = mongoose.model("Product", ProductSchema, "products");

// =======================================================
// === 3. APP EXPRESS / CONFIGURACIÓN CORS ===
// =======================================================

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'https://crownside.vercel.app',
    methods: 'GET,HEAD,POST,PUT,DELETE',
    credentials: true,
}));

// =======================================================
// === 4. OBTENER TODOS LOS PRODUCTOS ===
// =======================================================

app.get('/api/products', async (req, res) => {

    if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({
            message: '❌ Error: No conectado a MongoDB'
        });
    }

    try {
        const productos = await Product.find({});
        console.log(`📦 Productos encontrados: ${productos.length}`);
        res.json(productos);

    } catch (err) {
        res.status(500).json({
            message: "❌ Error al obtener productos",
            details: err.message
        });
    }
});

// =======================================================
// === 5. OBTENER UN PRODUCTO POR SU ID (NUEVO) ===
// =======================================================

app.get('/api/products/:id', async (req, res) => {

    if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({
            message: '❌ Error: No conectado a MongoDB'
        });
    }

    try {
        const id = req.params.id;

        const product = await Product.findOne({ id_producto: id });

        if (!product) {
            return res.status(404).json({
                message: `❌ Producto no encontrado con ID: ${id}`
            });
        }

        res.json(product);

    } catch (err) {
        res.status(500).json({
            message: "❌ Error al buscar producto",
            details: err.message
        });
    }
});

// =======================================================
// === 6. EXPORTAR APP PARA VERCEL ===
// =======================================================
module.exports = app;
