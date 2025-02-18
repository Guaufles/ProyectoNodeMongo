const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { Schema } = mongoose;

const SoftWareSchema = new Schema({
  link: { type: String, required: true },
  descripcion: { type: String, required: true },
  asignatura: { type: mongoose.Schema.Types.ObjectId, ref: 'Asignatura' } // Referencia a Asignatura
});

module.exports = mongoose.model('SoftWare', SoftWareSchema);