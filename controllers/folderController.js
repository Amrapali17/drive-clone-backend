const supabase = require("../db");
const fs = require("fs");

// Get all folders for the logged-in user
exports.getFolders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("owner_id", req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    // Return array directly
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new folder
exports.createFolder = async (req, res) => {
  const { name, parent_id } = req.body;

  try {
    const { data, error } = await supabase
      .from("folders")
      .insert([{
        name,
        parent_id: parent_id || null,
        owner_id: req.user.id
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Return the newly created folder directly
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Hard delete folder & its files
exports.hardDeleteFolder = async (req, res) => {
  const folderId = req.params.id;

  try {
    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .eq("owner_id", req.user.id)
      .single();

    if (folderError || !folder) return res.status(400).json({ error: "Folder not found" });

    const { data: files } = await supabase
      .from("files")
      .select("*")
      .eq("folder_id", folderId)
      .eq("owner_id", req.user.id);

    files.forEach(file => {
      fs.unlink(file.storage_path, err => {
        if (err) console.error("File removal error:", err);
      });
    });

    await supabase.from("files").delete().eq("folder_id", folderId).eq("owner_id", req.user.id);
    await supabase.from("folders").delete().eq("id", folderId);

    res.json({ message: "Folder and its files permanently deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
