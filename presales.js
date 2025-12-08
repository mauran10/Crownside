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
    console.log("🔥 MongoDB conectado (Preventas)");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    throw error;
  }
}

// =======================================================
// 📦 MODELO DE PREVENTA (colección: presales)
// Usamos el mismo esquema básico, pero agregamos los campos de fecha
// =======================================================
const PresaleSchema = new mongoose.Schema({
  id_producto: { type: String, required: true, unique: true },
  nombre: String,
  precio: Number,
  stock: Number,
  descripcion: String,
  imagenUrl: String,
  capLimit: Number,
  presaleEndDate: Date, // Mongoose detecta automáticamente el tipo Date a partir de {$date: "..."}
  estimatedShippingDate: Date,
});

const Presale =
  mongoose.models.Presale ||
  mongoose.model("Presale", PresaleSchema, "presales"); // 💡 CRÍTICO: Colección 'presales'

// =======================================================
// 📌 HANDLER DE VERCEL (SIN EXPRESS)
// GET /api/presales  → todas las preventas
// =======================================================
export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  if (method === "GET") {
    try {
      // 💡 Buscamos y devolvemos todos los documentos de la colección 'presales'
      const preventas = await Presale.find({});
      return res.status(200).json(preventas);
    } catch (err) {
      return res.status(500).json({
        message: "Error al obtener preventas",
        details: err.message,
      });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}