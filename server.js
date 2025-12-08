// Carga las variables de entorno desde el archivo .env (incluyendo DB_URI)
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

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
// === 2. DEFINICIÓN DE MODELOS (ESTRUCTURA DE GORRAS) ===
// ==================================================

// --- Modelo para Productos Regulares (Catálogo) ---
const ProductSchema = new mongoose.Schema({
    id_producto: { type: String, required: true, unique: true }, 
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    descripcion: String,
    imagenUrl: String,
    imagenesAdicionales: { 
        type: [String], // Array de Strings
        default: [] 
    }
});

const Product = mongoose.model('Product', ProductSchema);

// --- 🔥 NUEVO MODELO PARA GORRAS DE PREVENTA 🔥 ---
const PresaleCapSchema = new mongoose.Schema({
    id_producto: { type: String, required: true, unique: true }, 
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    descripcion: String,
    imagenUrl: String,
    // Campos específicos de preventa
    presaleEndDate: {
        type: Date,
        required: [true, 'La fecha de finalización de la preventa es obligatoria.'],
    },
    estimatedShippingDate: {
        type: Date,
        required: [true, 'La fecha estimada de envío es obligatoria.'],
    },
    isExclusive: {
        type: Boolean,
        default: false,
    }
});

const PresaleCap = mongoose.model('PresaleCap', PresaleCapSchema);


// ===============================================
// === 3. FUNCIÓN PARA LLENAR EL INVENTARIO (SEEDER) ===
// ===============================================
async function seedProducts() {
    try {
        await Product.deleteMany({});
        await PresaleCap.deleteMany({}); // 🔥 Limpiamos la colección de Preventa 🔥
        
        const initialProducts = [
            { 
                id_producto: 'contable_01', 
                nombre: 'Edición "El Contable"', 
                precio: 450.00, 
                stock: 15,
                descripcion: 'Diseño premium con bordado 3D, visera curva. Incluye bolsa protectora.', 
                imagenUrl: 'img/othani_gold1_f.png',
                imagenesAdicionales: ['img/othani_gold2_f.png'] 
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

        // 🔥 Nuevos productos de preventa para el seeder 🔥
        const initialPresaleCaps = [
            {
                id_producto: 'presale_01',
                nombre: 'Preventa "Eclipse"',
                precio: 600.00,
                stock: 50,
                descripcion: 'Edición limitada con parche especial, disponible solo por 30 días.',
                imagenUrl: 'img/presale_eclipse.png', // Asume una imagen placeholder
                presaleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Termina en 30 días
                estimatedShippingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Envío en 60 días
                isExclusive: true
            },
            {
                id_producto: 'presale_02',
                nombre: 'Blackout Pro',
                precio: 550.00,
                stock: 100,
                descripcion: 'Versión Stealth sin bordados a color, solo preventa.',
                imagenUrl: 'img/presale_blackout.png',
                presaleEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Termina en 15 días
                estimatedShippingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // Envío en 45 días
                isExclusive: false
            }
        ];

        await Product.insertMany(initialProducts);
        await PresaleCap.insertMany(initialPresaleCaps); // 🔥 Insertamos los productos de Preventa 🔥
        
        console.log('✅ Gorras iniciales y de preventa insertadas. Inventario creado.');
        
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

// Endpoint: Obtener todos los productos (Para el catálogo principal)
// Ruta: /api/products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        // Devuelve un error 500 si falla la conexión a la DB
        res.status(500).json({ message: 'Error al obtener productos. El servidor falló al conectar con la base de datos.' });
    }
});

// 🔥 NUEVO ENDPOINT: Obtener todos los productos de Preventa 🔥
// Ruta: /api/presales
app.get('/api/presales', async (req, res) => {
    try {
        // Busca en la nueva colección de Preventas
        const presales = await PresaleCap.find({});
        res.json(presales);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener preventas. El servidor falló al conectar con la base de datos.' });
    }
});


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