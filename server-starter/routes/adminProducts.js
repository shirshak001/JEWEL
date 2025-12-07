// server/routes/adminProducts.js
// Express routes for admin product management

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { requireAdmin } = require('../middlewares/auth');

// Apply auth middleware to all admin routes
router.use(requireAdmin);

// GET /api/admin/products - List all products
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      includeInactive = false,
      stockStatus,
      sortBy = '-createdAt'
    } = req.query;

    const query = {};
    
    // Filter by active status
    if (!includeInactive) {
      query.active = true;
    }
    
    // Filter by stock status
    if (stockStatus) {
      if (stockStatus === 'out') {
        query['inventory.stock'] = 0;
      } else if (stockStatus === 'low') {
        // Products with stock > 0 and <= lowStockThreshold
        // This requires aggregation or client-side filtering
      } else if (stockStatus === 'in-stock') {
        query['inventory.stock'] = { $gt: 0 };
      }
    }

    const products = await Product.find(query)
      .populate('categories')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.json({
      products,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/products - Create product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Product with this slug or SKU already exists' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

// GET /api/admin/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categories');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/products/:id/stock - Update stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'increase' | 'decrease' | 'set'
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (operation === 'increase') {
      await product.increaseStock(quantity);
    } else if (operation === 'decrease') {
      await product.decreaseStock(quantity);
    } else if (operation === 'set') {
      product.inventory.stock = quantity;
      await product.save();
    }
    
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/products/low-stock - Get low stock products
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const products = await Product.findLowStock();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/products/bulk - Bulk update
router.post('/bulk', async (req, res) => {
  try {
    const { ids, updates } = req.body;
    
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: updates }
    );
    
    res.json({
      message: `${result.modifiedCount} products updated`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
