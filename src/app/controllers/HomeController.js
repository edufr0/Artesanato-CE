// src/app/controllers/HomeController.js
const LoadProductsService = require('../services/LoadProductService');
const db = require('../../config/db');

module.exports = {
  async index(req, res) {
    try {
      // Carrega todos os produtos
      const allProducts = await LoadProductsService.load('products');

      let { page, category } = req.query;
      page = page ? Number(page) : 1;

      const limit = 9;
      const offset = (page - 1) * limit;

      // Filtra os produtos se uma categoria for selecionada
      let filteredProducts = allProducts;
      if (category) {
        filteredProducts = filteredProducts.filter(product => product.category_id == category);
      }

      const paginatedProducts = filteredProducts.slice(offset, offset + limit);
      const totalPages = Math.ceil(filteredProducts.length / limit);

      // Busca as categorias diretamente do banco de dados
      const categoriesResults = await db.query('SELECT id, name FROM categories');
      const categories = categoriesResults.rows;

      return res.render('templates/home/index', {
        products: paginatedProducts,
        totalPages,
        currentPage: page,
        categories,
        selectedCategory: category || ''
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao carregar produtos.");
    }
  }
};
