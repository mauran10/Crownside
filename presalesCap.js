const mongoose = require('mongoose');

// Definimos el esquema para las gorras que están en preventa.
// Incluimos campos específicos para preventa, como fecha de finalización o fecha de envío esperado.
const PresaleCapSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la gorra es obligatorio.'],
        trim: true,
    },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio.'],
        min: [0, 'El precio no puede ser negativo.'],
    },
    imageUrl: {
        type: String,
        required: [true, 'La URL de la imagen es obligatoria.'],
    },
    presaleEndDate: {
        type: Date,
        required: [true, 'La fecha de finalización de la preventa es obligatoria.'],
        // Esto podría usarse para mostrar un contador regresivo en la web.
    },
    estimatedShippingDate: {
        type: Date,
        required: [true, 'La fecha estimada de envío es obligatoria.'],
    },
    availableUnits: {
        type: Number,
        required: false,
        default: 0,
    },
    isExclusive: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('PresaleCap', PresaleCapSchema);