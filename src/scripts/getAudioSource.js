const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

/**
 * Hàm lấy toàn bộ link audio (src) từ thẻ <source type="audio/mpeg">
 * @param {string} targetUrl - Link trang web cần quét
 */
async function getAudioSource(targetUrl) {
    try {
        console.log(`📡 Đang quét: ${targetUrl}`);

        const { data } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const audioSources = [];

        // 1. Tìm thẻ <source type="audio/mpeg"> (Đúng yêu cầu của bạn)
        $('source[type="audio/mpeg"]').each((index, element) => {
            let src = $(element).attr('src');
            if (src) audioSources.push(url.resolve(targetUrl, src));
        });

        // 2. Tìm thẻ <source> có đuôi .mp3 (Phòng trường hợp thiếu type)
        if (audioSources.length === 0) {
            $('source[src$=".mp3"]').each((index, element) => {
                let src = $(element).attr('src');
                if (src) audioSources.push(url.resolve(targetUrl, src));
            });
        }

        // 3. Tìm thẻ <audio src="..."> trực tiếp
        if (audioSources.length === 0) {
            $('audio[src]').each((index, element) => {
                let src = $(element).attr('src');
                if (src) audioSources.push(url.resolve(targetUrl, src));
            });
        }

        if (audioSources.length > 0) {
            console.log(`✅ Tìm thấy ${audioSources.length} link audio:`);
            audioSources.forEach((src, i) => console.log(`  [${i + 1}] ${src}`));
            return audioSources;
        } else {
            console.log('❌ Không tìm thấy thẻ <source type="audio/mpeg"> nào.');
            return [];
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        return [];
    }
}

// Lấy tham số từ dòng lệnh
const args = process.argv.slice(2);
const inputUrl = args[0] || 'https://dictionary.cambridge.org/vi/dictionary/english/hello'; // URL mặc định để test

getAudioSource(inputUrl);
