/**
 * @file Tests para los endpoints de usuarios de la API LauraBraids.
 * @description Tests completos para operaciones CRUD de usuarios,
 *              incluyendo validaciones, registro y gestión de perfiles.
 */

import request from 'supertest';
import app from '../index';
import { resetUsersForTesting } from '../controllers/users.controller';
import { UserRole } from '../interfaces/user.interface';

// Hook para resetear los datos antes de cada prueba
beforeEach(async () => {
  await resetUsersForTesting();
});

/**
 * @description Suite de tests para obtener usuarios (GET /api/users).
 */
describe('GET /api/users', () => {
  /**
   * @description Test para obtener todos los usuarios.
   * @test {GET /api/users} - Debería devolver un array de usuarios y un status 200.
   */
  it('debería devolver una lista de usuarios sin passwords', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificamos que la respuesta sea un array
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Verificamos que el primer usuario tenga las propiedades correctas
    const firstUser = response.body[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('name');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('role');
    expect(firstUser).toHaveProperty('created_at');
    expect(firstUser).toHaveProperty('updated_at');
    
    // Verificamos que NO tenga el password_hash por seguridad
    expect(firstUser).not.toHaveProperty('password_hash');
  });
});

/**
 * @description Suite de tests para obtener usuario por ID (GET /api/users/:id).
 */
