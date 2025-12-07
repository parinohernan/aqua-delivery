/**
 * Test script to verify imageURL is being saved correctly
 * Run with: node test-imageurl-save.js
 */

const token = 'YOUR_TOKEN_HERE'; // Replace with actual token from localStorage

async function testImageURLSave() {
    console.log('🧪 Testing imageURL save...\n');

    // Test 1: Create a new product with imageURL
    console.log('📝 Test 1: Creating product with imageURL');
    const createResponse = await fetch('https://back-adm.fly.dev/api/productos', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            descripcion: 'Test Product with Image',
            precio: 100,
            stock: 50,
            esRetornable: 0,
            activo: 1,
            imageURL: 'https://via.placeholder.com/200'
        })
    });

    const created = await createResponse.json();
    console.log('✅ Product created:', created);
    console.log('📸 imageURL saved:', created.imageURL || 'NO GUARDADO');

    if (!created.codigo && !created.id) {
        console.error('❌ Error creating product');
        return;
    }

    const productId = created.codigo || created.id;

    // Test 2: Update the product with a different imageURL
    console.log('\n📝 Test 2: Updating product imageURL');
    const updateResponse = await fetch(`https://back-adm.fly.dev/api/productos/${productId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            descripcion: 'Test Product with Image UPDATED',
            precio: 150,
            stock: 75,
            esRetornable: 0,
            activo: 1,
            imageURL: 'https://via.placeholder.com/300'
        })
    });

    const updated = await updateResponse.json();
    console.log('✅ Product updated:', updated);
    console.log('📸 imageURL after update:', updated.imageURL || 'NO GUARDADO');

    // Test 3: Fetch the product to verify
    console.log('\n📝 Test 3: Fetching product to verify');
    const fetchResponse = await fetch(`https://back-adm.fly.dev/api/productos`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const products = await fetchResponse.json();
    const testProduct = products.find(p => (p.codigo || p.id) == productId);

    if (testProduct) {
        console.log('✅ Product found in list');
        console.log('📸 imageURL in list:', testProduct.imageURL || 'NO GUARDADO');
    } else {
        console.log('❌ Product not found in list');
    }
}

// Instructions
console.log('⚠️  INSTRUCTIONS:');
console.log('1. Open browser console');
console.log('2. Run: localStorage.getItem("token")');
console.log('3. Copy the token');
console.log('4. Replace YOUR_TOKEN_HERE in this file');
console.log('5. Run: node test-imageurl-save.js\n');

// Uncomment to run (after adding token)
// testImageURLSave().catch(console.error);
