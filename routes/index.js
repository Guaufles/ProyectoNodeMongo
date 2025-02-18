const express = require('express');
const router = express.Router();

// Ruta principal
router.get('/', (req, res, next) => {
  if (req.user && req.user.rol === 'Administrador') {
    return res.render('admin-dashboard', { body: '' });
  }
  res.render('index', { body: '' });
});

module.exports = router;


