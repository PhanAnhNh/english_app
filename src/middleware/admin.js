const adminMiddleware = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Truy cập bị từ chối: Cần quyền Admin.' });
    next();
};

module.exports = adminMiddleware;

