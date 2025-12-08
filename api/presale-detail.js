import mongoose from "mongoose";

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  throw new Error("❌ ERROR: Falta la variable DB_URI en Vercel.");
}

// =======================================================
// 🔌 CONNECT DB
// =======================================================
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(DB_URI);
    console.log("🔥 MongoDB conectado (detalles preventas)");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    throw error;
  }
}

// =======================================================
// 📦 MODELO
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

const Presale =
  mongoose.models.Presale ||
  mongoose.model("Presale", PresaleSchema, "preventas");

// =======================================================
// 📌 HANDLER — /api/presale-detail?id=XX
// =======================================================
export default async function handler(req, res) {
  await connectDB();

  const { method, query } = req;

  if (method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  if (!query.id) {
    return res.status(400).json({ message: "Falta el parámetro 'id'" });
  }

  try {
    const producto = await Presale.findOne({ id_producto: query.id });

    if (!producto) {
      return res.status(404).json({ message: "Preventa no encontrada" });
    }

    return res.status(200).json(producto);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener detalles de preventa",
      details: err.message,
    });
  }
}
