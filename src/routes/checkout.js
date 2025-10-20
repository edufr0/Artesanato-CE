const express = require('express');
const router = express.Router();
const ProductController = require('../app/controllers/ProductController.js');
const OrderController = require('../app/controllers/OrderController.js');

// Rota genérica: redireciona "/checkout" para "/checkout/credit-card"
router.get('/checkout', (req, res) => {
  res.redirect('/checkout/credit-card');
});

// Rota para exibir o checkout com Cartão de Crédito
router.get('/checkout/credit-card', ProductController.checkoutCreditCard);

// Rota para exibir o checkout com PIX
router.get('/checkout/pix', ProductController.checkoutPix);

// Rota para processar pagamento (simulado) e criar os pedidos
router.post('/payment/process', async (req, res) => {
  try {
    // Chama o método que cria os pedidos a partir do carrinho
    await OrderController.post(req, res);
  } catch (err) {
    console.error('Erro ao processar pagamento:', err);
    res.render('templates/orders/error');
  }
});

// Rota de sucesso
router.get('/payment/success/:orderId', (req, res) => {
  res.render('templates/payment/success', {
    orderId: req.params.orderId
  });
});

module.exports = router;
