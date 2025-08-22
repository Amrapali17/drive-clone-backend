const supabase = require("../db");

// ===== List all files for the logged-in user =====
exports.getFiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", req.user.id)
      .eq("is_deleted", false);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ===== Upload a file =====
exports.uploadFile = async (req, res) => {
  try {
    const { folder_id = null } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "File is required" });

    // Upload file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("drive-uploads") // your bucket name
      .upload(`uploads/${file.originalname}`, file.buffer, { upsert: true });

    if (storageError) throw storageError;

    // Save file metadata in database
    const { data, error } = await supabase
      .from("files")
      .insert([{
        name: file.originalname,
        owner_id: req.user.id,
        folder_id,
        is_deleted: false,
        created_at: new Date(),
        path: storageData.path
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "File uploaded successfully", file: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ===== Soft delete a file =====
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !file) return res.status(404).json({ error: "File not found" });
    if (file.owner_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const { error: updateErr } = await supabase
      .from("files")
      .update({ is_deleted: true })
      .eq("id", id);

    if (updateErr) throw updateErr;

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ===== Hard delete a file =====
exports.hardDeleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !file) return res.status(404).json({ error: "File not found" });
    if (file.owner_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    // Delete from database
    const { error: deleteErr } = await supabase
      .from("files")
      .delete()
      .eq("id", id);

    if (deleteErr) throw deleteErr;

    // Optional: delete from Supabase storage
    await supabase.storage.from("drive-uploads").remove([`uploads/${file.name}`]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
