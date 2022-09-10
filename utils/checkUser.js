import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    if (!token) {
      next();
    } else {
      const decoded = jwt.decode(token, process.env.JWT_SECRET);
      req.reqUser = decoded?._id;
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Access denied',
    });
  }
};
