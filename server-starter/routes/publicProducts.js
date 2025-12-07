// server/routes/publicProducts.js
// Express routes for public product access

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - List products (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = '-createdAt'
    } = req.query;

    // Base query - only active products with stock
    const query = {
      active: true,
      'inventory.stock': { $gt: 0 }
    };

    // Category filter
    if (category) {
      query.categories = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search filter (full-text search)
    if (search) {
      query.$text = { $search: search };
    }

    // Sort mapping
    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'name': { title: 1 },
      'newest': { createdAt: -1 },
      'featured': { order: 1, createdAt: -1 }
    };
    const sort = sortMap[sortBy] || { createdAt: -1 };

    const products = await Product.find(query)
      .populate('categories', 'name slug')
      .select('-__v')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    const count = await Product.countDocuments(query);

    res.json({
      data: products,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      limit: parseInt(limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:slug - Get product by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      active: true,
      'inventory.stock': { $gt: 0 }
    })
    .populate('categories', 'name slug')
    .select('-__v')
    .lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unavailable' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/related/:id - Get related products
router.get('/related/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find products in same categories
    const relatedProducts = await Product.find({
      _id: { $ne: req.params.id },
      categories: { $in: product.categories },
      active: true,
      'inventory.stock': { $gt: 0 }
    })
    .limit(4)
    .select('title slug price images')
    .lean();

    res.json(relatedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/featured - Get featured products
router.get('/lists/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const products = await Product.find({
      active: true,
      'inventory.stock': { $gt: 0 }
    })
    .sort({ order: 1, createdAt: -1 })
    .limit(parseInt(limit))
    .select('title slug price images')
    .lean();

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
