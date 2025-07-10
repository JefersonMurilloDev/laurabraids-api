/**
 * @file Tests para los endpoints de productos de la API LauraBraids.
 * @description Tests completos para operaciones CRUD de productos,
 *              incluyendo filtros avanzados y gestión de inventario.
 */

import request from 'supertest';
import app from '../index';
import { resetProductsForTesting } from '../controllers/products.controller';

// Hook para resetear los datos antes de cada prueba
beforeEach(async () => {
  await resetProductsForTesting();
});

/**
 * @description Suite de tests para obtener productos (GET /api/products).
 */
describe('GET /api/products', () => {
  /**
   * @description Test para obtener todos los productos.
   */
  it('debería devolver una lista de productos', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificamos que la respuesta sea un array
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Verificamos que el primer elemento tenga las propiedades correctas
    const firstProduct = response.body[0];
    expect(firstProduct).toHaveProperty('id');
    expect(firstProduct).toHaveProperty('name');
    expect(firstProduct).toHaveProperty('description');
    expect(firstProduct).toHaveProperty('price');
    expect(firstProduct).toHaveProperty('stock_quantity');
    expect(firstProduct).toHaveProperty('image_url');
    expect(firstProduct).toHaveProperty('category');
    expect(firstProduct).toHaveProperty('is_active');
    expect(firstProduct).toHaveProperty('created_at');
    expect(firstProduct).toHaveProperty('updated_at');
  });

  /**
   * @description Test para filtrar productos por categoría.
   */
  it('debería devolver solo productos de la categoría especificada', async () => {
    const category = 'Extensiones';
    const response = await request(app)
      .get(`/api/products?category=${category}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todos los productos devueltos sean de la categoría solicitada
    response.body.forEach((product: any) => {
      expect(product.category).toBe(category);
    });
  });

  /**
   * @description Test para filtrar productos activos.
   */
  it('debería devolver solo productos activos cuando se filtra por active=true', async () => {
    const response = await request(app)
      .get('/api/products?active=true')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todos los productos devueltos estén activos
    response.body.forEach((product: any) => {
      expect(product.is_active).toBe(true);
    });
  });

  /**
   * @description Test para filtrar productos en stock.
   */
  it('debería devolver solo productos en stock cuando se filtra por in_stock=true', async () => {
    const response = await request(app)
      .get('/api/products?in_stock=true')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que todos los productos devueltos tengan stock
    response.body.forEach((product: any) => {
      expect(product.stock_quantity).toBeGreaterThan(0);
    });
  });

  /**
   * @description Test para combinación de filtros.
   */
  it('debería permitir combinar múltiples filtros', async () => {
    const response = await request(app)
      .get('/api/products?category=Cuidado&active=true&in_stock=true')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Verificamos que cumplan todos los filtros
    response.body.forEach((product: any) => {
      expect(product.category).toBe('Cuidado');
      expect(product.is_active).toBe(true);
      expect(product.stock_quantity).toBeGreaterThan(0);
    });
  });
});

/**
 * @description Suite de tests para obtener producto por ID (GET /api/products/:id).
 */
describe('GET /api/products/:id', () => {
  /**
   * @description Test para obtener un producto específico por su ID.
   */
  it('debería devolver un producto específico por su id', async () => {
    // Primero obtenemos la lista para conseguir un ID válido
    const productsResponse = await request(app).get('/api/products');
    const validProductId = productsResponse.body[0].id;

    const response = await request(app)
      .get(`/api/products/${validProductId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    // Verificamos que la respuesta tenga las propiedades correctas
    expect(response.body).toHaveProperty('id', validProductId);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('price');
    expect(response.body).toHaveProperty('stock_quantity');
  });

  /**
   * @description Test para manejar el caso de un producto no encontrado.
   */
  it('debería devolver un error 404 si el producto no existe', async () => {
    await request(app)
      .get('/api/products/producto-inexistente-123')
      .expect(404);
  });
});

/**
 * @description Suite de tests para crear productos (POST /api/products).
 */
describe('POST /api/products', () => {
  /**
   * @description Test para crear un nuevo producto con todos los campos.
   */
  it('debería crear un nuevo producto correctamente', async () => {
    const newProduct = {
      name: 'Shampoo Hidratante',
      description: 'Shampoo especial para cabello con trenzas, fórmula hidratante.',
      price: 19.99,
      stock_quantity: 25,
      image_url: 'https://example.com/shampoo.jpg',
      category: 'Cuidado',
      is_active: true
    };

    const response = await request(app)
      .post('/api/products')
      .send(newProduct)
      .expect('Content-Type', /json/)
      .expect(201);

    // Verificamos que el producto fue creado correctamente
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', newProduct.name);
    expect(response.body).toHaveProperty('description', newProduct.description);
    expect(response.body).toHaveProperty('price', newProduct.price);
    expect(response.body).toHaveProperty('stock_quantity', newProduct.stock_quantity);
    expect(response.body).toHaveProperty('image_url', newProduct.image_url);
    expect(response.body).toHaveProperty('category', newProduct.category);
    expect(response.body).toHaveProperty('is_active', newProduct.is_active);
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
  });

  /**
   * @description Test para crear un producto sin image_url (debería usar URL por defecto).
   */
  it('debería crear un producto con image_url por defecto si no se proporciona', async () => {
    const newProduct = {
      name: 'Producto Sin Imagen',
      description: 'Producto de prueba sin imagen.',
      price: 9.99,
      stock_quantity: 10,
      category: 'Accesorios'
    };

    const response = await request(app)
      .post('/api/products')
      .send(newProduct)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('image_url', 'https://example.com/default-product.jpg');
  });

  /**
   * @description Test para crear un producto sin is_active (debería ser true por defecto).
   */
  it('debería crear un producto con is_active=true por defecto', async () => {
    const newProduct = {
      name: 'Producto Default Active',
      description: 'Producto sin especificar is_active.',
      price: 15.00,
      stock_quantity: 5,
      category: 'Herramientas'
    };

    const response = await request(app)
      .post('/api/products')
      .send(newProduct)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('is_active', true);
  });

  /**
   * @description Test para validar campos requeridos.
   */
  it('debería devolver error 400 si faltan campos requeridos', async () => {
    const incompleteProduct = {
      name: 'Producto Incompleto'
      // Faltan description, price, stock_quantity, category
    };

    const response = await request(app)
      .post('/api/products')
      .send(incompleteProduct)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Faltan campos requeridos');
  });

  /**
   * @description Test para validar precio positivo.
   */
  it('debería devolver error 400 si el precio no es positivo', async () => {
    const productWithNegativePrice = {
      name: 'Producto Precio Negativo',
      description: 'Test',
      price: -10.00,
      stock_quantity: 5,
      category: 'Cuidado'
    };

    const response = await request(app)
      .post('/api/products')
      .send(productWithNegativePrice)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('precio debe ser un número positivo');
  });

  /**
   * @description Test para validar stock_quantity como entero positivo.
   */
  it('debería devolver error 400 si stock_quantity no es un entero positivo', async () => {
    const productWithInvalidStock = {
      name: 'Producto Stock Inválido',
      description: 'Test',
      price: 10.00,
      stock_quantity: -5,
      category: 'Cuidado'
    };

    const response = await request(app)
      .post('/api/products')
      .send(productWithInvalidStock)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('cantidad en stock debe ser un número entero positivo');
  });

  /**
   * @description Test para validar categorías permitidas.
   */
  it('debería devolver error 400 si la categoría es inválida', async () => {
    const productWithInvalidCategory = {
      name: 'Producto Categoría Inválida',
      description: 'Test',
      price: 10.00,
      stock_quantity: 5,
      category: 'CategoriaInvalida'
    };

    const response = await request(app)
      .post('/api/products')
      .send(productWithInvalidCategory)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Categoría inválida');
  });

  /**
   * @description Test para validar que las categorías válidas funcionen.
   */
  it('debería aceptar todas las categorías válidas', async () => {
    const validCategories = ['Extensiones', 'Cuidado', 'Accesorios', 'Herramientas'];
    
    for (const category of validCategories) {
      const newProduct = {
        name: `Producto ${category}`,
        description: `Descripción para ${category}`,
        price: 15.99,
        stock_quantity: 10,
        category: category
      };

      await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect('Content-Type', /json/)
        .expect(201);
    }
  });
});

/**
 * @description Suite de tests para actualizar productos (PUT /api/products/:id).
 */
describe('PUT /api/products/:id', () => {
  /**
   * @description Test para actualizar un producto existente.
   */
  it('debería actualizar un producto existente', async () => {
    // Obtener un producto existente
    const productsResponse = await request(app).get('/api/products');
    const existingProduct = productsResponse.body[0];

    const updatedData = {
      name: 'Nombre Actualizado',
      description: 'Descripción actualizada',
      price: 29.99,
      stock_quantity: 15,
      is_active: !existingProduct.is_active
    };

    const response = await request(app)
      .put(`/api/products/${existingProduct.id}`)
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('name', updatedData.name);
    expect(response.body).toHaveProperty('description', updatedData.description);
    expect(response.body).toHaveProperty('price', updatedData.price);
    expect(response.body).toHaveProperty('stock_quantity', updatedData.stock_quantity);
    expect(response.body).toHaveProperty('is_active', updatedData.is_active);
    expect(response.body).toHaveProperty('id', existingProduct.id);
  });

  /**
   * @description Test para manejar producto no encontrado en actualización.
   */
  it('debería devolver error 404 si el producto a actualizar no existe', async () => {
    await request(app)
      .put('/api/products/producto-inexistente-123')
      .send({ name: 'No existe' })
      .expect(404);
  });

  /**
   * @description Test para validaciones en actualización.
   */
  it('debería validar precio en actualización', async () => {
    const productsResponse = await request(app).get('/api/products');
    const existingProduct = productsResponse.body[0];

    const response = await request(app)
      .put(`/api/products/${existingProduct.id}`)
      .send({ price: -5.00 })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('precio debe ser un número positivo');
  });
});

/**
 * @description Suite de tests para eliminar productos (DELETE /api/products/:id).
 */
describe('DELETE /api/products/:id', () => {
  /**
   * @description Test para eliminar un producto existente.
   */
  it('debería eliminar un producto existente y devolver status 204', async () => {
    // Obtener un producto existente
    const productsResponse = await request(app).get('/api/products');
    const existingProduct = productsResponse.body[0];

    await request(app)
      .delete(`/api/products/${existingProduct.id}`)
      .expect(204);

    // Verificar que el producto ya no existe
    await request(app)
      .get(`/api/products/${existingProduct.id}`)
      .expect(404);
  });

  /**
   * @description Test para manejar producto no encontrado en eliminación.
   */
  it('debería devolver error 404 si el producto a eliminar no existe', async () => {
    await request(app)
      .delete('/api/products/producto-inexistente-123')
      .expect(404);
  });
});