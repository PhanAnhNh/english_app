/**
 * Generic bulk delete helper
 * Creates a bulk delete function for any Mongoose model
 */

const createBulkDelete = (Model, options = {}) => {
    const {
        cascadeDeletes = [], // Array of { model: Model, field: 'foreignKey' }
        reorder = false,      // Whether to reorder remaining items
        orderField = 'order'  // Field name for ordering
    } = options;

    return async (ids) => {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Danh sách ID không hợp lệ');
        }

        const results = {
            success: [],
            failed: []
        };

        for (const id of ids) {
            try {
                const item = await Model.findById(id);
                if (!item) {
                    results.failed.push({ id, reason: 'Không tìm thấy' });
                    continue;
                }

                // Cascade deletes
                for (const cascade of cascadeDeletes) {
                    await cascade.model.deleteMany({ [cascade.field]: id });
                }

                // Delete the item
                await Model.findByIdAndDelete(id);
                results.success.push(id);

            } catch (err) {
                results.failed.push({ id, reason: err.message });
            }
        }

        // Reorder if needed
        if (reorder) {
            const remaining = await Model.find({}).sort({ [orderField]: 1 });
            for (let i = 0; i < remaining.length; i++) {
                if (remaining[i][orderField] !== i + 1) {
                    await Model.findByIdAndUpdate(remaining[i]._id, { [orderField]: i + 1 });
                }
            }
        }

        return {
            message: `Đã xóa ${results.success.length}/${ids.length} mục`,
            successCount: results.success.length,
            failCount: results.failed.length,
            details: results
        };
    };
};

module.exports = { createBulkDelete };
