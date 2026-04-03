const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabaseClient');
const { verifyToken } = require('./auth');

router.use(verifyToken);

// ============================================================
// GET /api/expenses - List expenses with filters
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { app_id, type, vehicle_id, date_from, date_to, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('expenses')
      .select(`
        *,
        expense_types (name, slug, icon, color, detail_table),
        vehicles (plate, brand, model),
        expense_documents (id, file_name, file_type, public_url)
      `)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (app_id) query = query.eq('app_id', app_id);
    if (type) query = query.eq('expense_type_id', type);
    if (vehicle_id) query = query.eq('vehicle_id', vehicle_id);
    if (date_from) query = query.gte('date', date_from);
    if (date_to) query = query.lte('date', date_to);

    // TODO: Filter by user_id from auth token
    // if (req.userId) query = query.eq('user_id', req.userId);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({ success: true, data, count });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// GET /api/expenses/:id - Get single expense with detail
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: expense, error } = await supabaseAdmin
      .from('expenses')
      .select(`
        *,
        expense_types (name, slug, icon, color, detail_table),
        vehicles (plate, brand, model),
        expense_documents (id, file_name, file_type, public_url, file_size)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Expense not found' });
      }
      throw error;
    }
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });

    // Fetch detail from the specific table if exists
    let detail = null;
    const detailTable = expense.expense_types?.detail_table;

    if (detailTable) {
      const { data: detailData, error: detailError } = await supabaseAdmin
        .from(detailTable)
        .select('*')
        .eq('expense_id', id)
        .single();

      if (!detailError) detail = detailData;
    }

    // Check if it affects cashier in MySQL
    let affects_cashier = false;
    const { query: mysqlQuery } = require('../config/database');
    try {
      const mysqlResult = await mysqlQuery('SELECT id FROM gastos_caja WHERE expense_id_supabase = ?', [id]);
      affects_cashier = mysqlResult.length > 0;
    } catch (mysqlErr) {
      console.warn('Error checking gastos_caja for expense:', mysqlErr.message);
    }

    res.json({ success: true, data: { ...expense, detail, affects_cashier } });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// POST /api/expenses - Create expense + detail
// ============================================================
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      app_id,
      expense_type_id,
      vehicle_id,
      amount,
      currency,
      description,
      latitude,
      longitude,
      date,
      metadata,
      detail, // Object with detail-specific fields
      affects_cashier, // Used for MySQL sync
    } = req.body;

    // 1. Get expense type to know which detail table to use
    const { data: expenseType, error: typeError } = await supabaseAdmin
      .from('expense_types')
      .select('detail_table')
      .eq('id', expense_type_id)
      .single();

    if (typeError) throw typeError;

    // 2. Insert base expense
    const { data: expense, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .insert({
        user_id,
        app_id,
        expense_type_id,
        vehicle_id: vehicle_id || null,
        amount,
        currency: currency || 'ARS',
        description,
        latitude: latitude || null,
        longitude: longitude || null,
        date: date || new Date().toISOString(),
        metadata: metadata || {},
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    // 3. Insert detail if the type has a detail table
    let detailData = null;
    if (expenseType.detail_table && detail) {
      const { data: insertedDetail, error: detailError } = await supabaseAdmin
        .from(expenseType.detail_table)
        .insert({
          expense_id: expense.id,
          vehicle_id: vehicle_id || null,
          ...detail,
        })
        .select()
        .single();

      if (detailError) throw detailError;
      detailData = insertedDetail;
    }

    // 4. Sync with MySQL gastos_caja if it affects cashier
    if (req.body.affects_cashier && req.user) {
      const { query: mysqlQuery } = require('../config/database');
      const syncAmount = parseFloat(amount);
      const syncDate = date ? new Date(date) : new Date();
      
      console.log(`📤 Sincronizando gasto con MySQL: Monto: ${syncAmount}, Vendedor: ${req.user.vendedorId}, Fecha: ${syncDate.toISOString()}`);
      
      await mysqlQuery(
        'INSERT INTO gastos_caja (monto, descripcion, vendedorId, codigoEmpresa, fecha, expense_id_supabase) VALUES (?, ?, ?, ?, ?, ?)',
        [syncAmount, description || 'Gasto desde App', req.user.vendedorId, req.user.codigoEmpresa, syncDate, expense.id]
      );
      console.log(`✅ Gasto sincronizado con MySQL gastos_caja para vendedor ${req.user.vendedorId}`);
    }

    res.status(201).json({
      success: true,
      data: { ...expense, detail: detailData },
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// PUT /api/expenses/:id - Update expense + detail
// ============================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { detail, affects_cashier, ...expenseFields } = req.body;

    // 1. Update base expense in Supabase (filtering out affects_cashier)
    const { data: expense, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .update(expenseFields)
      .eq('id', id)
      .select(`*, expense_types (detail_table)`)
      .single();

    if (expenseError) throw expenseError;

    // 2. Update detail if provided
    let detailData = null;
    const detailTable = expense.expense_types?.detail_table;

    if (detailTable && detail) {
      const { data: updatedDetail, error: detailError } = await supabaseAdmin
        .from(detailTable)
        .update(detail)
        .eq('expense_id', id)
        .select()
        .single();

      if (!detailError) detailData = updatedDetail;
    }

    // 3. Sync with MySQL gastos_caja
    if (req.user && req.body.affects_cashier !== undefined) {
      const { query: mysqlQuery } = require('../config/database');
      const affectsCashier = req.body.affects_cashier;

      // Check if it already exists in MySQL
      const existing = await mysqlQuery('SELECT id FROM gastos_caja WHERE expense_id_supabase = ?', [id]);

      if (affectsCashier && existing.length === 0) {
        // Was not in caja, now it is: INSERT
        await mysqlQuery(
          'INSERT INTO gastos_caja (monto, descripcion, vendedorId, codigoEmpresa, fecha, expense_id_supabase) VALUES (?, ?, ?, ?, ?, ?)',
          [expenseFields.amount || expense.amount, expenseFields.description || expense.description || 'Gasto editado', req.user.vendedorId, req.user.codigoEmpresa, expenseFields.date || expense.date || new Date(), id]
        );
      } else if (!affectsCashier && existing.length > 0) {
        // Was in caja, now it's not: DELETE
        await mysqlQuery('DELETE FROM gastos_caja WHERE expense_id_supabase = ?', [id]);
      } else if (affectsCashier && existing.length > 0) {
        // Still in caja: UPDATE amount/description
        await mysqlQuery(
          'UPDATE gastos_caja SET monto = ?, descripcion = ?, fecha = ? WHERE expense_id_supabase = ?',
          [expenseFields.amount || expense.amount, expenseFields.description || expense.description || 'Gasto editado', expenseFields.date || expense.date || new Date(), id]
        );
      }
    }

    res.json({ success: true, data: { ...expense, detail: detailData } });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// DELETE /api/expenses/:id - Delete expense (cascades)
// ============================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete associated files from Storage
    const { data: docs } = await supabaseAdmin
      .from('expense_documents')
      .select('storage_path')
      .eq('expense_id', id);

    if (docs && docs.length > 0) {
      const paths = docs.map(d => d.storage_path);
      await supabaseAdmin.storage.from('expense-docs').remove(paths);
    }

    // 2. Delete expense (cascades to detail tables and documents)
    const { error } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // 3. Delete from MySQL gastos_caja if it exists
    try {
      const { query: mysqlQuery } = require('../config/database');
      await mysqlQuery('DELETE FROM gastos_caja WHERE expense_id_supabase = ?', [id]);
      console.log(`🗑️ Gasto ${id} eliminado de MySQL gastos_caja`);
    } catch (mysqlErr) {
      console.warn('Error deleting from MySQL gastos_caja:', mysqlErr.message);
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// DOCUMENTS SUB-ROUTES
// ============================================================

// POST /api/expenses/:id/documents - Upload document(s)
router.post('/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const { files } = req.body; // Array of { file_name, file_type, base64 }

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    // Get expense to extract user_id for storage path
    const { data: expense, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .select('user_id')
      .eq('id', id)
      .single();

    if (expenseError || !expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    const uploadedDocs = [];

    for (const file of files) {
      const storagePath = `${expense.user_id}/${id}/${Date.now()}_${file.file_name}`;
      const fileBuffer = Buffer.from(file.base64, 'base64');

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from('expense-docs')
        .upload(storagePath, fileBuffer, {
          contentType: file.file_type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('expense-docs')
        .getPublicUrl(storagePath);

      // Insert document record
      const { data: doc, error: docError } = await supabaseAdmin
        .from('expense_documents')
        .insert({
          expense_id: id,
          file_name: file.file_name,
          file_type: file.file_type,
          storage_path: storagePath,
          public_url: urlData.publicUrl,
          file_size: fileBuffer.length,
        })
        .select()
        .single();

      if (docError) throw docError;
      uploadedDocs.push(doc);
    }

    res.status(201).json({ success: true, data: uploadedDocs });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/expenses/:id/documents - List documents
router.get('/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('expense_documents')
      .select('*')
      .eq('expense_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/expenses/:id/documents/:docId - Delete a document
router.delete('/:id/documents/:docId', async (req, res) => {
  try {
    const { docId } = req.params;

    // Get storage path before deleting record
    const { data: doc, error: fetchError } = await supabaseAdmin
      .from('expense_documents')
      .select('storage_path')
      .eq('id', docId)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Delete from Storage
    await supabaseAdmin.storage.from('expense-docs').remove([doc.storage_path]);

    // Delete record
    const { error } = await supabaseAdmin
      .from('expense_documents')
      .delete()
      .eq('id', docId);

    if (error) throw error;

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
