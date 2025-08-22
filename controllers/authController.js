const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../db");

// ===== Generate JWT =====
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ===== Signup =====
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    // Check if user already exists
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) return res.status(400).json({ error: "Email already exists" });
    if (existingError) throw existingError;

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert([{ full_name: fullName, email, password_hash: hash }])
      .select()
      .maybeSingle();

    if (error) throw error;

    // Generate token
    const token = generateToken(data);

    res.json({
      user: { id: data.id, email: data.email, fullName: data.full_name },
      token,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== Login =====
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user || error)
      return res.status(400).json({ error: "Invalid credentials" });

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    // Generate token
    const token = generateToken(user);

    res.json({
      user: { id: user.id, email: user.email, fullName: user.full_name },
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
