/**
 * Test script for Supabase Expenses Module
 * Run: node test-supabase.js
 */
require('dotenv').config();
const { supabaseAdmin } = require('./services/supabaseClient');

async function testConnection() {
  console.log('\n🔌 1. Testing Supabase connection...');
  console.log('   URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('   SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

  if (!supabaseAdmin) {
    console.error('❌ supabaseAdmin client not initialized. Check your .env');
    process.exit(1);
  }
}

async function testAppsTable() {
  console.log('\n📋 2. Reading apps table...');
  const { data, error } = await supabaseAdmin.from('apps').select('*');
  
  if (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  }
  
  console.log(`   ✅ Found ${data.length} apps:`);
  data.forEach(app => console.log(`      - ${app.name} (ID: ${app.id}, Slug: ${app.slug})`));
  return data;
}

async function testExpenseTypes() {
  console.log('\n🏷️  3. Reading expense_types table...');
  const { data, error } = await supabaseAdmin.from('expense_types').select('*');
  
  if (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  }
  
  console.log(`   ✅ Found ${data.length} expense types:`);
  data.forEach(t => console.log(`      - ${t.name} (${t.slug}) → detail: ${t.detail_table || 'none'}`));
  return data;
}

async function testVehicleCRUD() {
  console.log('\n🚗 4. Testing Vehicle CRUD...');
  
  // We need a user_id; since we're using admin client, we'll create a test one
  // For now, use a fake UUID
  const testUserId = '00000000-0000-0000-0000-000000000001';

  // CREATE
  const { data: vehicle, error: createError } = await supabaseAdmin
    .from('vehicles')
    .insert({
      user_id: testUserId,
      plate: 'TEST-001',
      brand: 'Toyota',
      model: 'Hilux',
      year: 2023,
      current_km: 50000,
      type: 'truck',
    })
    .select()
    .single();

  if (createError) {
    console.log('   ⚠️  Create vehicle error (may need valid user_id):', createError.message);
    console.log('   ℹ️  This is expected if auth.users is empty. Skipping CRUD test.');
    return null;
  }

  console.log('   ✅ Created vehicle:', vehicle.id, `(${vehicle.brand} ${vehicle.model})`);

  // DELETE test vehicle
  await supabaseAdmin.from('vehicles').delete().eq('id', vehicle.id);
  console.log('   🗑️  Cleaned up test vehicle');
  
  return vehicle;
}

async function testStorageBucket() {
  console.log('\n📦 5. Testing Storage bucket (expense-docs)...');
  
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  
  if (error) {
    console.error('   ❌ Error listing buckets:', error.message);
    return false;
  }

  const expenseBucket = buckets.find(b => b.id === 'expense-docs');
  
  if (expenseBucket) {
    console.log('   ✅ Bucket "expense-docs" found!', expenseBucket.public ? '(public)' : '(private)');
  } else {
    console.log('   ❌ Bucket "expense-docs" NOT found. Available buckets:');
    buckets.forEach(b => console.log(`      - ${b.id}`));
  }
  
  return !!expenseBucket;
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('🧪 SUPABASE EXPENSES MODULE - Test Suite');
  console.log('='.repeat(50));

  await testConnection();
  const apps = await testAppsTable();
  const types = await testExpenseTypes();
  await testVehicleCRUD();
  const bucket = await testStorageBucket();

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESULTS:');
  console.log('='.repeat(50));
  console.log(`   Apps table:          ${apps ? '✅' : '❌'}`);
  console.log(`   Expense types:       ${types ? '✅' : '❌'}`);
  console.log(`   Storage bucket:      ${bucket ? '✅' : '❌'}`);
  console.log('='.repeat(50));

  if (!apps || !types) {
    console.log('\n⚠️  If tables are missing, run supabase_migration.sql in the SQL Editor.');
  }
}

runTests().catch(console.error);