describe('GET /api/users/:id', () => {
  /**
   * @description Test para obtener un usuario específico por su ID.
   */
  it('debería devolver un usuario específico por su id', async () => {
    // Primero obtenemos la lista para conseguir un ID válido
    const usersResponse = await request(app).get('/api/users');
    const validUserId = usersResponse.body[0].id;

    const response = await request(app)
      .get(`/api/users/${validUserId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    // Verificamos que la respuesta tenga las propiedades correctas
    expect(response.body).toHaveProperty('id', validUserId);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('role');
    
    // Verificamos que NO tenga el password_hash
    expect(response.body).not.toHaveProperty('password_hash');
  });

  /**
   * @description Test para manejar el caso de un usuario no encontrado.
   */
  it('debería devolver un error 400 si el ID no es válido', async () => {
    await request(app)
      .get('/api/users/usuario-inexistente-123')
      .expect(400);
  });
});

/**
 * @description Suite de tests para crear usuarios (POST /api/users).
 */
describe('POST /api/users', () => {
  /**
   * @description Test para crear un nuevo usuario con todos los campos.
   */
  it('debería crear un nuevo usuario correctamente', async () => {
    const newUser = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'Password123',
      role: UserRole.CUSTOMER
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(201);

    // Verificamos que el usuario fue creado correctamente
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', newUser.name);
    expect(response.body).toHaveProperty('email', newUser.email);
    expect(response.body).toHaveProperty('role', newUser.role);
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
    
    // Verificamos que NO devuelva el password_hash
    expect(response.body).not.toHaveProperty('password_hash');
  });

  /**
   * @description Test para crear un usuario sin rol (debería usar CUSTOMER por defecto).
   */
  it('debería crear un usuario con rol CUSTOMER por defecto', async () => {
    const newUser = {
      name: 'Ana García',
      email: 'ana@example.com',
      password: 'Password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('role', UserRole.CUSTOMER);
  });

  /**
   * @description Test para validar campos requeridos.
   */
  it('debería devolver error 400 si faltan campos requeridos', async () => {
    const incompleteUser = {
      name: 'Usuario Incompleto'
      // Faltan email y password
    };

    const response = await request(app)
      .post('/api/users')
      .send(incompleteUser)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Errores de validación');
  });

  /**
   * @description Test para validar email único.
   */
  it('debería devolver error 409 si el email ya existe', async () => {
    const firstUser = {
      name: 'Primer Usuario',
      email: 'duplicate@example.com',
      password: 'Password123'
    };

    const secondUser = {
      name: 'Segundo Usuario',
      email: 'duplicate@example.com', // Email duplicado
      password: 'Password456'
    };

    // Crear el primer usuario
    await request(app)
      .post('/api/users')
      .send(firstUser)
      .expect(201);

    // Intentar crear el segundo usuario con el mismo email
    const response = await request(app)
      .post('/api/users')
      .send(secondUser)
      .expect('Content-Type', /json/)
      .expect(409);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('El email ya está registrado');
  });

  /**
   * @description Test para validar formato de email.
   */
  it('debería devolver error 400 si el formato de email es inválido', async () => {
    const userWithInvalidEmail = {
      name: 'Usuario Email Inválido',
      email: 'email-invalido',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userWithInvalidEmail)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Errores de validación');
  });

  /**
   * @description Test para validar rol válido.
   */
  it('debería devolver error 400 si el rol es inválido', async () => {
    const userWithInvalidRole = {
      name: 'Usuario Rol Inválido',
      email: 'invalid-role@example.com',
      password: 'Password123',
      role: 'INVALID_ROLE'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userWithInvalidRole)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toBeInstanceOf(Array);
  });

  /**
   * @description Test para validar contraseña segura.
   */
  it('debería devolver error 400 si la contraseña no es segura', async () => {
    const userWithWeakPassword = {
      name: 'Usuario Contraseña Débil',
      email: 'weak@example.com',
      password: 'weak'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userWithWeakPassword)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].message).toContain('contraseña');
  });

  /**
   * @description Test para validar nombre con caracteres especiales.
   */
  it('debería devolver error 400 si el nombre contiene caracteres inválidos', async () => {
    const userWithInvalidName = {
      name: 'Usuario123!@#',
      email: 'invalid-name@example.com',
      password: 'Password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userWithInvalidName)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
  });

  /**
   * @description Test para validar longitud mínima del nombre.
   */
  it('debería devolver error 400 si el nombre es muy corto', async () => {
    const userWithShortName = {
      name: 'A',
      email: 'short@example.com',
      password: 'Password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userWithShortName)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.errors[0].message).toContain('al menos 2 caracteres');
  });
});

/**
 * @description Suite de tests para actualizar usuarios (PUT /api/users/:id).
 */
describe('PUT /api/users/:id', () => {
  /**
   * @description Test para actualizar un usuario existente.
   */
  it('debería actualizar un usuario existente', async () => {
    // Obtener un usuario existente
    const usersResponse = await request(app).get('/api/users');
    const existingUser = usersResponse.body[0];

    const updatedData = {
      name: 'Nombre Actualizado',
      email: 'updated@example.com'
    };

    const response = await request(app)
      .put(`/api/users/${existingUser.id}`)
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('name', updatedData.name);
    expect(response.body).toHaveProperty('email', updatedData.email);
    expect(response.body).toHaveProperty('id', existingUser.id);
    expect(response.body).not.toHaveProperty('password_hash');
  });

  /**
   * @description Test para manejar usuario no encontrado en actualización.
   */
  it('debería devolver error 400 si el ID no es válido', async () => {
    await request(app)
      .put('/api/users/usuario-inexistente-123')
      .send({ name: 'No existe' })
      .expect(400);
  });

  /**
   * @description Test para validar email único en actualización.
   */
  it('debería devolver error 409 si el nuevo email ya existe', async () => {
    const usersResponse = await request(app).get('/api/users');
    const users = usersResponse.body;
    
    if (users.length >= 2) {
      const firstUser = users[0];
      const secondUser = users[1];

      // Intentar actualizar el segundo usuario con el email del primero
      const response = await request(app)
        .put(`/api/users/${secondUser.id}`)
        .send({ email: firstUser.email })
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('El email ya está registrado');
    }
  });
});

/**
 * @description Suite de tests para eliminar usuarios (DELETE /api/users/:id).
 */
describe('DELETE /api/users/:id', () => {
  /**
   * @description Test para eliminar un usuario existente.
   */
  it('debería eliminar un usuario existente y devolver status 204', async () => {
    // Obtener un usuario existente
    const usersResponse = await request(app).get('/api/users');
    const existingUser = usersResponse.body[0];

    await request(app)
      .delete(`/api/users/${existingUser.id}`)
      .expect(204);

    // Verificar que el usuario ya no existe
    await request(app)
      .get(`/api/users/${existingUser.id}`)
      .expect(404);
  });

  /**
   * @description Test para manejar usuario no encontrado en eliminación.
   */
  it('debería devolver error 400 si el ID no es válido', async () => {
    await request(app)
      .delete('/api/users/usuario-inexistente-123')
      .expect(400);
  });
});