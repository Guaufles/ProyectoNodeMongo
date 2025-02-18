const express = require('express');
const router = express.Router();
const SoftWare = require('../models/Software');
const { isProfesor } = require('../middlewares/auth');

// Crear un nuevo software
router.post('/software', isProfesor, async (req, res) => {
  try {
    const { link, descripcion, asignatura } = req.body;
    const newSoftWare = new SoftWare({ link, descripcion, asignatura });
    await newSoftWare.save();
    res.json({ message: 'Software creado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el software.', error });
  }
});

// Obtener todos los software
router.get('/software', async (req, res) => {
  try {
    const software = await SoftWare.find().populate('asignatura');
    res.json(software);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los software.', error });
  }
});

module.exports = router;

