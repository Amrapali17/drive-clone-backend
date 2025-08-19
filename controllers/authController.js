const supabase = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Signup user
exports.signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  // Basic input validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Full name, email, and password are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const { data, error } = await supabase
      .from("users")
      .insert([{ full_name: fullName, email, password_hash: hashedPassword }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Generate JWT token
    const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ user: { id: data.id, email: data.email, fullName: data.full_name }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) return res.status(400).json({ error: "Invalid credentials." });

    // Compare passwords
    const validPassword = await bcrypt.compare(password, data.password_hash);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials." });

    // Generate JWT token
    const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ user: { id: data.id, email: data.email, fullName: data.full_name }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
