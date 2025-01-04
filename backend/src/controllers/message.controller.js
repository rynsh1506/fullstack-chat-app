import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.util.js";
import { getReceiverSocketId } from "../utils/socket.js";

export const getUserForSitebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    const response = {
      code: 200,
      data: filteredUsers,
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMessage = async (req, res, next) => {
  try {
    const { id: userToChatId } = req.params;

    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender_id: senderId, receiver_id: userToChatId },
        { sender_id: userToChatId, receiver_id: senderId },
      ],
    });

    const response = {
      code: 200,
      data: messages,
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  const { text, image } = req.body;
  try {
    if (!text && !image) throw new AppError("Message not provided", 400);

    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      sender_id: senderId,
      receiver_id: receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    const response = {
      code: 201,
      data: newMessage,
    };
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
