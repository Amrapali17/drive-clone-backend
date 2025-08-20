// db.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Force schema reload safely
(async () => {
  try {
    await supabase.from('folders').select('id').limit(1);
    await supabase.from('files').select('id').limit(1);
  } catch (err) {
    console.log("Schema refresh skipped:", err.message);
  }
})();

module.exports = supabase;
