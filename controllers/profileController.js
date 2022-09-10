import User from '../models/User.js';
import Post from '../models/Post.js';

//
export const getUser = async (req, res) => {
  try {
    const username = req.params.username;

    const reqUser = await User.findOne({ _id: req.reqUser }).populate(
      'following',
      '_id username'
    );

    const user = await User.findOne({ username })
      .select('username avatar followers following createdAt')
      .populate('followers', '-_id username avatar')
      .populate('following', '-_id username avatar');

    if (!user) {
      return res.status(404).json({
        message: 'User does not exists',
      });
    }

    const posts = await Post.find({ owner: user }).select(
      'title body tags viewCount likeCount img createdAt'
    );

    let following = false;
    reqUser?.following?.map((f) => {
      if (String(f._id) === String(user._id)) {
        following = true;
      }
    });

    res.status(200).json({
      user: { ...user._doc, _id: '' },
      posts,
      following,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: 'Access denied',
    });
  }
};
//
export const followUser = async (req, res) => {
  try {
    const reqUser = await User.findById(req._id);
    const followUser = await User.findOne({ username: req.params.username });

    if (!followUser || !reqUser) {
      return res.status(404).json({
        message: 'User does not exists',
      });
    }

    if (followUser.followers.includes(reqUser._id)) {
      await followUser.updateOne({ $pull: { followers: reqUser._id } });
      await reqUser.updateOne({ $pull: { following: followUser._id } });
      return res.status(201).json({
        message: 'Unfollowed',
      });
    }

    await followUser.updateOne({
      $push: {
        followers: reqUser,
        notifications: { type: 'follow', from: reqUser },
      },
    });
    await reqUser.updateOne({ $push: { following: followUser._id } });

    res.status(201).json({
      message: 'Followed',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Access denied',
    });
  }
};
//

export const changePfp = async (req, res) => {
  try {
    const avatar = req.body.img.url;

    await User.findOneAndUpdate({ _id: req._id }, { avatar: avatar });
    res.status(200).json({
      message: 'pfp updated',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Access denied',
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req._id }).populate({
      path: 'notifications',
      populate: {
        path: 'from',
        model: 'User',
        select: '-_id avatar username',
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'Access denied',
      });
    }

    await user.updateOne(
      { $set: { 'notifications.$[el].seen': true } },
      {
        arrayFilters: [{ 'el.seen': false }],
        new: true,
      }
    );

    res.status(200).json([...user.notifications]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Access denied',
    });
  }
};
