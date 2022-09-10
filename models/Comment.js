import mongoose from 'mongoose';

const commentScheme = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    replies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Comment',
      required: false,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    approved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Comment', commentScheme);
