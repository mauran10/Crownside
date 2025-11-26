const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Necesario para evitar errores de seguridad CORS

// =======================================================
// === 1. CONFIGURACIÓN DE LA BASE DE DATOS (DB) ===
// =======================================================

// !!! ⚠️ PASO CRÍTICO: USA VARIABLES DE ENTORNO EN PRODUCCIÓN !!!
// En tu máquina local, DB_URI puede ser 'undefined', pero Vercel le dará el valor real.
const DB_URI = process.env.DB_URI; // Lee la cadena de conexión de Vercel
const PORT = process.env.PORT || 3000; // Usa el puerto de Vercel, si no existe, usa 3000 (local)

if (!DB_URI) {
    console.error("❌ ERROR: La variable de entorno DB_URI no está configurada. Verifica Vercel.");
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
                imagenUrl: 'img/othani_gold1_f.png' 
            },
            { 
                id_producto: 'minimal_02', 
                nombre: 'Clásica "Minimal"', 
                precio: 350.00, 
                stock: 20,
                descripcion: 'Ajuste perfecto con logo discreto en la parte frontal y trasera.', 
                imagenUrl: 'img/minimal_b.png' 
            }
        ];

        await Product.insertMany(initialProducts);
        console.log('✅ Gorras iniciales insertadas. Inventario creado.');
        
    } catch (error) {
        console.error('❌ Error al insertar datos iniciales (Seeding):', error.message);
    }
}
// ⚠️ INSTRUCCIÓN: Solo descomentar para cargar el inventario UNA VEZ.
// seedProducts(); 


// ===============================================
// === 4. CONFIGURACIÓN Y ENDPOINTS (APIs) ===
// ===============================================

const app = express();

app.use(express.json()); 

// Configuración de CORS para Vercel:
// Permite que tu frontend de Vercel (ej: https://[nombre-de-tu-app].vercel.app) 
// acceda a esta API. ¡Reemplaza la URL de ejemplo por la URL REAL de tu frontend!
app.use(cors({
    origin: 'https://crownside.vercel.app/', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Permite que el servidor sirva archivos estáticos.
app.use(express.static(__dirname)); 

// Endpoint 1: Obtener todos los productos (Para el catálogo)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

// Endpoint 2: Obtener UN solo producto por su ID (Para la página producto.html)
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id_producto: req.params.id });
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


// Inicia el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express escuchando en el puerto ${PORT}`);
});