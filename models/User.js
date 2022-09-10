import mongoose from 'mongoose';

const notificationScheme = mongoose.Schema(
  {
    type: { type: String, required: true },
    seen: { type: Boolean, default: false },
    meta: { type: Object, required: false },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const userScheme = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: `/uploads/basic/blank.png`,
    },
    mod: { type: Boolean, default: false },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notifications: [notificationScheme],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userScheme);
