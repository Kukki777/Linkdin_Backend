import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import ConnectionRequest from "../models/connection.model.js";
import Profile from "../models/profile.model.js";
import fs from "fs";

const convertUserDataToPDF = async (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("/uploads" + outputPath);

  doc.pipe(stream);
  doc.image(`uploads/${userData.userId.profilePicture}`, {
    align: "center",
    width: 100,
    height: 100,
  });
  doc.fontSize(14).text(`Name: ${userData.userId.name}`, { align: "center" });
  doc
    .fontSize(14)
    .text(`Username: ${userData.userId.username}`, { align: "center" });
  doc.fontSize(14).text(`Email: ${userData.userId.email}`, { align: "center" });
  doc.fontSize(14).text(`Bio: ${userData.bio}`, { align: "center" });
  doc
    .fontSize(14)
    .text(`Current Position: ${userData.currentPost}`, { align: "center" });
  // doc.fontSize(14).text(`Created At: ${userData.userId.createdAt}`, {align: 'center'});
  doc
    .fontSize(14)
    .text(`Past Work: ${userData.userId.updatedAt}`, { align: "center" });
  userData.pastWork.forEach((work, index) => {
    doc.fontSize(14).text(`Company Name ${work.company}`, { align: "center" });
    doc.fontSize(14).text(`Position: ${work.position}`, { align: "center" });
    doc.fontSize(14).text(`Years: ${work.years}`, { align: "center" });
  });
  doc.end();
  return outputPath;
};
export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      email,
    });

    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

    const profile = new Profile({ userId: newUser._id });
    await profile.save();
  } catch (error) {
    console.error("Error in register controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.token = token; // ✅ set
    await user.save(); // ✅ save properly

    return res.json({ token });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadprofilePicture = async (req, res) => {
  const token = req.body.token;
  console.log("TOKEN:", token);
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    user.profilePicture = req.file.filename;
    await user.save();
    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: req.file.filename,
    });
  } catch (error) {
    console.error("Error in upload profile picture controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { username, email } = newUserData;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser._id.toString() !== user._id.toString()) {
        return res
          .status(409)
          .json({ message: "Username or email already in use" });
      }
    }
    Object.assign(user, newUserData);

    await user.save();

    return res.json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Error in update user profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture createdAt",
    );
    return res.json(userProfile);
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    const userProfile = await User.findOne({ token });

    if (!userProfile) {
      return res.status(404).json({ message: "error message" });
    }

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    if (!profile_to_update) {
      return res.status(404).json({ message: "Profile not found" });
    }

    Object.assign(profile_to_update, newProfileData);
    await profile_to_update.save();

    return res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture createdAt",
    );
    return res.json(profiles);
  } catch (error) {
    console.error("Error in get all user profiles controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;
  const userProfile = await Profile.findOne({ userId: user_id }).populate(
    "userId",
    "name username email profilePicture createdAt",
  );
  let outputPath = await convertUserDataToPDF(userProfile);
  return res.json({ message: outputPath });
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }
    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingRequest) {
      return res
        .status(409)
        .json({ message: "Connection request already sent" });
    }
    const Request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    await Request.save();
    return res.json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyConnectionsRequest = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connections = await ConnectionRequest.find({ userId: user._id })
      .populate("userId", "name username email profilePicture createdAt")
      .populate("connectionId", "name username email profilePicture createdAt");
    return res.json(connections);
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const whatAreMyConnection = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture createdAt");
    return res.json(connections);
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connection = await ConnectionRequest.findOne({ _id: requestId });
    if (!connection) {
      return res.status(404).json({ message: "Connection user not found" });
    }
    if (action_type == "accept"){
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }
    await connection.save();
    return res.json({ message: "Connection request updated successfully" });
  } catch (error) {
    console.error("Error in get user and profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
