// Test script to verify imageURL is being saved
// Run this in browser console after creating/editing a product

async function testProductImageURL() {
    const token = localStorage.getItem('token');

    // Get all products
    const response = await fetch('https://back-adm.fly.dev/api/productos', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const productos = await response.json();
    console.log('📦 Productos:', productos);

    // Check which products have imageURL
    productos.forEach(p => {
        console.log(`Producto: ${p.descripcion}, imageURL: ${p.imageURL || 'NO TIENE'}`);
    });
}

// Run the test
testProductImageURL();
