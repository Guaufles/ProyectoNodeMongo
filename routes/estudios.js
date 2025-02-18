const express = require('express');
const router = express.Router();
const Estudio = require('../models/Estudio');
const { isAdmin } = require('../middlewares/auth');

// Ruta GET para obtener todos los estudios
router.get('/estudios', isAdmin, async (req, res) => {
  try {
    const estudios = await Estudio.find();
    res.render('estudios', { estudios, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener los estudios.');
    res.redirect('/estudios');
  }
});

// Ruta POST para crear un nuevo estudio
router.post('/estudios', isAdmin, async (req, res) => {
  try {
    const { nombre, tipo } = req.body;

    // Validación básica
    if (!nombre || !tipo) {
      req.flash('error', 'Nombre y tipo son campos obligatorios.');
      return res.redirect('/estudios');
    }

    const newEstudio = new Estudio({ nombre, tipo });
    await newEstudio.save();
    req.flash('success', 'Estudio creado exitosamente.');
    res.redirect('/estudios');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al crear el estudio.');
    res.redirect('/estudios');
  }
});

// Ruta GET para mostrar el formulario de edición de un estudio
router.get('/estudios/edit/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const estudio = await Estudio.findById(id);

    if (!estudio) {
      req.flash('error', 'Estudio no encontrado.');
      return res.redirect('/estudios');
    }

    res.render('edit-estudio', { estudio, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener el estudio.');
    res.redirect('/estudios');
  }
});

// Ruta POST para actualizar un estudio
router.post('/estudios/update/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo } = req.body;

    // Validación básica
    if (!nombre || !tipo) {
      req.flash('error', 'Nombre y tipo son campos obligatorios.');
      return res.redirect(`/estudios/edit/${id}`);
    }

    // Actualizar el estudio
    const updatedEstudio = await Estudio.findByIdAndUpdate(
      id,
      { nombre, tipo },
      { new: true }
    );

    if (!updatedEstudio) {
      req.flash('error', 'Estudio no encontrado.');
      return res.redirect('/estudios');
    }

    req.flash('success', 'Estudio actualizado exitosamente.');
    res.redirect('/estudios');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al actualizar el estudio.');
    res.redirect('/estudios');
  }
});

// Ruta GET para eliminar un estudio
router.get('/estudios/delete/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEstudio = await Estudio.findByIdAndDelete(id);

    if (!deletedEstudio) {
      req.flash('error', 'Estudio no encontrado.');
      return res.redirect('/estudios');
    }

    req.flash('success', 'Estudio eliminado exitosamente.');
    res.redirect('/estudios');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al eliminar el estudio.');
    res.redirect('/estudios');
  }
});

module.exports = router;
