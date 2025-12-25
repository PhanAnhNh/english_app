const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const Grammar = require('../src/model/Grammar');
const GrammarCategory = require('../src/model/GrammarCategory');

const MONGO_URI = process.env.MONGO_URI;

const exportGrammarTitles = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('✅ Đã kết nối MongoDB thành công!');

        // Lấy tất cả grammars
        const grammars = await Grammar.find()
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 });

        console.log(`📊 Tìm thấy ${grammars.length} ngữ pháp`);

        // Tạo nội dung file
        let content = '';
        content += '='.repeat(100) + '\n';
        content += '📚 DANH SÁCH TIÊU ĐỀ TẤT CẢ NGỮ PHÁP\n';
        content += '='.repeat(100) + '\n';
        content += `Tổng số: ${grammars.length} ngữ pháp\n`;
        content += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n`;
        content += '='.repeat(100) + '\n\n';

        if (grammars.length === 0) {
            content += '⚠️  Không có ngữ pháp nào trong database.\n';
        } else {
            grammars.forEach((grammar, index) => {
                const category = grammar.categoryId ? grammar.categoryId.name : 'Không có';
                const level = grammar.level || 'N/A';
                content += `${(index + 1).toString().padStart(2, ' ')}. ${grammar.title.padEnd(45)} | Level: ${level.padEnd(3)} | Danh mục: ${category}\n`;
            });

            content += '\n' + '='.repeat(100) + '\n';
            content += `✨ Hoàn thành! Tổng cộng ${grammars.length} ngữ pháp.\n`;
            content += '='.repeat(100) + '\n';
        }

        // Xuất ra file
        const outputPath = path.join(__dirname, '..', 'DANH_SACH_TIEU_DE_NGU_PHAP.txt');
        fs.writeFileSync(outputPath, content, 'utf8');

        console.log(`✅ Đã xuất danh sách tiêu đề ra file: ${outputPath}`);
        console.log(`📄 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

        // In ra console luôn
        console.log('\n' + content);

        // Đóng kết nối
        await mongoose.connection.close();
        console.log('✅ Đã đóng kết nối MongoDB.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        console.error(err.stack);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

// Chạy script
exportGrammarTitles();
