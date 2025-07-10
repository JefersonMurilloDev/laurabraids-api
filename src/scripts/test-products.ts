/**
 * @file Script para probar la migración de productos
 * @description Prueba las operaciones CRUD de productos
 */

import { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from '../data/products.database';
import { Product } from '../interfaces/product.interface';
import { v4 as uuidv4 } from 'uuid';

const testProducts = async () => {
  try {
    console.log('🧪 Iniciando pruebas de productos...');
    
    // Test 1: Obtener todos los productos
    console.log('\n1. Obteniendo todos los productos...');
    const allProducts = await getProducts();
    console.log(`✅ Productos encontrados: ${allProducts.length}`);
    allProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.category}) - $${product.price}`);
    });
    
    // Test 2: Obtener producto por ID
    console.log('\n2. Obteniendo producto por ID...');
    if (allProducts.length > 0) {
      const firstProduct = await getProductById(allProducts[0].id);
      console.log(`✅ Producto encontrado: ${firstProduct?.name}`);
    }
    
    // Test 3: Crear nuevo producto
    console.log('\n3. Creando nuevo producto...');
    const newProduct: Product = {
      id: uuidv4(),
      name: 'Producto de Prueba',
      description: 'Descripción del producto de prueba',
      price: 99.99,
      stock_quantity: 10,
      image_url: 'https://example.com/test.jpg',
      category: 'Accesorios',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const createdProduct = await addProduct(newProduct);
    console.log(`✅ Producto creado: ${createdProduct.name}`);
    
    // Test 4: Actualizar producto
    console.log('\n4. Actualizando producto...');
    const updatedProduct = await updateProduct(createdProduct.id, {
      name: 'Producto Actualizado',
      price: 149.99
    });
    console.log(`✅ Producto actualizado: ${updatedProduct?.name} - $${updatedProduct?.price}`);
    
    // Test 5: Eliminar producto (soft delete)
    console.log('\n5. Eliminando producto...');
    const deleted = await deleteProduct(createdProduct.id);
    console.log(`✅ Producto eliminado: ${deleted}`);
    
    // Test 6: Verificar que el producto esté inactivo
    console.log('\n6. Verificando eliminación...');
    const deletedProduct = await getProductById(createdProduct.id);
    console.log(`✅ Producto después de eliminar: ${deletedProduct ? 'Aún existe' : 'No encontrado'}`);
    
    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
  
  process.exit(0);
};

testProducts();