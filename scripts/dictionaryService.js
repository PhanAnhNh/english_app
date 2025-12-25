const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

/**
 * Lấy dữ liệu từ Cambridge Dictionary cho một từ vựng
 * @param {string} word - Từ vựng cần tra
 * @returns {Promise<{pronunciation: string, example: string, audioUrl: string, type: string}>}
 */
async function fetchWordData(word) {
    const targetUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`;
    try {
        const { data } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.google.com/'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);

        // 1. Phái âm (Ưu tiên UK)
        let ipa = $('.uk .ipa').first().text() || $('.ipa').first().text();
        let pronunciation = ipa ? `/ ${ipa} /` : '';

        // 2. Ví dụ (Lấy câu đầu tiên)
        let example = $('.eg').first().text().trim();

        // 3. Audio (Ưu tiên UK)
        let audioSrc = $('.uk source[type="audio/mpeg"]').first().attr('src') ||
            $('source[type="audio/mpeg"]').first().attr('src');
        let audioUrl = audioSrc ? url.resolve(targetUrl, audioSrc) : '';

        // 4. Loại từ (Noun, Verb...)
        let type = $('.pos.dpos').first().text().trim();

        console.log(`  🔍 Captured [${word}]: ${pronunciation} | Type: ${type} | Audio: ${audioUrl ? 'Yes' : 'No'}`);

        return { pronunciation, example, audioUrl, type };
    } catch (error) {
        console.warn(`  ⚠️ Could not fetch data for [${word}]: ${error.message}`);
        return { pronunciation: '', example: '', audioUrl: '', type: '' };
    }
}

/**
 * Lấy URL ảnh từ Google Search
 * @param {string} word - Từ vựng cần tìm ảnh
 * @returns {Promise<string>} - URL ảnh
 */
async function fetchImageUrl(word) {
    // Thêm tham số tbs=iar:w (Wide aspect ratio) và isz:l (Large size)
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(word)}+cartoon+images&tbm=isch&tbs=iar:w,isz:l`;
    try {
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);

        let imageUrl = '';

        // Cách 1: Tìm trong script block (nơi Google chứa dữ liệu ảnh gốc/lớn hơn)
        // Sử dụng regex pattern để bóc tách link gốc và kích thước
        // Pattern: [0,"ID",["thumbnail",h,w],["original",h,w]]
        const scripts = $('script');
        const pattern = /\[0,"([^"]+)",\["https:\/\/encrypted-tbn0\.gstatic\.com\/[^"]+",\d+,\d+\],\["([^"]+)",(\d+),(\d+)\]/g;

        let candidates = [];

        scripts.each((i, script) => {
            const text = $(script).html();
            if (text) {
                let match;
                while ((match = pattern.exec(text)) !== null) {
                    const url = match[2].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
                    const height = parseInt(match[3]); // Metadata Google: [url, height, width]
                    const width = parseInt(match[4]);

                    // Chỉ lấy các link hop le
                    if (url.startsWith('http') && !url.includes('gstatic.com')) {
                        candidates.push({ url, width, height });
                    }
                }
            }
        });

        // Lọc ra các ứng viên thực sự là khổ ngang chuẩn (Tỉ lệ từ 1.5 đến 2.0)
        // Chiều cao không quá 2/3 rộng (không quá vuông)
        // Chiều cao không ít hơn 1/2 rộng (không quá dài/mỏng)
        const landscapeCandidates = candidates.filter(c =>
            c.height <= (c.width * 2 / 3) &&
            c.height >= (c.width * 1 / 2)
        );

        if (landscapeCandidates.length > 0) {
            // Kiểm tra xem URL có phải là jpg hoặc png không
            const isJpgOrPng = (url) => /\.(jpe?g|png)(\?.*)?$/i.test(url);

            // Ưu tiên 1: Khổ ngang, định dạng JPG/PNG, độ rộng >= 800
            let bestMatch = landscapeCandidates.find(c => isJpgOrPng(c.url) && c.width >= 800);

            // Ưu tiên 2: Khổ ngang, định dạng JPG/PNG, bất kể độ rộng
            if (!bestMatch) {
                bestMatch = landscapeCandidates.find(c => isJpgOrPng(c.url));
            }

            // Ưu tiên 3: Khổ ngang, độ rộng >= 800 (nếu không tìm thấy JPG/PNG)
            if (!bestMatch) {
                bestMatch = landscapeCandidates.find(c => c.width >= 800);
            }

            // Cuối cùng: Lấy cái ngang đầu tiên nếu vẫn chưa có
            if (!bestMatch) {
                bestMatch = landscapeCandidates[0];
            }

            imageUrl = bestMatch.url;
            console.log(`  🌟 Found image: ${bestMatch.width}x${bestMatch.height} | Format: ${isJpgOrPng(imageUrl) ? 'JPG/PNG' : 'Other'}`);
        } else {
            console.log(`  ⚠️ No landscape image found for [${word}]. Leaving empty.`);
            imageUrl = ''; // Không có khổ ngang thì để trống luôn
        }

        // Cách 2: Fallback về thumbnail (BỎ QUA nếu người dùng muốn bắt buộc khổ ngang)
        // Link thumbnail của Google thường là ảnh nhỏ/vuông, không đáp ứng yêu cầu ngang
        /*
        if (!imageUrl) {
            $('img').each((i, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src && src.startsWith('http') && !src.includes('googlelogo')) {
                    imageUrl = src;
                    return false;
                }
            });
        }
        */

        console.log(`  🔍 Captured Image [${word}]: ${imageUrl ? 'Yes' : 'No'}`);
        return imageUrl;
    } catch (error) {
        console.warn(`  ⚠️ Could not fetch image for [${word}]: ${error.message}`);
        return '';
    }
}

module.exports = { fetchWordData, fetchImageUrl };
