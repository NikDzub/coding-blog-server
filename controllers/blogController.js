import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';

//
export const createPost = async (req, res) => {
  try {
    req.body.tags = [...new Set(req.body.tags)];

    const user = await User.findById(req._id).select('username avatar');

    const document = new Post({
      title: req.body.title,
      body: req.body.body,
      tags: req.body.tags,
      img: req.body.img,
      owner: user,
    });

    await document.save();

    await User.findByIdAndUpdate(req._id, {
      $push: { posts: document },
    });

    const { followers } = await User.findOne({ _id: req._id })
      .populate('followers')
      .select('followers');

    followers.forEach(async (f) => {
      await User.findOneAndUpdate(
        { _id: f._id },
        {
          $push: {
            notifications: {
              type: 'new post',
              meta: { postId: document._id },
              from: user,
            },
          },
        }
      );
    });

    res.status(201).json({
      post: document,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Could not create post',
    });
  }
};
//
//
export const getPosts = async (req, res) => {
  try {
    let posts = await Post.find().populate('owner', '-_id username avatar');

    res.status(200).json({
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Could not get posts',
    });
  }
};
//
//
export const getPost = async (req, res) => {
  try {
    const postId = req.params.id;

    let post = await Post.findByIdAndUpdate(
      { _id: postId },
      { $inc: { viewCount: 1 } }
    )
      .populate('owner', '-_id username avatar')
      .populate('comments');

    let comments = [];

    for (const comId of post.comments) {
      await Comment.findOne({ _id: comId })
        .populate('owner', '-_id username avatar')
        .then((doc, err) => {
          comments.push(doc);
        });
    }

    res.status(200).json({
      post: {
        ...post._doc,
        comments,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Could not get post',
    });
  }
};
//
//
export const updatePost = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req._id });

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, owner: user }, //, owner: user._id
      {
        title: req.body.title,
        body: req.body.body,
        tags: [...new Set(req.body.tags)],
        img: req.body.img,
      }
    );

    if (post._doc) {
      res.status(200).json({
        message: 'Post updated',
      });
    } else {
      res.status(200).json({
        message: 'Could not update post',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Could not update post',
    });
  }
};
//
//
export const deletePost = async (req, res) => {
  try {
    const owner = await User.findById({ _id: req._id });
    const post = await Post.findOne({ _id: req.params.id, owner: owner._doc });

    if (!post) {
      return res.status(500).json({
        message: 'Could not find post',
      });
    }

    await User.findOneAndUpdate(
      { _id: req._id },
      { $pull: { posts: post._id } }
    );

    await Post.findOneAndDelete({ _id: req.params.id, owner: owner._doc });

    res.status(200).json({
      message: 'Post deleted',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Could not delete post',
    });
  }
};

export const commentPost = async (req, res) => {
  try {
    const reqUser = await User.findOne({ _id: req._id }).select(
      'username avatar'
    );
    if (!reqUser) {
      return res.status(404).json({
        message: 'No user for comment',
      });
    }

    const comment = await Comment.create({
      owner: reqUser,
      comment: req.body.comment,
      replyTo: req.body.replyTo,
    });

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          comments: comment._id,
        },
      }
    );

    if (req.body.replyTo) {
      await Comment.findOneAndUpdate(
        { _id: req.body.replyTo },
        { $push: { replies: comment._id } }
      );
    }

    res.json({
      ...comment._doc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Could not comment',
    });
  }
};
//
export const deleteComment = async (req, res) => {
  try {
    const reqUser = await User.findOne({ _id: req._id });
    const commentId = req.body.commentId;

    if (!reqUser || !commentId) {
      return res.status(404).json({
        message: 'Invalid credentials',
      });
    }

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      owner: reqUser,
    });

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: {
          comments: comment._id,
        },
      }
    );

    res.json({
      message: 'deleted',
      commentId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Could not comment',
    });
  }
};
//
export const likePostToggle = async (req, res) => {
  try {
    const reqUser = await User.findOne({ _id: req._id });
    const post = await Post.findOne({ _id: req.params.id });

    if (!reqUser._id || !post._id) {
      return res.status(404).json({
        message: 'Invalid credentials',
      });
    }

    if (reqUser.likedPosts.indexOf(post._id) === -1) {
      await reqUser.updateOne({ $push: { likedPosts: post._id } });
      await post.updateOne({ $inc: { likeCount: 1 } });
      return res.status(200).json({
        message: 'liked',
        postId: req.params.id,
      });
    }
    if (reqUser.likedPosts.indexOf(post._id) !== -1) {
      await reqUser.updateOne({ $pull: { likedPosts: post._id } });
      await post.updateOne({ $inc: { likeCount: -1 } });
      return res.status(200).json({
        message: 'unliked',
        postId: req.params.id,
      });
    }
    res.status(200).json({
      message: 'something went wrong',
      postId: req.params.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Could not toggle like',
    });
  }
};
//
export const getTags = async (req, res) => {
  try {
    const posts = await Post.find({}).select('tags -_id');

    let tags = posts.map((p) => {
      return p.tags;
    });
    tags = Array.from(new Set(tags.flat()));

    res.status(200).json({
      tags,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Could not get tags',
    });
  }
};

export const clearAll = async (req, res) => {
  try {
    await Post.deleteMany();
    res.json({
      message: 'Post.deleteMany()',
    });
  } catch (error) {
    console.log(error);
  }
};
