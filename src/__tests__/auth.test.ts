/**
 * @file Tests para los endpoints de autenticación de la API LauraBraids.
 * @description Tests completos para operaciones de autenticación incluyendo
 *              login, registro, perfil, cambio de contraseña y logout.
 */

import request from 'supertest';
import app from '../index';
import { resetUsers } from '../controllers/auth.controller';
import { UserRole } from '../interfaces/user.interface';

// Hook para resetear los datos antes de cada prueba
beforeEach(() => {
  resetUsers();
});

/**
 * @description Suite de tests para registro de usuarios (POST /api/auth/register).
 */
describe('POST /api/auth/register', () => {
  /**
   * @description Test para registro exitoso de usuario.
   */
  it('debería registrar un nuevo usuario exitosamente', async () => {
    const newUser = {
      name: 'Carlos López',
      email: 'carlos@example.com',
      password: 'Password123',
      role: UserRole.CUSTOMER
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(201);

    // Verificar estructura de respuesta
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Usuario registrado exitosamente');
    expect(response.body).toHaveProperty('data');
    
    // Verificar datos del token y usuario
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('expires_in');
    
    // Verificar que el usuario no contenga password
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user).toHaveProperty('name', newUser.name);
    expect(response.body.data.user).toHaveProperty('email', newUser.email);
    expect(response.body.data.user).toHaveProperty('role', newUser.role);
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(response.body.data.user).not.toHaveProperty('password_hash');
  });

  /**
   * @description Test para registro con rol por defecto.
   */
  it('debería registrar usuario con rol CUSTOMER por defecto', async () => {
    const newUser = {
      name: 'Sofia García',
      email: 'sofia@example.com',
      password: 'Password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser)
      .expect(201);

    expect(response.body.data.user.role).toBe(UserRole.CUSTOMER);
  });

  /**
   * @description Test para registro con email duplicado.
   */
  it('debería devolver error 409 si el email ya existe', async () => {
    const userData = {
      name: 'Usuario Duplicado',
      email: 'maria@example.com', // Email que ya existe en los datos mock
      password: 'Password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(409);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'El email ya está registrado');
    expect(response.body).toHaveProperty('error', 'EMAIL_ALREADY_EXISTS');
  });

  /**
   * @description Test para validación de campos requeridos.
   */
  it('debería devolver error 400 si faltan campos requeridos', async () => {
    const incompleteUser = {
      name: 'Usuario Incompleto'
      // Faltan email y password
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(incompleteUser)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
  });

  /**
   * @description Test para validación de contraseña débil.
   */
  it('debería devolver error 400 con contraseña débil', async () => {
    const userWithWeakPassword = {
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'weak'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userWithWeakPassword)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
  });
});

/**
 * @description Suite de tests para login de usuarios (POST /api/auth/login).
 */
describe('POST /api/auth/login', () => {
  /**
   * @description Test para login exitoso.
   */
  it('debería hacer login exitosamente con credenciales válidas', async () => {
    const credentials = {
      email: 'maria@example.com',
      password: 'password123' // Password de los datos mock
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials)
      .expect(200);

    // Verificar estructura de respuesta
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Login exitoso');
    expect(response.body).toHaveProperty('data');
    
    // Verificar token y datos del usuario
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('expires_in');
    
    // Verificar que el usuario no contenga password
    expect(response.body.data.user).toHaveProperty('email', credentials.email);
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(response.body.data.user).not.toHaveProperty('password_hash');
  });

  /**
   * @description Test para login con email inexistente.
   */
  it('debería devolver error 401 con email inexistente', async () => {
    const credentials = {
      email: 'noexiste@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
    expect(response.body).toHaveProperty('error', 'INVALID_CREDENTIALS');
  });

  /**
   * @description Test para login con contraseña incorrecta.
   */
  it('debería devolver error 401 con contraseña incorrecta', async () => {
    const credentials = {
      email: 'maria@example.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
    expect(response.body).toHaveProperty('error', 'INVALID_CREDENTIALS');
  });

  /**
   * @description Test para validación de campos requeridos en login.
   */
  it('debería devolver error 400 si faltan campos requeridos', async () => {
    const incompleteCredentials = {
      email: 'maria@example.com'
      // Falta password
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(incompleteCredentials)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
  });
});

/**
 * @description Suite de tests para obtener perfil (GET /api/auth/profile).
 */
describe('GET /api/auth/profile', () => {
  let authToken: string;

  beforeEach(async () => {
    // Login para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'maria@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  /**
   * @description Test para obtener perfil con token válido.
   */
  it('debería obtener el perfil del usuario autenticado', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Perfil obtenido exitosamente');
    expect(response.body).toHaveProperty('data');
    
    // Verificar datos del perfil
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('name');
    expect(response.body.data).toHaveProperty('email');
    expect(response.body.data).toHaveProperty('role');
    expect(response.body.data).not.toHaveProperty('password_hash');
  });

  /**
   * @description Test para acceso sin token.
   */
  it('debería devolver error 401 sin token de autorización', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Token de acceso requerido');
    expect(response.body).toHaveProperty('error', 'MISSING_TOKEN');
  });

  /**
   * @description Test para acceso con token inválido.
   */
  it('debería devolver error 403 con token inválido', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer token_invalido')
      .expect(403);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'MALFORMED_TOKEN');
  });
});

/**
 * @description Suite de tests para cambio de contraseña (PUT /api/auth/change-password).
 */
describe('PUT /api/auth/change-password', () => {
  let authToken: string;

  beforeEach(async () => {
    // Login para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'maria@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  /**
   * @description Test para cambio de contraseña exitoso.
   */
  it('debería cambiar la contraseña exitosamente', async () => {
    const passwordData = {
      currentPassword: 'password123',
      newPassword: 'NewPassword123',
      confirmPassword: 'NewPassword123'
    };

    const response = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send(passwordData)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Contraseña actualizada exitosamente');
  });

  /**
   * @description Test para cambio con contraseña actual incorrecta.
   */
  it('debería devolver error 400 con contraseña actual incorrecta', async () => {
    const passwordData = {
      currentPassword: 'wrongpassword',
      newPassword: 'NewPassword123',
      confirmPassword: 'NewPassword123'
    };

    const response = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send(passwordData)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'La contraseña actual es incorrecta');
    expect(response.body).toHaveProperty('error', 'INVALID_CURRENT_PASSWORD');
  });

  /**
   * @description Test para validación de contraseñas no coincidentes.
   */
  it('debería devolver error 400 si las contraseñas no coinciden', async () => {
    const passwordData = {
      currentPassword: 'password123',
      newPassword: 'NewPassword123',
      confirmPassword: 'DifferentPassword123'
    };

    const response = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send(passwordData)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
  });
});

/**
 * @description Suite de tests para logout (POST /api/auth/logout).
 */
describe('POST /api/auth/logout', () => {
  let authToken: string;

  beforeEach(async () => {
    // Login para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'maria@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  /**
   * @description Test para logout exitoso.
   */
  it('debería hacer logout exitosamente', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Logout exitoso. Token debe ser eliminado del cliente.');
  });

  /**
   * @description Test para logout sin token.
   */
  it('debería devolver error 401 sin token de autorización', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'MISSING_TOKEN');
  });
});

/**
 * @description Suite de tests para refresh token (POST /api/auth/refresh).
 */
describe('POST /api/auth/refresh', () => {
  let authToken: string;

  beforeEach(async () => {
    // Login para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'maria@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  /**
   * @description Test para refresh token exitoso.
   */
  it('debería refrescar el token exitosamente', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Token refrescado exitosamente');
    expect(response.body).toHaveProperty('data');
    
    // Verificar que devuelve un nuevo token
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('expires_in');
    
    // El nuevo token debe ser válido (puede ser igual si se genera en el mismo segundo)
    expect(response.body.data.token).toBeDefined();
    expect(typeof response.body.data.token).toBe('string');
  });

  /**
   * @description Test para refresh sin token.
   */
  it('debería devolver error 401 sin token de autorización', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'MISSING_TOKEN');
  });
});