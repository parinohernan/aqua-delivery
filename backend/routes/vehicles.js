const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabaseClient');

// ============================================================
// GET /api/vehicles - List user's vehicles
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    // TODO: Filter by user_id from auth token
    // if (req.userId) query = query.eq('user_id', req.userId);

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// GET /api/vehicles/:id - Get single vehicle
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: vehicle, error } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// POST /api/vehicles - Create a vehicle
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { user_id, plate, brand, model, year, current_km, type, avatar_url } = req.body;

    const { data: vehicle, error } = await supabaseAdmin
      .from('vehicles')
      .insert({
        user_id,
        plate,
        brand,
        model,
        year: year || null,
        current_km: current_km || 0,
        type: type || 'car',
        avatar_url: avatar_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// PUT /api/vehicles/:id - Update a vehicle
// ============================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: vehicle, error } = await supabaseAdmin
      .from('vehicles')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// GET /api/vehicles/:id/stats - Vehicle stats
// ============================================================
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    // Total expenses for this vehicle
    const { data: expenses, error: expError } = await supabaseAdmin
      .from('expenses')
      .select('amount, date, expense_types (slug)')
      .eq('vehicle_id', id);

    if (expError) throw expError;

    // Fuel loads for efficiency calculation
    const { data: fuelLoads, error: fuelError } = await supabaseAdmin
      .from('fuel_loads')
      .select('liters, odometer_km, price_per_liter, created_at')
      .eq('vehicle_id', id)
      .order('odometer_km', { ascending: true });

    if (fuelError) throw fuelError;

    // Upcoming maintenances
    const { data: maintenances, error: maintError } = await supabaseAdmin
      .from('maintenances')
      .select('*')
      .eq('vehicle_id', id)
      .or(`next_date.gte.${new Date().toISOString()},next_km.gt.0`)
      .order('next_date', { ascending: true })
      .limit(5);

    if (maintError) throw maintError;

    // Calculate fuel efficiency (km per liter)
    let fuelEfficiency = null;
    if (fuelLoads && fuelLoads.length >= 2) {
      const totalKm = fuelLoads[fuelLoads.length - 1].odometer_km - fuelLoads[0].odometer_km;
      const totalLiters = fuelLoads.slice(1).reduce((sum, fl) => sum + fl.liters, 0);
      if (totalLiters > 0) {
        fuelEfficiency = (totalKm / totalLiters).toFixed(2);
      }
    }

    // Sum by type
    const totalByType = {};
    expenses?.forEach(exp => {
      const slug = exp.expense_types?.slug || 'other';
      totalByType[slug] = (totalByType[slug] || 0) + parseFloat(exp.amount);
    });

    const totalAmount = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

    res.json({
      success: true,
      data: {
        total_expenses: totalAmount,
        total_by_type: totalByType,
        fuel_efficiency_km_per_liter: fuelEfficiency ? parseFloat(fuelEfficiency) : null,
        total_fuel_loads: fuelLoads?.length || 0,
        upcoming_maintenances: maintenances || [],
      },
    });
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
