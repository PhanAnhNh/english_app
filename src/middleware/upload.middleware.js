const multer = require('multer');

// Cấu hình multer để lưu file trong memory
const storage = multer.memoryStorage();

// Validate file type
const fileFilter = (req, file, cb) => {
    // Cho phép images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    // Cho phép audio
    else if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Chỉ chấp nhận file ảnh hoặc âm thanh'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

module.exports = upload;
