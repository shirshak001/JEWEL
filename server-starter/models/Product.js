// server/models/Product.js
// Mongoose schema for Product model

const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: String,
  isPrimary: { type: Boolean, default: false }
});

const AttributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: String
});

const ProductSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(value) {
        return !value || value < this.price;
      },
      message: 'Sale price must be less than regular price'
    }
  },
  categories: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
  }],
  tags: [{
    type: String,
    trim: true
  }],
  images: [ImageSchema],
  inventory: {
    sku: {
      type: String,
      required: true,
      unique: true
    },
    stock: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  attributes: [AttributeSchema],
  active: { 
    type: Boolean, 
    default: true 
  },
  lowStockThreshold: {
    type: Number,
    default: 3
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
ProductSchema.index({ slug: 1 });
ProductSchema.index({ active: 1, 'inventory.stock': 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ title: 'text', description: 'text' }); // Full-text search

// Virtual for checking if product is in stock
ProductSchema.virtual('inStock').get(function() {
  return this.inventory.stock > 0;
});

// Virtual for checking if product has low stock
ProductSchema.virtual('lowStock').get(function() {
  return this.inventory.stock > 0 && this.inventory.stock <= this.lowStockThreshold;
});

// Virtual for primary image
ProductSchema.virtual('primaryImage').get(function() {
  return this.images.find(img => img.isPrimary) || this.images[0] || null;
});

// Pre-save hook to generate slug from title if not provided
ProductSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Pre-save hook to generate SKU if not provided
ProductSchema.pre('save', function(next) {
  if (!this.inventory.sku) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.inventory.sku = `AMB-${timestamp}-${random}`;
  }
  next();
});

// Static method to find active products with stock
ProductSchema.statics.findAvailable = function() {
  return this.find({ 
    active: true, 
    'inventory.stock': { $gt: 0 } 
  });
};

// Static method to find low stock products
ProductSchema.statics.findLowStock = function() {
  return this.find({
    active: true,
    $expr: { 
      $and: [
        { $gt: ['$inventory.stock', 0] },
        { $lte: ['$inventory.stock', '$lowStockThreshold'] }
      ]
    }
  });
};

// Instance method to check availability
ProductSchema.methods.isAvailable = function() {
  return this.active && this.inventory.stock > 0;
};

// Instance method to decrease stock
ProductSchema.methods.decreaseStock = function(quantity) {
  if (this.inventory.stock >= quantity) {
    this.inventory.stock -= quantity;
    return this.save();
  }
  throw new Error('Insufficient stock');
};

// Instance method to increase stock
ProductSchema.methods.increaseStock = function(quantity) {
  this.inventory.stock += quantity;
  return this.save();
};

// Enable virtuals in JSON output
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);
