const express = require('express');
const router = express.Router();
const Asignatura = require('../models/Asignatura');
const Estudio = require('../models/Estudio');
const SoftWare = require('../models/Software'); // Importar el modelo Software
const User = require('../models/User');
const { isAdmin, isProfesor, isAlumno } = require('../middlewares/auth');

// Ruta GET para obtener todas las asignaturas (solo administradores)
router.get('/asignaturas', isAdmin, async (req, res) => {
  try {
    const asignaturas = await Asignatura.find()
      .populate('profesores', 'nombre apellido') // Cargar profesores
      .populate('alumnos', 'nombre apellido') // Cargar alumnos
      .populate('estudio') // Cargar estudio asociado
      .populate('software'); // Cargar software asociado

    const estudios = await Estudio.find(); // Consultar todos los estudios disponibles
    const users = await User.find(); // Consultar todos los usuarios disponibles
    res.render('asignaturas', { asignaturas, estudios, users, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener las asignaturas.');
    res.redirect('/asignaturas');
  }
});

// Ruta POST para crear una nueva asignatura (solo administradores)
router.post('/asignaturas', isAdmin, async (req, res) => {
  try {
    const { nombre, curso, estudio } = req.body;
    const newAsignatura = new Asignatura({ nombre, curso, estudio });
    await newAsignatura.save();
    req.flash('success', 'Asignatura creada exitosamente.');
    res.redirect('/asignaturas');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al crear la asignatura.');
    res.redirect('/asignaturas');
  }
});

// Ruta GET para mostrar el formulario de edición de una asignatura (solo administradores)
router.get('/asignaturas/edit/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const asignatura = await Asignatura.findById(id).populate('estudio');
    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }
    const estudios = await Estudio.find(); // Consultar todos los estudios disponibles
    res.render('edit-asignatura', { asignatura, estudios, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener la asignatura.');
    res.redirect('/asignaturas');
  }
});

// Ruta POST para actualizar una asignatura (solo administradores)
router.post('/asignaturas/update/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, curso, estudio } = req.body;

    // Validación básica
    if (!nombre || !curso || !estudio) {
      req.flash('error', 'Todos los campos son obligatorios.');
      return res.redirect(`/asignaturas/edit/${id}`);
    }

    const updatedAsignatura = await Asignatura.findByIdAndUpdate(
      id,
      { nombre, curso, estudio },
      { new: true }
    );

    if (!updatedAsignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    req.flash('success', 'Asignatura actualizada exitosamente.');
    res.redirect('/asignaturas');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al actualizar la asignatura.');
    res.redirect('/asignaturas');
  }
});

// Ruta GET para eliminar una asignatura (solo administradores)
router.get('/asignaturas/delete/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAsignatura = await Asignatura.findByIdAndDelete(id);

    if (!deletedAsignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    req.flash('success', 'Asignatura eliminada exitosamente.');
    res.redirect('/asignaturas');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al eliminar la asignatura.');
    res.redirect('/asignaturas');
  }
});

