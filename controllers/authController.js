import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from '../models/User.js';
import Post from '../models/Post.js';

//register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      passwordHash: hash,
      notifications: [
        {
          type: 'welcome',
          meta: { message: 'Welcome to the coding blog' },
          seen: false,
        },
      ],
    });

    const token = jwt.sign(
      {
        _id: newUser._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
      }
    );
    //add welcome notification?

    res.status(201).json({
      user: { ...newUser._doc, notifications: 0, passwordHash: null },
      token,
    });
  } catch (error) {
    console.log(error);

    switch (error.code) {
      case 11000:
        res.status(500).json({
          message: 'Allready exists',
        });
        break;
      default:
        res.status(500).json({
          message: 'Register error',
        });
        break;
    }
  }
};

//login
export const login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json({
        message: 'Invalid credentials',
      });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!validPassword) {
      return res.status(404).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
      }
    );

    let unseenNotifications = 0;
    user.notifications.map((n) => {
      n.seen === false && unseenNotifications++;
    });

    const { passwordHash, ...logedUser } = user._doc;

    logedUser.notifications = unseenNotifications;

    res.status(200).json({
      user: logedUser,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Login Error',
    });
  }
};

//
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req._id).select(
      '-passwordHash -followers -following'
    );

    if (!user) {
      return res.status(404).json({
        message: 'Access denied',
      });
    }

    let unseenNotifications = 0;
    user.notifications.map((n) => {
      n.seen === false && unseenNotifications++;
    });

    const userClean = { ...user._doc, notifications: unseenNotifications };

    res.status(200).json({
      ...user._doc,
      notifications: unseenNotifications,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Access denied',
    });
  }
};
//
