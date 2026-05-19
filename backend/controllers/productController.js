const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
        ? { title: { $regex: req.query.keyword, $options: 'i' } }
        : {};

    const mongoose = require('mongoose');
    let categoryFilter = {};
    if (req.query.category) {
        if (mongoose.Types.ObjectId.isValid(req.query.category)) {
            categoryFilter = { category: req.query.category };
        } else {
            // Handle special cases or filter by category name
            const Category = require('../models/Category');
            const cat = await Category.findOne({ name: { $regex: req.query.category, $options: 'i' } });
            if (cat) {
                categoryFilter = { category: cat._id };
            }
        }
    }

    const priceFilter = req.query.minPrice || req.query.maxPrice
        ? { price: { $gte: Number(req.query.minPrice) || 0, $lte: Number(req.query.maxPrice) || 99999 } }
        : {};

    const dealFilter = req.query.dealType ? { dealType: req.query.dealType } : {};
    const colorFilter = req.query.color ? { colors: req.query.color } : {};
    const sizeFilter = req.query.size ? { sizes: req.query.size } : {};
    const materialFilter = req.query.material ? { material: req.query.material } : {};

    const filter = { ...keyword, ...categoryFilter, ...priceFilter, ...dealFilter, ...colorFilter, ...sizeFilter, ...materialFilter };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
        .populate('category', 'name')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    // Fetch dynamic filter counts
    const aggregateFilter = { ...keyword, ...categoryFilter, ...priceFilter, ...dealFilter }; // Base filter without size/color/material
    
    const [counts] = await Product.aggregate([
        { $match: aggregateFilter },
        {
            $facet: {
                colors: [{ $unwind: '$colors' }, { $group: { _id: '$colors', count: { $sum: 1 } } }],
                sizes: [{ $unwind: '$sizes' }, { $group: { _id: '$sizes', count: { $sum: 1 } } }],
                materials: [{ $group: { _id: '$material', count: { $sum: 1 } } }]
            }
        }
    ]);

    res.json({ 
        products, 
        page, 
        pages: Math.ceil(count / pageSize), 
        total: count,
        metadata: {
            colors: counts.colors.map(c => ({ name: c._id, count: c.count })),
            sizes: counts.sizes.map(s => ({ name: s._id, count: s.count })),
            materials: counts.materials.filter(m => m._id).map(m => ({ name: m._id, count: m.count }))
        }
    });
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { title, description, price, discountPrice, brand, category, stock, sizes, colors, dealType, shippingCharges, applyShippingCharges, isCodAvailable } = req.body;

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => file.path);
    } else if (req.body.images) {
        imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else {
        imageUrls = ['https://placehold.co/600x800?text=Wearixa'];
    }

    let parsedSizes = [];
    if (sizes) {
        parsedSizes = Array.isArray(sizes) ? sizes : sizes.split(',').map((s) => s.trim()).filter(Boolean);
    }

    let parsedColors = [];
    if (colors) {
        parsedColors = Array.isArray(colors) ? colors : colors.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const product = new Product({
        title,
        images: imageUrls,
        description,
        price,
        discountPrice: discountPrice ? Number(discountPrice) : 0,
        brand,
        category,
        stock,
        sizes: parsedSizes,
        colors: parsedColors,
        dealType: dealType || '',
        shippingCharges: shippingCharges ? Number(shippingCharges) : 0,
        applyShippingCharges: applyShippingCharges === 'true' || applyShippingCharges === true,
        isCodAvailable: isCodAvailable !== undefined ? (isCodAvailable === 'true' || isCodAvailable === true) : true,
        user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { title, description, price, discountPrice, brand, category, stock, images, sizes, colors, dealType, shippingCharges, applyShippingCharges, isCodAvailable } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.title = title || product.title;
        product.description = description || product.description;
        product.price = price !== undefined ? price : product.price;
        product.discountPrice = discountPrice !== undefined ? Number(discountPrice) : product.discountPrice;
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;
        product.dealType = dealType !== undefined ? dealType : product.dealType;
        product.shippingCharges = shippingCharges !== undefined ? Number(shippingCharges) : product.shippingCharges;
        product.applyShippingCharges = applyShippingCharges !== undefined ? (applyShippingCharges === 'true' || applyShippingCharges === true) : product.applyShippingCharges;
        product.isCodAvailable = isCodAvailable !== undefined ? (isCodAvailable === 'true' || isCodAvailable === true) : product.isCodAvailable;

        if (sizes !== undefined) {
            product.sizes = Array.isArray(sizes) ? sizes : sizes.split(',').map((s) => s.trim()).filter(Boolean);
        }

        if (colors !== undefined) {
            product.colors = Array.isArray(colors) ? colors : colors.split(',').map((s) => s.trim()).filter(Boolean);
        }

        if (images) {
            product.images = Array.isArray(images) ? images : [images];
        }

        if (req.files && req.files.length > 0) {
            product.images = req.files.map(file => file.path);
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            images: imageUrls,
            user: req.user._id,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
// @desc    Get product recommendations (hybrid collaborative/content-based filtering)
// @route   GET /api/products/recommendations
// @access  Public
const getRecommendations = asyncHandler(async (req, res) => {
    const { currentProductId, cartProductIds, recentlyViewedCategories } = req.query;

    const cartIds = cartProductIds ? cartProductIds.split(',').filter(Boolean) : [];
    const viewedCats = recentlyViewedCategories ? recentlyViewedCategories.split(',').filter(Boolean) : [];

    // 1. Manually parse optional Bearer token to get logged-in user order history
    let favoriteCategories = [];
    const jwt = require('jsonwebtoken');
    const Order = require('../models/Order');

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            const userOrders = await Order.find({ user: decoded.id });
            const categoriesBought = [];
            for (const order of userOrders) {
                for (const item of order.orderItems) {
                    const prod = await Product.findById(item.product);
                    if (prod && prod.category) {
                        categoriesBought.push(prod.category.toString());
                    }
                }
            }
            favoriteCategories = [...new Set(categoriesBought)];
        } catch (err) {
            // Silence auth failures to fallback gracefully
        }
    }

    // 2. Fetch all active products
    const products = await Product.find({ stock: { $gt: 0 } }).populate('category', 'name');

    // 3. Find current product's category if provided
    let currentCategory = null;
    if (currentProductId) {
        const currentProd = await Product.findById(currentProductId);
        if (currentProd && currentProd.category) {
            currentCategory = currentProd.category.toString();
        }
    }

    // 4. Calculate recommendation score for each product
    const scoredProducts = products.map((product) => {
        let score = 0;
        const prodIdStr = product._id.toString();
        const catIdStr = product.category ? product.category._id.toString() : '';

        // Exclusions: Do not recommend product currently viewed or already in cart
        if (currentProductId && prodIdStr === currentProductId) {
            score -= 100;
        }
        if (cartIds.includes(prodIdStr)) {
            score -= 100;
        }

        // Feature 1: Category similarity (strong match)
        if (currentCategory && catIdStr === currentCategory) {
            score += 5;
        }

        // Feature 2: Past purchased categories boost (personalized loyalty signal)
        if (favoriteCategories.includes(catIdStr)) {
            score += 4;
        }

        // Feature 3: Recently viewed categories boost (active session session intent)
        if (viewedCats.includes(catIdStr)) {
            score += 3;
        }

        // Feature 4: Active deals and campaigns boost
        if (product.discountPrice > 0 || product.dealType) {
            score += 1.5;
        }

        // Feature 5: Popularity & rating score boost
        if (product.rating) {
            score += product.rating * 0.5; // Scale: max rating of 5 adds 2.5 points
        }

        return { product, score };
    });

    // 5. Filter out low score/excluded items and sort by recommendation score descending
    const recommendations = scoredProducts
        .filter(item => item.score > -50)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product)
        .slice(0, 6);

    res.json(recommendations);
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview, getRecommendations };
