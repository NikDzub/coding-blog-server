import dotenv from 'dotenv/config';
import { connectDB } from './config/db.js';
import cors from 'cors';
import express from 'express';

import checkAuth from './utils/checkAuth.js';
import { changePfp } from './controllers/profileController.js';

import { authRoutes, blogRoutes, profileRoutes } from './routes/index.js';

//multer
import multer from 'multer';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, req._id + file.originalname);
  },
});
const upload = multer({ storage });
//multer

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    message: 'Image uploaded',
    url: `/uploads/${req.file.filename}`,
  });
});

app.post('/upload/pfp', checkAuth, upload.single('image'), changePfp);

app.use('/auth', authRoutes);
app.use('/blog', blogRoutes);
app.use('/profile', profileRoutes);

app.listen(process.env.PORT || 4455, () => {
  console.log(`Listening on port ${process.env.PORT || 4455}`);
});
