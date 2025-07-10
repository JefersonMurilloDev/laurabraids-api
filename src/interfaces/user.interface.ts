/**
 * @file Define la interfaz para la entidad User.
 * @description Representa un usuario del sistema que puede ser cliente o administrador.
 *              Incluye autenticación, autorización y gestión de perfil.
 */
export interface User {
  id: string; // UUID como identificador único
  name: string;
  email: string; // Email único para inicio de sesión
  password_hash: string; // Contraseña hasheada con algoritmo seguro (Bcrypt)
  role: UserRole; // Rol del usuario para autorización
  phone?: string; // Teléfono opcional
  created_at: Date;
  updated_at: Date;
}

/**
 * @description Enum para los roles de usuario en el sistema.
 * CUSTOMER: Cliente que puede hacer reservas y compras
 * ADMIN: Administrador con permisos de gestión
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}