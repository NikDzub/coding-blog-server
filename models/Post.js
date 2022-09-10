import mongoose from 'mongoose';

const postScheme = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Comment',
      default: [],
    },
    img: { type: String, default: '/uploads/basic/blankPost.png' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', postScheme);
