const { unlinkSync } = require('fs');
const Category = require('../models/Category');
const Product = require('../models/Product');
const File = require('../models/File');
const LoadService = require('../services/LoadProductService');
const multer = require('multer');
const upload = multer({ dest: 'public/images/' }); // Caminho correto
const QRCode = require('qrcode');

module.exports = {
  async create(req, res) {
    try {
      const categories = await Category.findAll();
      return res.render('templates/products/create', { categories });
    } catch (err) {
      console.error("❌ Erro ao carregar criação de produto:", err);
      return res.status(500).send("Erro ao carregar a página de criação de produto.");
    }
  },

  async post(req, res) {
    try {
      let { category_id, name, description, old_price, price, quantity, status } = req.body;
      price = price.replace(/\D/g, '');

      const product_id = await Product.create({
        category_id,
        user_id: req.session.userId,
        name,
        description,
        old_price: old_price || price,
        price,
        quantity,
        status: status || 1
      });

      if (req.files.length > 0) {
        const filesPromise = req.files.map(file => File.create({
          name: file.filename,
          path: file.path,
          product_id
        }));
        await Promise.all(filesPromise);
      }

      return res.redirect(`/products/${product_id}`);
    } catch (err) {
      console.error("❌ Erro ao criar produto:", err);
      return res.status(500).send("Erro ao criar produto.");
    }
  },

  // Renderiza o template de checkout para Cartão de Crédito
  async checkoutCreditCard(req, res) {
    try {
      return res.render('templates/payment/checkout-credit-card', {
        total: req.session.cart.total
      });
    } catch (err) {
      console.error("❌ Erro ao carregar checkout com Cartão de Crédito:", err);
      return res.status(500).send("Erro ao carregar página de pagamento com Cartão de Crédito.");
    }
  },

  // Renderiza o template de checkout para PIX e gera o QR Code PIX
  async checkoutPix(req, res) {
    try {
      // Exemplo de payload PIX (substitua pelos seus dados reais e respeite o padrão)
      const pixPayload = '00020101021226800014br.gov.bcb.pix2565pix.exemplo.com/qr-code-hash520400005303986540510.005802BR5913Nome Exemplo6009SAO PAULO62070503***63041D3D';
      
      // Gera a URL do QR Code a partir do payload
      const qrCodeDataUrl = await QRCode.toDataURL(pixPayload);
      
      return res.render('templates/payment/checkout-pix', {
        total: req.session.cart.total,
        qrCodeDataUrl
      });
    } catch (err) {
      console.error("❌ Erro ao gerar QR Code PIX:", err);
      return res.status(500).send("Erro ao gerar QR Code para PIX");
    }
  },

  async checkout(req, res) {
    try {
      return res.render('templates/payment/checkout', {
        total: req.session.cart.total
      });
    } catch (err) {
      console.error("❌ Erro ao carregar checkout:", err);
      return res.status(500).send("Erro ao carregar página de pagamento");
    }
  },
  
  async show(req, res) {
    try {
      const productId = Number(req.params.id);
      if (isNaN(productId) || productId <= 0) {
        return res.status(400).send("ID do produto inválido.");
      }

      const product = await LoadService.load('product', { where: { id: productId } });
      if (!product) {
        return res.status(404).send("Produto não encontrado.");
      }
      return res.render('templates/products/show', { product });
    } catch (err) {
      console.error("❌ Erro ao carregar produto:", err);
      return res.status(500).send("Erro ao carregar o produto.");
    }
  },

  async edit(req, res) {
    try {
      const productId = Number(req.params.id);
      if (isNaN(productId) || productId <= 0) {
        return res.status(400).send("ID do produto inválido.");
      }
      const product = await LoadService.load('product', { where: { id: productId } });
      if (!product) {
        return res.status(404).send("Produto não encontrado.");
      }
      const categories = await Category.findAll();
      return res.render('templates/products/edit', { product, categories });
    } catch (err) {
      console.error("❌ Erro ao carregar edição de produto:", err);
      return res.status(500).send("Erro ao carregar a página de edição.");
    }
  },

  async put(req, res) {
    try {
      if (req.files.length > 0) {
        const newFilesPromise = req.files.map(file =>
          File.create({
            name: file.filename,
            path: file.path,
            product_id: req.body.id
          })
        );
        await Promise.all(newFilesPromise);
      }

      if (req.body.removed_files) {
        const removedFiles = req.body.removed_files.split(',').filter(Boolean);
        await Promise.all(removedFiles.map(id => File.delete(id)));
      }

      req.body.price = req.body.price.replace(/\D/g, '');
      const oldProduct = await Product.findOne({ where: { id: req.body.id } });
      if (oldProduct && req.body.old_price != req.body.price) {
        req.body.old_price = oldProduct.price;
      }
      await Product.update(req.body.id, {
        category_id: req.body.category_id,
        name: req.body.name,
        description: req.body.description,
        old_price: req.body.old_price,
        price: req.body.price,
        quantity: req.body.quantity,
        status: req.body.status
      });
      return res.redirect(`/products/${req.body.id}`);
    } catch (err) {
      console.error("❌ Erro ao atualizar produto:", err);
      return res.status(500).send("Erro ao atualizar o produto.");
    }
  },

  async delete(req, res) {
    try {
      const files = await Product.files(req.body.id);
      await Product.delete(req.body.id);
      await Promise.all(
        files.map(file => {
          try {
            unlinkSync(file.path);
          } catch (err) {
            console.error("❌ Erro ao excluir arquivo:", err);
          }
        })
      );
      return res.redirect('/');
    } catch (err) {
      console.error("❌ Erro ao deletar produto:", err);
      return res.status(500).send("Erro ao deletar o produto.");
    }
  }
};
