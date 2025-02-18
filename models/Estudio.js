const mongoose = require('mongoose');
const { Schema } = mongoose;

const EstudioSchema = new Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true }
});

module.exports = mongoose.model('Estudio', EstudioSchema);

