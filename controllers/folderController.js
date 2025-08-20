const supabase = require("../db");

// ===== Get all folders =====
exports.getFolders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("folders")
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

// ===== Create folder =====
exports.createFolder = async (req, res) => {
  try {
    const { name, parent_id = null } = req.body;

    const { data, error } = await supabase
      .from("folders")
      .insert([{ name, parent_id, owner_id: req.user.id, is_deleted: false }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ===== Soft delete folder (set is_deleted = true) =====
exports.softDeleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: folder, error } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !folder) return res.status(404).json({ error: "Folder not found" });
    if (folder.owner_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const { error: updateErr } = await supabase
      .from("folders")
      .update({ is_deleted: true })
      .eq("id", id);

    if (updateErr) throw updateErr;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ===== Hard delete folder (permanent) =====
exports.hardDeleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: folder, error } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !folder) return res.status(404).json({ error: "Folder not found" });
    if (folder.owner_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const { error: deleteErr } = await supabase.from("folders").delete().eq("id", id);
    if (deleteErr) throw deleteErr;

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