// Ruta GET para obtener las asignaturas del alumno (solo alumnos)
router.get('/alumno/asignaturas', isAlumno, async (req, res) => {
  try {
    const { _id } = req.user; // ID del usuario actual
    const asignaturas = await Asignatura.find({ alumnos: _id })
      .populate('profesores', 'nombre apellido') // Cargar profesores
      .populate('alumnos', 'nombre apellido') // Cargar alumnos
      .populate('software', 'link descripcion') // Cargar software asociado
      .populate('estudio'); // Cargar estudio asociado

    if (!asignaturas || asignaturas.length === 0) {
      req.flash('info', 'No estás matriculado en ninguna asignatura.');
      return res.render('alumno-asignaturas', { asignaturas: [], body: '' });
    }

    res.render('alumno-asignaturas', { asignaturas, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener tus asignaturas.');
    res.redirect('/signin');
  }
});

// Ruta GET para obtener las asignaturas del profesor (solo profesores)
router.get('/profesor/asignaturas', isProfesor, async (req, res) => {
  try {
    const { _id } = req.user; // ID del usuario actual
    const asignaturas = await Asignatura.find({ profesores: _id })
      .populate('profesores', 'nombre apellido') // Cargar profesores
      .populate('alumnos', 'nombre apellido') // Cargar alumnos
      .populate('software', 'link descripcion') // Cargar software asociado
      .populate('estudio'); // Cargar estudio asociado

    if (!asignaturas || asignaturas.length === 0) {
      req.flash('info', 'No estás asignado a ninguna asignatura.');
      return res.render('profesor-asignaturas', { asignaturas: [], body: '' });
    }

    res.render('profesor-asignaturas', { asignaturas, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener tus asignaturas.');
    res.redirect('/signin');
  }
});

// Ruta GET para mostrar el formulario de edición de una asignatura (solo profesores)
router.get('/profesor/asignaturas/edit/:id', isProfesor, async (req, res) => {
  try {
    const { id } = req.params;
    const asignatura = await Asignatura.findById(id)
      .populate('estudio'); // Cargar estudio asociado

    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/profesor/asignaturas');
    }

    // Verificar si el profesor está asignado a la asignatura
    const esProfesorAsignado = asignatura.profesores.some(profesor => profesor._id.toString() === req.user._id.toString());
    if (!esProfesorAsignado) {
      req.flash('error', 'No tienes permiso para editar esta asignatura.');
      return res.redirect('/profesor/asignaturas');
    }

    const estudios = await Estudio.find(); // Consultar todos los estudios disponibles
    res.render('edit-profesor-asignatura', { asignatura, estudios, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener la asignatura.');
    res.redirect('/profesor/asignaturas');
  }
});

// Ruta POST para actualizar una asignatura (solo profesores)
router.post('/profesor/asignaturas/update/:id', isProfesor, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, curso, estudio } = req.body;

    const asignatura = await Asignatura.findById(id);
    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/profesor/asignaturas');
    }

    // Verificar si el profesor está asignado a la asignatura
    const esProfesorAsignado = asignatura.profesores.some(profesor => profesor._id.toString() === req.user._id.toString());
    if (!esProfesorAsignado) {
      req.flash('error', 'No tienes permiso para editar esta asignatura.');
      return res.redirect('/profesor/asignaturas');
    }

    // Validación básica
    if (!nombre || !curso || !estudio) {
      req.flash('error', 'Todos los campos son obligatorios.');
      return res.redirect(`/profesor/asignaturas/edit/${id}`);
    }

    const updatedAsignatura = await Asignatura.findByIdAndUpdate(
      id,
      { nombre, curso, estudio },
      { new: true }
    );

    if (!updatedAsignatura) {
      req.flash('error', 'Error al actualizar la asignatura.');
      return res.redirect('/profesor/asignaturas');
    }

    req.flash('success', 'Asignatura actualizada exitosamente.');
    res.redirect('/profesor/asignaturas');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al actualizar la asignatura.');
    res.redirect('/profesor/asignaturas');
  }
});

// Ruta GET para gestionar el software de una asignatura (solo accesible por profesores)
router.get('/profesor/asignaturas/:id/software', isProfesor, async (req, res) => {
  try {
    const { id } = req.params;
    const asignatura = await Asignatura.findById(id).populate('software'); // Cargar softwares asociados

    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/profesor/asignaturas');
    }

    // Verificar si el profesor está asignado a la asignatura
    const esProfesorAsignado = asignatura.profesores.some(profesor => profesor._id.toString() === req.user._id.toString());
    if (!esProfesorAsignado) {
      req.flash('error', 'No tienes permiso para gestionar el software de esta asignatura.');
      return res.redirect('/profesor/asignaturas');
    }

    res.render('gestion-software-profesor', { asignatura, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener los softwares de la asignatura.');
    res.redirect('/profesor/asignaturas');
  }
});

// Ruta POST para asignar un profesor a una asignatura (solo administradores)
router.post('/asignaturas/:id/profesores', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { profesorId } = req.body;
    const asignatura = await Asignatura.findById(id);

    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    const profesor = await User.findById(profesorId);
    if (!profesor || profesor.rol !== 'Profesor') {
      req.flash('error', 'El usuario seleccionado no es un profesor válido.');
      return res.redirect('/asignaturas');
    }

    if (asignatura.profesores.includes(profesor._id)) {
      req.flash('error', 'El profesor ya está asignado a esta asignatura.');
      return res.redirect('/asignaturas');
    }

    asignatura.profesores.push(profesor._id);
    await asignatura.save();
    req.flash('success', 'Profesor asignado exitosamente.');
    res.redirect('/asignaturas');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al asignar profesor.');
    res.redirect('/asignaturas');
  }
});

// Ruta POST para asignar un alumno a una asignatura (solo administradores)
router.post('/asignaturas/:id/alumnos', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { alumnoId } = req.body;
    const asignatura = await Asignatura.findById(id);

    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    const alumno = await User.findById(alumnoId);
    if (!alumno || alumno.rol !== 'Alumno') {
      req.flash('error', 'El usuario seleccionado no es un alumno válido.');
      return res.redirect('/asignaturas');
    }

    if (asignatura.alumnos.includes(alumno._id)) {
      req.flash('error', 'El alumno ya está asignado a esta asignatura.');
      return res.redirect('/asignaturas');
    }

    asignatura.alumnos.push(alumno._id);
    await asignatura.save();
    req.flash('success', 'Alumno asignado exitosamente.');
    res.redirect('/asignaturas');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al asignar alumno.');
    res.redirect('/asignaturas');
  }
});

