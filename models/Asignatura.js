const mongoose = require('mongoose');
const { Schema } = mongoose;

const AsignaturaSchema = new Schema({
  nombre: { type: String, required: true },
  curso: { type: String, required: true },
  profesores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  alumnos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  estudio: { type: mongoose.Schema.Types.ObjectId, ref: 'Estudio' },
  software: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SoftWare' }] // Relación con SoftWare
});

module.exports = mongoose.model('Asignatura', AsignaturaSchema);
