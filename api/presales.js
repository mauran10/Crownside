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
    console.log("🔥 MongoDB conectado (preventas)");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    throw error;
  }
}

// =======================================================
// 📦 MODELO DE PREVENTAS
// =======================================================
const PresaleSchema = new mongoose.Schema({
  id_producto: { type: String, required: true, unique: true },
  nombre: String,
  precio: Number,
  stock: Number,
  descripcion: String,
  imagenUrl: String,
  imagenesAdicionales: { type: [String], default: [] }
});

// 🔥 MUY IMPORTANTE: usar colección "preventas"
const Presale =
  mongoose.models.Presale ||
  mongoose.model("Presale", PresaleSchema, "preventas");

// =======================================================
// 📌 HANDLER DE VERCEL — /api/presales
// GET  → todos
// GET?id=XX → uno por id_producto
// =======================================================
export default async function handler(req, res) {
  await connectDB();

  const { method, query } = req;

  if (method === "GET" && !query.id) {
    try {
      const productos = await Presale.find({});
      return res.status(200).json(productos);
    } catch (err) {
      return res.status(500).json({
        message: "Error al obtener preventas",
        details: err.message,
      });
    }
  }

  if (method === "GET" && query.id) {
    try {
      const producto = await Presale.findOne({ id_producto: query.id });

      if (!producto) {
        return res.status(404).json({
          message: "Preventa no encontrada",
        });
      }

      return res.status(200).json(producto);
    } catch (err) {
      return res.status(500).json({
        message: "Error al buscar preventa",
        details: err.message,
      });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
