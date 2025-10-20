const User = require('../models/User');
const Order = require('../models/Order');
const LoadProductService = require('../services/LoadProductService');
const LoadOrderService = require('../services/LoadOrderService');
const mailer = require('../../lib/mailer');
const Cart = require('../../lib/cart');

// Template de email para NOVO PEDIDO ao vendedor
const emailNovoPedidoVendedor = (seller, product, buyer) => `
  <h2>Olá ${seller.name}</h2>
  <p>Você tem um novo pedido de compra do seu produto</p>
  <p>Produto: ${product.name}</p>
  <p>Preço: ${product.formatedPrice}</p>
  <br><br>
  <h3>Dados do comprador</h3>
  <p>${buyer.name}</p>
  <p>${buyer.email}</p>
  <p>${buyer.address}</p>
  <p>${buyer.cep}</p>
  <br><br>
  <p>Atenciosamente, Equipe CE-Artesanato</p>
`;

// Template de email para CONFIRMAÇÃO DE VENDA ao vendedor
const emailConfirmacaoVenda = (seller, product, order) => `
  <h2>Olá ${seller.name}</h2>
  <p>Você confirmou a venda do pedido #${order.id}:</p>
  <div style="background:#f5f5f5; padding:15px; border-radius:5px; margin:10px 0;">
    <p><strong>Produto:</strong> ${product.name}</p>
    <p><strong>Preço:</strong> ${product.formatedPrice}</p>
  </div>
  <p>O comprador já foi notificado e agora aguarda o envio do produto.</p>
  <br>
  <p>Atenciosamente,<br>Equipe CE-Artesanato</p>
`;

// Template de email para o comprador
const emailComprador = (seller, product, buyer, order) => `
  <h2>Olá ${buyer.name}, seu pedido foi confirmado!</h2>
  <p>Detalhes do seu pedido #${order.id}:</p>
  <ul>
    <li>Produto: ${product.name}</li>
    <li>Preço: ${product.formatedPrice}</li>
    <li>Quantidade: ${order.quantity}</li>
    <li>Total: R$${(order.total/100).toFixed(2)}</li>
  </ul>
  <h3>Informações do vendedor:</h3>
  <p>${seller.name}</p>
  <p>${seller.email}</p>
  <p>${seller.address}</p>
  <br>
  <p>Acompanhe seu pedido: <a href="${process.env.APP_URL}/orders/${order.id}">Clique aqui</a></p>
  <br>
  <p>Atenciosamente, Equipe CE-Artesanato</p>
`;

module.exports = {
  async index(req, res) {
    const orders = await LoadOrderService.load('orders', {
      where: { buyer_id: req.session.userId }
    });
    return res.render('templates/orders/index', { orders });
  },

  async sales(req, res) {
    const sales = await LoadOrderService.load('orders', {
      where: { seller_id: req.session.userId }
    });
    return res.render('templates/orders/sales', { sales });
  },

  async show(req, res) {
    const order = await LoadOrderService.load('order', {
      where: { id: req.params.id }
    });
    return res.render('templates/orders/details', { order });
  },

  async post(req, res) {
    try {
      const cart = Cart.init(req.session.cart);
      const buyer_id = req.session.userId;

      const filteredItems = cart.items.filter(item =>
        item.product.user_id != buyer_id
      );

      const createOrdersPromise = filteredItems.map(async item => {
        let { product, price: total, quantity } = item;
        const { price, id: product_id, user_id: seller_id } = product;
        const status = 'open';

        const order = await Order.create({
          seller_id,
          buyer_id,
          product_id,
          price,
          total,
          quantity,
          status
        });

        product = await LoadProductService.load('product', {
          where: { id: product.id }
        });

        const seller = await User.findOne({ where: { id: seller_id } });
        const buyer = await User.findOne({ where: { id: buyer_id } });

        await mailer.sendMail({
          to: seller.email,
          from: process.env.SMTP_FROM,
          subject: 'Novo pedido de compra',
          html: emailNovoPedidoVendedor(seller, product, buyer)
        });

        return order;
      });

      await Promise.all(createOrdersPromise);
      delete req.session.cart;
      Cart.init();
      return res.render('templates/orders/success');

    } catch (error) {
      console.error('Erro no processo de pedido:', error);
      return res.render('templates/orders/error');
    }
  },

  async update(req, res) {
    try {
      const { id, action } = req.params;
      const acceptedActions = ['close', 'cancel'];
      
      if (!acceptedActions.includes(action)) {
        return res.send('Ação inválida!');
      }

      const order = await Order.findOne({ where: { id } });
      if (!order) return res.send('Pedido não encontrado!');
      if (order.status != 'open') return res.send('Status inválido para esta ação!');

      const statuses = {
        close: 'sold',
        cancel: 'canceled'
      };
      
      order.status = statuses[action];
      await Order.update(id, { status: order.status });

      // Envia email apenas para pedidos confirmados
      if (action === 'close') {
        const product = await LoadProductService.load('product', {
          where: { id: order.product_id }
        });
        
        const seller = await User.findOne({ where: { id: order.seller_id } });
        const buyer = await User.findOne({ where: { id: order.buyer_id } });

        // Email para o COMPRADOR
        await mailer.sendMail({
          to: buyer.email,
          from: process.env.SMTP_FROM,
          subject: `Pedido #${order.id} confirmado!`,
          html: emailComprador(seller, product, buyer, order)
        });

        // Email para o VENDEDOR (confirmação específica)
        await mailer.sendMail({
          to: seller.email,
          from: process.env.SMTP_FROM,
          subject: `Venda confirmada - Pedido #${order.id}`,
          html: emailConfirmacaoVenda(seller, product, order)
        });
      }

      return res.redirect('/orders/sales');
      
    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
      return res.status(500).send('Erro ao processar pedido');
    }
  }
};