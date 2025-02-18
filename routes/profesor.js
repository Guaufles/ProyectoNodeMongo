const express = require('express');
const router = express.Router();
const Asignatura = require('../models/Asignatura');
const { isProfesor } = require('../middlewares/auth');

// Obtener todas las asignaturas del profesor
router.get('/asignaturas', isProfesor, async (req, res) => {
  try {
    const asignaturas = await Asignatura.find({ profesores: req.user._id }).populate('estudio');
    res.render('profesor-asignaturas', { asignaturas, body: '' });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las asignaturas.', error });
  }
});

// Editar una asignatura
router.put('/asignaturas/:id', isProfesor, async (req, res) => {
  try {
    const { id } = req.params;
    const { installationInstructions, externalLinks } = req.body;
    const asignatura = await Asignatura.findById(id);
    if (!asignatura) {
      return res.status(404).json({ message: 'Asignatura no encontrada.' });
    }
    if (!asignatura.profesores.includes(req.user._id)) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta asignatura.' });
    }
    asignatura.installationInstructions = installationInstructions;
    asignatura.externalLinks = externalLinks;
    await asignatura.save();
    res.json({ message: 'Asignatura actualizada exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la asignatura.', error });
  }
});

module.exports = router;

