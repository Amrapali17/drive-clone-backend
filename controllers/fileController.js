const supabase = require("../db");
const fs = require("fs");

// Get all files for the logged-in user
exports.getFiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", req.user.id)
      .eq("is_deleted", false);

    if (error) return res.status(400).json({ error: error.message });

    res.json(data); // return array directly for frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Upload a file
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { folderId } = req.body;
  const { originalname, mimetype, size, path: storagePath } = req.file;

  try {
    const { data, error } = await supabase
      .from("files")
      .insert([{
        name: originalname,
        folder_id: folderId || null,
        owner_id: req.user.id,
        size,
        mime_type: mimetype,
        storage_path: storagePath
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Fetch updated file list after upload
    const { data: files, error: fetchError } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", req.user.id)
      .eq("is_deleted", false);

    if (fetchError) return res.status(400).json({ error: fetchError.message });

    res.json(files); // return full array of files
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Soft delete a file
exports.deleteFile = async (req, res) => {
  const fileId = req.params.id;
  try {
    const { data, error } = await supabase
      .from("files")
      .update({ is_deleted: true })
      .eq("id", fileId)
      .eq("owner_id", req.user.id)
      .select()
      .single();

    if (error || !data) return res.status(400).json({ error: "File not found or cannot delete" });

    res.json({ message: "File soft deleted", file: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Hard delete a file
exports.hardDeleteFile = async (req, res) => {
  const fileId = req.params.id;
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("owner_id", req.user.id)
      .single();

    if (error || !data) return res.status(400).json({ error: "File not found or cannot delete" });

    fs.unlink(data.storage_path, (err) => {
      if (err) console.error("File removal error:", err);
    });

    await supabase.from("files").delete().eq("id", fileId);

    res.json({ message: "File permanently deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
