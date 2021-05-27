const express = require('express');
const router = express.Router();
const db = require('../db/db');
const auth = require('./auth');


/* ### === Pages block === */

router.get('/', (req, res)=>{
//  res.json({ message: 'Добро пожаловать!' })
  console.log('req.session', req.session)
  res.render('index', { user: req.session.user });
});

router.post('/test', (req, res)=>{
  console.log("== test route ===")
  res.send(req.session);
});

router.post('/session', (req, res)=>{
  console.log("== session route ===")
  res.send(req.session);
});

/* Simple example auth secured route */
//router.get('/secret', auth.is_auth, (req, res)=>{
//  res.json({
//    message: 'Секретная страница!'
//  })
//});

module.exports = router;