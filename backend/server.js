const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");  // ✅ Moved path import to top

const app = express();
app.use(cors());
app.use(express.json());

// ========== Multer Storage ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const JWT_SECRET = "yourSecretKey";

// ========== MongoDB Connection ==========
mongoose.connect(
  "mongodb+srv://janhavi:imzuUIUk0P4SJ3DL@cluster0.a34dviv.mongodb.net/aapkakaam?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log("✅ MongoDB Atlas Connected"))
.catch(err => console.error("❌ MongoDB Atlas Error:", err));

// ========== MODELS ==========
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

const WorkerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  pincode: String,
  category: String,
  gender: String,
  experience: Number,
  availability: String,
  aadhaar: String,
  aadhaarPhoto: String,
  profilePhoto: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});
const Worker = mongoose.model("Worker", WorkerSchema);

// ========== AUTH MIDDLEWARE ==========
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

// ========== ROUTES ==========

// SIGNUP

app.post("/signup", async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.json({ success: false, message: "Name, phone, and password required" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.json({ success: false, message: "Phone already registered" });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const user = new User({ name, phone, password: hashedPwd });
    await user.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.json({ success: false, message: "Phone and password required" });

    const user = await User.findOne({ phone });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
res.json({ success: true, token, name: user.name });

  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ADD WORKER
app.post("/add-worker", authMiddleware, upload.fields([
  { name: "aadhaarPhoto", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, phone, address, city, pincode, category, gender } = req.body;
    const aadhaar = req.body.aadhaar?.trim();

    if (!name || !phone || !address || !city || !pincode || !category || !gender)
      return res.status(400).json({ error: "❌ Please fill all required fields." });

    if (!aadhaar)
      return res.status(400).json({ error: "❌ Aadhaar number is required." });

    if (!req.files?.aadhaarPhoto)
      return res.status(400).json({ error: "❌ Aadhaar photo is required." });

    // ✅ Aadhaar uniqueness check
    const existing = await Worker.findOne({ aadhaar });
    if (existing)
      return res.status(400).json({ error: "⚠️ Aadhaar number already registered." });

    const worker = new Worker({
      ...req.body,
      aadhaar,
      aadhaarPhoto: req.files["aadhaarPhoto"][0].filename,
      profilePhoto: req.files["profilePhoto"]?.[0]?.filename || null,
      createdBy: req.userId
    });

    await worker.save();
    // res.json({ message: "✅ Worker registered successfully." });
    res.json({ success: true, message: "✅ Worker registered successfully." });
console.log("🚀 Worker saved and response sent!");

  } catch (err) {
    console.error("❌ Add Worker Error:", err);
    res.status(500).json({ error: "❌ Server error." });
  }
});
// FIND WORKER
app.post("/find-worker", authMiddleware, async (req, res) => {
  try {
    const { location, category, gender } = req.body;
    const query = {};
    if (!location && !category && !gender)
      return res.status(400).json({ error: "❌ Please enter at least one search filter." });

    if (location) query.city = location;
    if (category) query.category = category;
    if (gender && gender !== "any") query.gender = gender;

    const workers = await Worker.find(query).populate("createdBy", "phone email");
    if (workers.length === 0)
      return res.status(404).json({ error: "⚠️ No workers found." });

    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: "❌ Server error while searching." });
  }
});

// aadhar route 
// ✅ Check if Aadhaar exists
app.post("/check-aadhaar", authMiddleware, async (req, res) => {
  try {
    const { aadhaar } = req.body;
    if (!aadhaar) return res.status(400).json({ exists: false });

    const existing = await Worker.findOne({ aadhaar });
    res.json({ exists: !!existing });
  } catch (err) {
    console.error("❌ Check Aadhaar Error:", err);
    res.status(500).json({ error: "Server error while checking Aadhaar" });
  }
});

// ---------- Delete Worker (Admin) ----------
app.delete("/workers/:id", async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Worker deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "❌ Error deleting worker." });
  }
});

// ---------- Paginated Workers (Optional API) ----------
app.get("/api/workers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = { name: { $regex: search, $options: "i" } };
    const total = await Worker.countDocuments(query);
    const workers = await Worker.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      workers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all workers (for admin)
app.get("/workers", async (req, res) => {
  try {
    const workers = await Worker.find();
    res.json(workers);
  } catch (err) {
    console.error("❌ Error fetching workers:", err);
    res.status(500).json({ error: "Server error while fetching workers." });
  }
});


// STATIC FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
