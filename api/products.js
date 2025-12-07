import mongoose from "mongoose";

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  throw new Error("❌ ERROR: Falta la variable DB_URI en Vercel.");
}

// =======================================================
// 🔌 CONEXIÓN A MONGODB
// =======================================================
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(DB_URI);
    console.log("🔥 MongoDB conectado");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    throw error;
  }
}

// =======================================================
// 📦 MODELO DE PRODUCTO (colección: products)
// =======================================================
const ProductSchema = new mongoose.Schema({
  id_producto: { type: String, required: true, unique: true },
  nombre: String,
  precio: Number,
  stock: Number,
  descripcion: String,
  imagenUrl: String,
    // 💡 AÑADIMOS EL CAMPO PARA LAS IMÁGENES ADICIONALES
    imagenesAdicionales: { 
        type: [String], // Esto define un array de strings
        default: []      // Valor por defecto: un array vacío
    }
});

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", ProductSchema, "products");

// =======================================================
// 📌 HANDLER DE VERCEL (SIN EXPRESS)
// GET /api/products  → todos los productos
// GET /api/products?id=XX → producto por ID
// =======================================================
export default async function handler(req, res) {
  await connectDB();

  const { method, query } = req;

  if (method === "GET" && !query.id) {
    try {
      const productos = await Product.find({});
      return res.status(200).json(productos);
    } catch (err) {
      return res.status(500).json({
        message: "Error al obtener productos",
        details: err.message,
      });
    }
  }

  if (method === "GET" && query.id) {
    try {
      const producto = await Product.findOne({ id_producto: query.id });

      if (!producto) {
        return res.status(404).json({
          message: "Producto no encontrado",
        });
      }

      return res.status(200).json(producto);
    } catch (err) {
      return res.status(500).json({
        message: "Error al buscar producto",
        details: err.message,
      });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}