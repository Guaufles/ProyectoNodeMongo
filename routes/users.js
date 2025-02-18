const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAdmin } = require('../middlewares/auth');

// Ruta GET para obtener todos los usuarios
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Excluir el campo password
    res.render('users', { users, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener los usuarios.');
    res.redirect('/users');
  }
});

// Ruta POST para registrar un nuevo usuario (solo administradores)
router.post('/users', isAdmin, async (req, res) => {
  try {
    const { nombre, apellido, dni, email, password, rol } = req.body;

    // Validar formato del DNI usando regex
    const dniRegex = /^[0-9]{8}[A-Z]$/;
    if (!dniRegex.test(dni)) {
      req.flash('error', 'El DNI no tiene un formato válido (debe ser 8 números y 1 letra mayúscula).');
      return res.redirect('/users');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'El correo electrónico ya está en uso.');
      return res.redirect('/users');
    }

    const newUser = new User({
      nombre,
      apellido,
      dni,
      email,
      password: new User().encryptPassword(password),
      rol
    });

    await newUser.save();
    req.flash('success', 'Usuario registrado exitosamente.');
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al registrar el usuario.');
    res.redirect('/users');
  }
});

// Ruta GET para mostrar el formulario de edición de un usuario
router.get('/users/edit/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password'); // Excluir el campo password
    if (!user) {
      req.flash('error', 'Usuario no encontrado.');
      return res.redirect('/users');
    }
    res.render('edit-user', { user, body: '' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al obtener el usuario.');
    res.redirect('/users');
  }
});

// Ruta POST para actualizar un usuario
router.post('/users/update/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, dni, email, rol } = req.body;

    // Validación básica
    if (!nombre || !apellido || !dni || !email || !rol) {
      req.flash('error', 'Todos los campos son obligatorios.');
      return res.redirect(`/users/edit/${id}`);
    }

    // Verificar si el correo electrónico ya está en uso por otro usuario
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== id) {
      req.flash('error', 'El correo electrónico ya está en uso.');
      return res.redirect(`/users/edit/${id}`);
    }

    // Actualizar el usuario
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { nombre, apellido, dni, email, rol },
      { new: true }
    );

    if (!updatedUser) {
      req.flash('error', 'Usuario no encontrado.');
      return res.redirect('/users');
    }

    req.flash('success', 'Usuario actualizado exitosamente.');
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al actualizar el usuario.');
    res.redirect('/users');
  }
});

// Ruta GET para eliminar un usuario
router.get('/users/delete/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      req.flash('error', 'Usuario no encontrado.');
      return res.redirect('/users');
    }

    req.flash('success', 'Usuario eliminado exitosamente.');
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al eliminar el usuario.');
    res.redirect('/users');
  }
});

module.exports = router;

