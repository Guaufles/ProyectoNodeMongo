// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Debes iniciar sesión para acceder a esta página.');
  res.redirect('/signin');
};

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'Administrador') {
    return next();
  }
  req.flash('error', 'No tienes permiso para acceder a esta página.');
  res.redirect('/signin');
};

// Middleware para verificar si el usuario es profesor
const isProfesor = (req, res, next) => {
  if (req.user && req.user.rol === 'Profesor') {
    return next();
  }
  req.flash('error', 'No tienes permiso para acceder a esta página.');
  res.redirect('/signin');
};

// Middleware para verificar si el usuario es alumno
const isAlumno = (req, res, next) => {
  if (req.user && req.user.rol === 'Alumno') {
    return next();
  }
  req.flash('error', 'No tienes permiso para acceder a esta página.');
  res.redirect('/signin');
};

module.exports = { isAuthenticated, isAdmin, isProfesor, isAlumno };