// Ruta GET para gestionar el software de una asignatura (solo administradores)
router.get('/asignaturas/:id/software', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const asignatura = await Asignatura.findById(id).populate('software'); // Cargar softwares asociados

    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    res.render('gestion-software', { asignatura, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener los softwares de la asignatura.');
    res.redirect('/asignaturas');
  }
});

// Ruta POST para añadir un nuevo software a una asignatura (solo profesores)
router.post('/profesor/asignaturas/:id/software', isProfesor, async (req, res) => {
  try {
    const { id } = req.params;
    const { link, descripcion } = req.body;

    const asignatura = await Asignatura.findById(id);
    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/profesor/asignaturas');
    }

    // Verificar si el profesor está asignado a la asignatura
    const esProfesorAsignado = asignatura.profesores.some(profesor => profesor._id.toString() === req.user._id.toString());
    if (!esProfesorAsignado) {
      req.flash('error', 'No tienes permiso para añadir software a esta asignatura.');
      return res.redirect('/profesor/asignaturas');
    }

    // Validación básica
    if (!link || !descripcion) {
      req.flash('error', 'Link y descripción son campos obligatorios.');
      return res.redirect(`/profesor/asignaturas/${id}/software`);
    }

    const newSoftware = new SoftWare({ link, descripcion, asignatura: id });
    await newSoftware.save();

    // Actualizar la asignatura para incluir el nuevo software
    asignatura.software.push(newSoftware._id);
    await asignatura.save();

    req.flash('success', 'Software añadido exitosamente.');
    res.redirect(`/profesor/asignaturas/${id}/software`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al añadir el software.');
    res.redirect('/profesor/asignaturas');
  }
});

