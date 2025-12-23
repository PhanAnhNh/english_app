const Grammar = require('../model/Grammar');
const GrammarCategory = require('../model/GrammarCategory');

const getGrammars = async (filters) => {
    const { page = 1, limit, sortBy = 'createdAt', sortOrder = 'asc', level, search, categoryId } = filters;

    let filter = {};

    // Filter by level
    if (level) filter.level = level;

    // Filter by categoryId
    if (categoryId) {
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(categoryId)) {
            filter.categoryId = categoryId;
        } else {
            // Nếu ID không hợp lệ, trả về kết quả rỗng thay vì lỗi 500
            return {
                total: 0,
                page: parseInt(page) || 1,
                limit: limit ? parseInt(limit) : 0,
                totalPages: 0,
                data: []
            };
        }
    }

    // Filter by search (title or content)
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
        ];
    }

    // Count total with filters applied
    const total = await Grammar.countDocuments(filter);

    // Find with filters
    let query = Grammar.find(filter)
        .populate('categoryId')
        .sort({ createdAt: -1 });

    if (limit && !isNaN(parseInt(limit))) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        query = query.skip(skip).limit(limitNum);
    }

    const data = await query;

    return {
        total,
        page: parseInt(page) || 1,
        limit: limit ? parseInt(limit) : total,
        totalPages: limit ? Math.ceil(total / parseInt(limit)) : 1,
        data
    };
};

const getGrammarById = async (grammarId) => {
    const item = await Grammar.findById(grammarId);
    if (!item) {
        throw new Error('Không tìm thấy bài ngữ pháp');
    }
    return item;
};

const createGrammar = async (grammarData) => {
    const item = new Grammar(grammarData);
    await item.save();
    return item;
};

const updateGrammar = async (grammarId, grammarData) => {
    const updated = await Grammar.findByIdAndUpdate(grammarId, grammarData, { new: true });
    return updated;
};

const deleteGrammar = async (grammarId) => {
    await Grammar.findByIdAndDelete(grammarId);
    return { message: 'Đã xóa thành công' };
};

const getGrammarCategories = async () => {
    const categories = await GrammarCategory.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 });
    return categories;
};

const getGrammarCategoriesWithCount = async (level) => {
    let filter = { isActive: true };
    if (level) filter.level = level;

    // Lấy tất cả categories
    const categories = await GrammarCategory.find(filter)
        .sort({ order: 1, createdAt: -1 });

    // Thêm số lượng grammar trong mỗi category
    const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
            const grammarCount = await Grammar.countDocuments({
                categoryId: category._id,
                isPublished: true
            });

            // Lấy 3 bài grammar mới nhất trong category
            const recentGrammars = await Grammar.find({
                categoryId: category._id,
                isPublished: true
            })
                .sort({ createdAt: -1 })
                .limit(3)
                .select('title level');

            return {
                id: category._id,
                name: category.name,
                description: category.description,
                icon: category.icon,
                level: category.level,
                order: category.order,
                grammarCount,
                recentGrammars,
                createdAt: category.createdAt
            };
        })
    );

    // Filter out categories with 0 grammar
    const filteredCategories = categoriesWithCount.filter(cat => cat.grammarCount > 0);

    return {
        total: filteredCategories.length,
        categories: filteredCategories
    };
};

const getGrammarCategoryById = async (categoryId, filters) => {
    const { page = 1, limit = 10, level, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // 1. Lấy thông tin category
    const category = await GrammarCategory.findById(categoryId);
    if (!category || !category.isActive) {
        throw new Error('Không tìm thấy chủ đề');
    }

    // 2. Tạo filter cho grammar
    let filter = {
        categoryId: category._id,
        isPublished: true
    };

    if (level) filter.level = level;

    // 3. Lấy tổng số và danh sách grammar
    const total = await Grammar.countDocuments(filter);

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const grammarList = await Grammar.find(filter)
        .select('title level structure content example createdAt')
        .skip(skip)
        .limit(limitNum)
        .sort(sortOptions);

    // 4. Lấy các sub-categories (nếu có)
    const subCategories = await GrammarCategory.find({
        parentCategoryId: category._id,
        isActive: true
    });

    // 5. Lấy category cha (nếu có)
    let parentCategory = null;
    if (category.parentCategoryId) {
        parentCategory = await GrammarCategory.findById(category.parentCategoryId)
            .select('name id');
    }

    return {
        category: {
            id: category._id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            level: category.level,
            parentCategory
        },
        grammarList: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            data: grammarList
        },
        subCategories,
        stats: {
            totalGrammar: total,
            subCategoryCount: subCategories.length
        }
    };
};

const getGrammarCategoryDetail = async (categoryId) => {
    const category = await GrammarCategory.findById(categoryId);
    if (!category) {
        throw new Error('Không tìm thấy danh mục');
    }
    return category;
};

const createGrammarCategory = async (categoryData) => {
    const category = new GrammarCategory(categoryData);
    await category.save();
    return category;
};

const updateGrammarCategory = async (categoryId, categoryData) => {
    const updated = await GrammarCategory.findByIdAndUpdate(
        categoryId,
        categoryData,
        { new: true }
    );
    return updated;
};

const deleteGrammarCategory = async (categoryId) => {
    await GrammarCategory.findByIdAndUpdate(categoryId, { isActive: false });
    return { message: 'Đã ẩn danh mục' };
};

const getGrammarsByCategory = async (categoryId, filters) => {
    const { page = 1, limit, level } = filters;

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return {
            total: 0,
            page: parseInt(page) || 1,
            limit: limit ? parseInt(limit) : 0,
            totalPages: 0,
            data: []
        };
    }

    let filter = {
        categoryId,
        isPublished: true
    };

    if (level) filter.level = level;

    const total = await Grammar.countDocuments(filter);
    let query = Grammar.find(filter)
        .populate('categoryId', 'name icon')
        .sort({ createdAt: -1 });

    if (limit && !isNaN(parseInt(limit))) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        query = query.skip(skip).limit(limitNum);
    }

    const data = await query;

    return {
        total,
        page: parseInt(page) || 1,
        limit: limit ? parseInt(limit) : total,
        totalPages: limit ? Math.ceil(total / parseInt(limit)) : 1,
        data
    };
};

module.exports = {
    getGrammars,
    getGrammarById,
    createGrammar,
    updateGrammar,
    deleteGrammar,
    getGrammarCategories,
    getGrammarCategoriesWithCount,
    getGrammarCategoryById,
    getGrammarCategoryDetail,
    createGrammarCategory,
    updateGrammarCategory,
    deleteGrammarCategory,
    getGrammarsByCategory
};

