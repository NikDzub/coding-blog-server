import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    if (!token) {
      return res.status(403).json({
        message: 'Access denied',
      });
    } else {
      const decoded = jwt.decode(token, process.env.JWT_SECRET);
      if (decoded._id) {
        req._id = decoded._id;
        next();
      }
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Access denied',
    });
  }
};
