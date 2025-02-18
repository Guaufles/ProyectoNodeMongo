const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Ruta POST para iniciar sesión
router.post('/signin', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return res.status(500).send({ message: 'Error interno del servidor', error: err });
    }
    if (!user) {
      req.flash('error', (info && info.message) || 'Correo electrónico o contraseña incorrectos.');
      return res.redirect('/signin');
    }

    // Registrar al usuario en la sesión
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).send({ message: 'Error al iniciar sesión', error: err });
      }

      // Redirección según el rol del usuario
      if (user.rol === 'Administrador') {
        return res.redirect('/users'); // Redirige a la gestión de usuarios
      } else if (user.rol === 'Profesor') {
        return res.redirect('/profesor/asignaturas'); // Redirige a las asignaturas del profesor
      } else if (user.rol === 'Alumno') {
        return res.redirect('/alumno/asignaturas'); // Redirige a las asignaturas del alumno
      }

      // Por defecto, redirige al perfil
      return res.redirect('/profile');
    });
  })(req, res, next);
});

// Ruta GET para mostrar la página de inicio de sesión
router.get('/signin', (req, res) => {
  res.render('signin', { body: '' });
});

// Ruta GET para mostrar la página de registro
router.get('/signup', (req, res) => {
  res.render('signup', { body: '' });
});

// Ruta POST para registrar un nuevo usuario
router.post('/signup', async (req, res) => {
  try {
    const { nombre, apellido, dni, email, password, rol } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      req.flash('error', 'El correo electrónico ya está en uso.');
      return res.redirect('/signup');
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
    req.flash('success', 'Usuario registrado exitosamente. Por favor, inicia sesión.');
    return res.redirect('/signin');
  } catch (error) {
    req.flash('error', 'Error al registrar el usuario. Inténtalo de nuevo.');
    console.error(error);
    return res.redirect('/signup');
  }
});

// Ruta GET para mostrar el perfil del usuario
router.get('/profile', (req, res) => {
  if (!req.user) {
    return res.redirect('/signin');
  }

  res.render('profile', {
    user: req.user,
    title: 'Perfil de Usuario',
    body: ''
  });
});

// Ruta GET para cerrar sesión
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión');
    }
    req.flash('success', 'Sesión cerrada exitosamente.');
    res.redirect('/signin');
  });
});

module.exports = router;





