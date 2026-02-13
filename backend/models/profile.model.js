import mongoose from "mongoose";

/* Education */
const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  fieldOfStudy: String,
  startDate: Date,
  endDate: Date,
});

/* Work Experience */
const workSchema = new mongoose.Schema({
  company: String,
  position: String,
  years: Number,
});

/* Profile */
const profileSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  bio: {
    type: String,
    default: "",
  },

  currentPost: {
    type: String,
    default: "",
  },

  /* ✅ Correct name */
  pastWork: {
    type: [workSchema],
    default: [],
  },

  education: {
    type: [educationSchema],
    default: [],
  },

  /* ✅ Extra fields like video */
  experience: {
    type: [String],
    default: [],
  },

  skills: {
    type: [String],
    default: [],
  },

  projects: {
    type: [String],
    default: [],
  },

}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
