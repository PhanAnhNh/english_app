const parseDuration = (str) => {
    if (!str) return 0;
    // Xử lý nếu là số (ms)
    if (typeof str === 'number') return str;

    // Parse chuỗi
    const match = String(str).trim().match(/^(\d+)([smhd])$/);
    if (!match) return 0;

    const val = parseInt(match[1]);
    const unit = match[2];

    if (unit === 's') return val * 1000;
    if (unit === 'm') return val * 60 * 1000;
    if (unit === 'h') return val * 60 * 60 * 1000;
    if (unit === 'd') return val * 24 * 60 * 60 * 1000;

    return 0;
};

module.exports = { parseDuration };
