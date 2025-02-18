const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser');

// Inicializaciones
const app = express();
require('./config/passport');

// Conexión a la base de datos
mongoose.connect('mongodb+srv://amarole2004:1234@bdd-proyectonode.pbrrm.mongodb.net/?retryWrites=true&w=majority&appName=BDD-ProyectoNode', {
}).then(() => console.log('DB conectada'))
  .catch(err => console.log(err));

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'miappsecreta',
  resave: false,
  saveUninitialized: false
}));
app.use(flash()); // Middleware para mensajes flash
app.use(passport.initialize());
app.use(passport.session());

// Middleware global para pasar mensajes flash y el usuario actual a todas las vistas
app.use((req, res, next) => {
  res.locals.signinMessage = req.flash('signinMessage'); // Mensajes de inicio de sesión
  res.locals.signupMessage = req.flash('signupMessage'); // Mensajes de registro
  res.locals.success = req.flash('success'); // Mensajes de éxito
  res.locals.error = req.flash('error'); // Mensajes de error
  res.locals.user = req.user; // Usuario actual
  res.locals.isAdmin = req.user && req.user.rol === 'Administrador'; // Variable para verificar si es administrador
  res.locals.isProfesor = req.user && req.user.rol === 'Profesor'; // Variable para verificar si es profesor
  res.locals.isAlumno = req.user && req.user.rol === 'Alumno'; // Variable para verificar si es alumno
  next();
});

// Rutas
app.use('/', require('./routes/index'));
app.use(require('./routes/auth'));
app.use(require('./routes/asignaturas'));
app.use(require('./routes/estudios'));
app.use(require('./routes/software'));
app.use(require('./routes/users'));

// Archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));

// Servidor en escucha
app.listen(app.get('port'), () => {
  console.log(`Servidor en el puerto ${app.get('port')}`);
});

module.exports = app;



