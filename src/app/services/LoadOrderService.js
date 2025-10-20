const Order = require('../models/Order');
const User = require('../models/User');
const LoadProductsService = require('./LoadProductService');
const { formatPrice, date } = require('../../lib/utils');

async function format(order) {
  if (!order) return null;
  
  order.product = await LoadProductsService.load('productWithDeleted', {
    where: { id: order.product_id }
  });
  order.buyer = await User.findOne({ where: { id: order.buyer_id } });
  order.seller = await User.findOne({ where: { id: order.seller_id } });
  
  order.formattedPrice = formatPrice(order.price);
  order.formattedTotal = formatPrice(order.total);
  
  const statuses = {
    open: 'Aberto',
    sold: 'Vendido',
    canceled: 'Cancelado'
  };
  order.formattedStatus = statuses[order.status] || order.status;
  
  const updatedAt = date(order.updated_at);
  order.formattedUpdatedAt = `${order.formattedStatus} em ${updatedAt.day}/${updatedAt.month}/${updatedAt.year} às ${updatedAt.hour}h${updatedAt.minutes}`;
  
  return order;
}

const LoadService = {
  filter: {},
  load(service, filter) {
    this.filter = filter;
    return LoadService[service]();
  },
  async order() {
    const order = await Order.findOne(this.filter);
    return await format(order);
  },
  async orders() {
    const orders = await Order.findAll(this.filter);
    return Promise.all(orders.map(order => format(order)));
  },
  format,
};

module.exports = LoadService;
