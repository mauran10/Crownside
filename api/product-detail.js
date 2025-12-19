const mongoose = require("mongoose");
require("dotenv").config();

// ===============================
// 🔌 CONEXIÓN CACHEADA (Vercel)
// ===============================
let cached = global.mongoose || { conn: null };
global.mongoose = cached;

async function connectDB() {
    if (cached.conn) return cached.conn;

    cached.conn = await mongoose.connect(process.env.DB_URI);
    return cached.conn;
}

// ===============================
// 📦 MODELO
// ===============================
const ProductSchema = new mongoose.Schema({
    id_producto: String,
    nombre: String,
    precio: Number,
    stock: Number,
    descripcion: String,
    imagenUrl: String,
    imagenesAdicionales: [String]
});

const Product =
    mongoose.models.Product ||
    mongoose.model("Product", ProductSchema, "products");

// ===============================
// 🚀 HANDLER SERVERLESS
// ===============================
module.exports = async (req, res) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    try {
        await connectDB();

        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: "Falta el ID del producto" });
        }

        const product = await Product.findOne({ id_producto: id });

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.status(200).json(product);

    } catch (error) {
        console.error("❌ Error product-detail:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
