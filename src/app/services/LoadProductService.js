const Product = require('../models/Product');
const { formatPrice, date } = require('../../lib/utils');

async function getImages(productId) {
  const productIdNum = Number(productId);
  if (isNaN(productIdNum) || productIdNum <= 0) return [];

  let files = await Product.files(productIdNum);
  if (!files || files.length === 0) return [];

  return files
    .filter(file => file?.path)
    .map(file => ({
      ...file,
      src: file.path.replace(/\\/g, '/').replace('public', '')
    }));
}

async function format(product) {
  if (!product || !product.id || isNaN(product.id)) return null;

  const files = await getImages(product.id);
  product.img = files.length > 0 ? files[0].src : null;
  product.files = files;

  product.formatedOldPrice = formatPrice(product.old_price || 0);
  product.formatedPrice = formatPrice(product.price || 0);

  const { minutes, hour, day, month } = date(product.updated_at);
  product.published = {
    day: `${day}/${month}`,
    hour: `${hour}h${minutes}`
  };

  const { 
    minutes: createdMinutes, 
    hour: createdHour, 
    day: createdDay, 
    month: createdMonth 
  } = date(product.created_at);
  
  product.formatedCreatedAt = `${createdDay}/${createdMonth} às ${createdHour}h${createdMinutes}`;

  return product;
}

const LoadService = {
  load(service, filter) {
    this.filter = filter;
    return this[service]();
  },
  async product() {
    const product = await Product.findOne(this.filter);
    return product ? format(product) : null;
  },
  async products() {
    const products = await Product.findAll(this.filter);
    return Promise.all(products.map(format));
  },
  async productWithDeleted() {
    const product = await Product.findOne(this.filter);
    return product ? format(product) : null;
  },
  format
};

module.exports = LoadService;
