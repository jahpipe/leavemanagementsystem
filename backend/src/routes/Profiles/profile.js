const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup storage folder (correct path: public/images)
const storageFolder = path.join(__dirname, "..", "..", "public", "images");

// Ensure the folder exists
if (!fs.existsSync(storageFolder)) {
  fs.mkdirSync(storageFolder, { recursive: true });
}

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isMimeValid = allowedTypes.test(file.mimetype);
    const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (isMimeValid && isExtValid) {
      return cb(null, true);
    }
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed!"));
  },
});

// MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "leave_db",
  port: "3306",
});

// PUT route to update user profile
router.put("/:id", upload.single("profilePic"), async (req, res) => {
  const { id } = req.params;
  const { fullName, middleName, lastName, contact, username, password } = req.body;

  try {
    const fields = [];
    const values = [];

    // If profile picture uploaded
    if (req.file) {
      // Delete the old profile picture if it exists
      const [userResult] = await db.query("SELECT profileIcon FROM users WHERE id = ?", [id]);
      const oldProfilePic = userResult[0]?.profileIcon;

      if (oldProfilePic) {
        const oldProfilePicPath = path.join(storageFolder, oldProfilePic);
        if (fs.existsSync(oldProfilePicPath)) {
          fs.unlinkSync(oldProfilePicPath);
        }
      }

      // Store only the filename in the database, not the full path
      const profilePicFilename = req.file.filename;
      fields.push("profileIcon = ?");
      values.push(profilePicFilename);
    }

    // Handle other optional fields (like fullName, middleName, etc.)
    if (fullName?.trim()) {
      fields.push("fullName = ?");
      values.push(fullName);
    }
    if (middleName?.trim()) {
      fields.push("middleName = ?");
      values.push(middleName);
    }
    if (lastName?.trim()) {
      fields.push("lastName = ?");
      values.push(lastName);
    }
    if (contact?.trim()) {
      fields.push("contact = ?");
      values.push(contact);
    }
    if (username?.trim()) {
      fields.push("username = ?");
      values.push(username);
    }
    if (password?.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hashedPassword);
    }

    // If no fields are provided, return an error or do nothing
    if (fields.length === 0) {
      return res.status(200).json({ message: "No changes detected." });
    }

    // Update the database
    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    await db.query(sql, values);

    // Get the updated user data (including the new profileIcon if available)
    const [updatedUser] = await db.query("SELECT id, fullName, middleName, lastName, contact, username, profileIcon FROM users WHERE id = ?", [id]);

    res.status(200).json({
      message: "Profile updated successfully!",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    // Delete uploaded file if error happens
    if (req.file) {
      fs.unlink(path.join(storageFolder, req.file.filename), (err) => {
        if (err) console.error("Error cleaning up uploaded file:", err);
      });
    }

    res.status(500).json({ message: error.message || "Server error during profile update." });
  }
});

module.exports = router;