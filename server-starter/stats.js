// server/routes/stats.js
// Admin statistics and analytics routes

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { requireAdmin } = require('../middlewares/auth');

router.use(requireAdmin);

// GET /api/admin/stats - Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Inventory statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ active: true });
    const inStockProducts = await Product.countDocuments({ 
      active: true, 
      'inventory.stock': { $gt: 0 } 
    });
    const lowStockProducts = await Product.findLowStock();
    const outOfStockProducts = await Product.countDocuments({ 
      'inventory.stock': 0 
    });

    // Calculate total inventory value
    const inventoryValue = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$price', '$inventory.stock'] }
          }
        }
      }
    ]);

    // Order statistics
    const orderStats = await Order.getStats(start, end);

    // Recent activity
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber total status createdAt')
      .lean();

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title slug price createdAt')
      .lean();

    // Top selling products (last 30 days)
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          title: '$product.title',
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    // Revenue by day (last 30 days)
    const revenueByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      inventory: {
        total: totalProducts,
        active: activeProducts,
        inStock: inStockProducts,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts,
        totalValue: inventoryValue[0]?.totalValue || 0
      },
      orders: orderStats,
      topProducts,
      revenueByDay,
      recentActivity: {
        orders: recentOrders,
        products: recentProducts
      },
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats/inventory - Detailed inventory stats
router.get('/inventory', async (req, res) => {
  try {
    // Group products by category
    const byCategory = await Product.aggregate([
      { $match: { active: true } },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
          totalStock: { $sum: '$inventory.stock' },
          totalValue: { $sum: { $multiply: ['$price', '$inventory.stock'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          count: 1,
          totalStock: 1,
          totalValue: 1
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Price distribution
    const priceDistribution = await Product.aggregate([
      { $match: { active: true } },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 50000, 100000, 150000, 200000, 300000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            products: { $push: { title: '$title', price: '$price' } }
          }
        }
      }
    ]);

    res.json({
      byCategory,
      priceDistribution
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats/sales - Sales analytics
router.get('/sales', async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    let groupFormat;
    switch (period) {
      case 'day':
        groupFormat = '%Y-%m-%d %H:00';
        break;
      case 'week':
        groupFormat = '%Y-%U';
        break;
      case 'year':
        groupFormat = '%Y';
        break;
      default: // month
        groupFormat = '%Y-%m';
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      period,
      data: salesData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
