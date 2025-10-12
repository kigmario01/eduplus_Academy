import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "instructor"], default: "student" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);