// Ruta GET para editar un software asociado a una asignatura (solo profesores)
router.get('/profesor/asignaturas/:id/software/edit/:softwareId', isProfesor, async (req, res) => {
  try {
    const { id, softwareId } = req.params;
    const asignatura = await Asignatura.findById(id).populate('software');

    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/profesor/asignaturas');
    }

    // Verificar si el profesor está asignado a la asignatura
    const esProfesorAsignado = asignatura.profesores.some(profesor => profesor._id.toString() === req.user._id.toString());
    if (!esProfesorAsignado) {
      req.flash('error', 'No tienes permiso para editar este software.');
      return res.redirect('/profesor/asignaturas');
    }

    const software = asignatura.software.find(s => s._id.toString() === softwareId);
    if (!software) {
      req.flash('error', 'Software no encontrado.');
      return res.redirect(`/profesor/asignaturas/${id}/software`);
    }

    res.render('edit-software-profesor', { software, asignaturaId: id, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener el software.');
    res.redirect('/profesor/asignaturas');
  }
});

// Ruta POST para actualizar un software asociado a una asignatura (solo profesores)
router.post('/profesor/asignaturas/:id/software/update/:softwareId', isProfesor, async (req, res) => {
  try {
    const { id, softwareId } = req.params;
    const { link, descripcion } = req.body;

    const asignatura = await Asignatura.findById(id);
    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/profesor/asignaturas');
    }

    // Verificar si el profesor está asignado a la asignatura
    const esProfesorAsignado = asignatura.profesores.some(profesor => profesor._id.toString() === req.user._id.toString());
    if (!esProfesorAsignado) {
      req.flash('error', 'No tienes permiso para actualizar este software.');
      return res.redirect('/profesor/asignaturas');
    }

    const updatedSoftware = await SoftWare.findByIdAndUpdate(
      softwareId,
      { link, descripcion },
      { new: true }
    );

    if (!updatedSoftware) {
      req.flash('error', 'Software no encontrado.');
      return res.redirect(`/profesor/asignaturas/${id}/software`);
    }

    req.flash('success', 'Software actualizado exitosamente.');
    res.redirect(`/profesor/asignaturas/${id}/software`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al actualizar el software.');
    res.redirect('/profesor/asignaturas');
  }
});

// Ruta GET para editar un software asociado a una asignatura (solo administradores)
router.get('/asignaturas/:id/software/edit/:softwareId', isAdmin, async (req, res) => {
  try {
    const { id, softwareId } = req.params;
    const asignatura = await Asignatura.findById(id).populate('software');

    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    const software = asignatura.software.find(s => s._id.toString() === softwareId);
    if (!software) {
      req.flash('error', 'Software no encontrado.');
      return res.redirect(`/asignaturas/${id}/software`);
    }

    res.render('edit-software', { software, asignaturaId: id, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener el software.');
    res.redirect('/asignaturas');
  }
});

// Ruta POST para actualizar un software asociado a una asignatura (solo administradores)
router.post('/asignaturas/:id/software/update/:softwareId', isAdmin, async (req, res) => {
  try {
    const { id, softwareId } = req.params;
    const { link, descripcion } = req.body;

    // Validación básica
    if (!link || !descripcion) {
      req.flash('error', 'Link y descripción son campos obligatorios.');
      return res.redirect(`/asignaturas/${id}/software/edit/${softwareId}`);
    }

    const updatedSoftware = await SoftWare.findByIdAndUpdate(
      softwareId,
      { link, descripcion },
      { new: true }
    );

    if (!updatedSoftware) {
      req.flash('error', 'Software no encontrado.');
      return res.redirect(`/asignaturas/${id}/software`);
    }

    req.flash('success', 'Software actualizado exitosamente.');
    res.redirect(`/asignaturas/${id}/software`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al actualizar el software.');
    res.redirect('/asignaturas');
  }
});

// Ruta GET para eliminar un software asociado a una asignatura (solo administradores)
router.get('/asignaturas/:id/software/delete/:softwareId', isAdmin, async (req, res) => {
  try {
    const { id, softwareId } = req.params;
    const deletedSoftware = await SoftWare.findByIdAndDelete(softwareId);

    if (!deletedSoftware) {
      req.flash('error', 'Software no encontrado.');
      return res.redirect(`/asignaturas/${id}/software`);
    }

    // Eliminar el software de la lista de la asignatura
    const asignatura = await Asignatura.findById(id);
    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    asignatura.software = asignatura.software.filter(s => s.toString() !== softwareId);
    await asignatura.save();

    req.flash('success', 'Software eliminado exitosamente.');
    res.redirect(`/asignaturas/${id}/software`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al eliminar el software.');
    res.redirect('/asignaturas');
  }
});

// Ruta POST para añadir un nuevo software a una asignatura (solo administradores)
router.post('/asignaturas/:id/software', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { link, descripcion } = req.body;

    // Validación básica
    if (!link || !descripcion) {
      req.flash('error', 'Link y descripción son campos obligatorios.');
      return res.redirect(`/asignaturas/${id}/software`);
    }

    // Crear el nuevo software
    const newSoftware = new SoftWare({ link, descripcion, asignatura: id });
    await newSoftware.save();

    // Actualizar la asignatura para incluir el nuevo software
    const asignatura = await Asignatura.findById(id);
    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    asignatura.software.push(newSoftware._id);
    await asignatura.save();

    req.flash('success', 'Software añadido exitosamente.');
    res.redirect(`/asignaturas/${id}/software`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al añadir el software.');
    res.redirect('/asignaturas');
  }
});

// Ruta POST para desasignar un profesor de una asignatura (solo administradores)
router.post('/asignaturas/:id/profesores/delete', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { profesorId } = req.body;
    const asignatura = await Asignatura.findById(id);

    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    // Verificar si el profesor está asignado
    const profesorIndex = asignatura.profesores.findIndex(profesor => profesor.toString() === profesorId);
    if (profesorIndex === -1) {
      req.flash('error', 'El profesor no está asignado a esta asignatura.');
      return res.redirect('/asignaturas');
    }

    // Eliminar al profesor del array de profesores
    asignatura.profesores.splice(profesorIndex, 1);
    await asignatura.save();

    req.flash('success', 'Profesor desasignado exitosamente.');
    res.redirect('/asignaturas');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al desasignar profesor.');
    res.redirect('/asignaturas');
  }
});

// Ruta POST para desasignar un alumno de una asignatura (solo administradores)
router.post('/asignaturas/:id/alumnos/delete', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { alumnoId } = req.body;
    const asignatura = await Asignatura.findById(id);

    if (!asignatura) {
      req.flash('error', 'Asignatura no encontrada.');
      return res.redirect('/asignaturas');
    }

    // Verificar si el alumno está asignado
    const alumnoIndex = asignatura.alumnos.findIndex(alumno => alumno.toString() === alumnoId);
    if (alumnoIndex === -1) {
      req.flash('error', 'El alumno no está asignado a esta asignatura.');
      return res.redirect('/asignaturas');
    }

    // Eliminar al alumno del array de alumnos
    asignatura.alumnos.splice(alumnoIndex, 1);
    await asignatura.save();

    req.flash('success', 'Alumno desasignado exitosamente.');
    res.redirect('/asignaturas');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al desasignar alumno.');
    res.redirect('/asignaturas');
  }
});

module.exports = router;



