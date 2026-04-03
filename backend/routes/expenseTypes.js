const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabaseClient');

// ============================================================
// GET /api/expense-types - List available expense types
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { app_id } = req.query;

    let query = supabaseAdmin
      .from('expense_types')
      .select('*')
      .order('name', { ascending: true });

    // Return global types (app_id IS NULL) + types for specific app
    if (app_id) {
      query = query.or(`app_id.is.null,app_id.eq.${app_id}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching expense types:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
