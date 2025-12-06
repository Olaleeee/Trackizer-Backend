const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post(
  '/signout',
  authController.protect,
  authController.signout
);

router.post('/forgot-password', authController.forgotPassword);
router.post(
  '/confirm-reset-code/:code',
  authController.confirmResetCode
);
router.post('/reset-password', authController.resetPassword);

router.post('/refresh', authController.refresh);
router.get('/me/', authController.protect, authController.me);

module.exports = router;
