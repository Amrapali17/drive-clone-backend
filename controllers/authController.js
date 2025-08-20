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

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ full_name: fullName, email, password_hash: hash }])
      .select()
      .single();

    if (error) throw error;

    const token = generateToken(data);

    res.json({ user: { id: data.id, email: data.email, fullName: data.full_name }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== Login =====
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user);

    res.json({ user: { id: user.id, email: user.email, fullName: user.full_name }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
