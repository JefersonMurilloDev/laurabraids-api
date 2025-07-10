/**
 * @file Punto de entrada principal para la API de LauraBraids.
 * @author Tu Nombre <tu_email@ejemplo.com>
 * @description Este archivo inicializa el servidor de Express y carga las rutas de la aplicación.
 */

import express, { Express, Request, Response } from 'express';
import { testConnection } from './config/database.config';
import braidsRoutes from './routes/braids.routes';
import usersRoutes from './routes/users.routes';
import stylistsRoutes from './routes/stylists.routes';
import stylesRoutes from './routes/styles.routes';
import productsRoutes from './routes/products.routes';
import appointmentsRoutes from './routes/appointments.routes';
import reviewsRoutes from './routes/reviews.routes';
import authRoutes from './routes/auth.routes';
import categoriesRoutes from './routes/categories.routes';
import ordersRoutes from './routes/orders.routes';

// Creación de la instancia de la aplicación Express.
const app: Express = express();

// Definición del puerto. Se tomará del entorno si está disponible, si no, se usará el 3000.
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

/**
 * @route GET /
 * @description Ruta de bienvenida para verificar que el servidor está en línea.
 * @access Público
 */
app.get('/', (req: Request, res: Response) => {
  res.send('¡El servidor de LauraBraids está funcionando!');
});

// Ruta de prueba directa
app.get('/test-direct', (req: Request, res: Response) => {
  res.json({ message: 'Direct test route works!' });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/braids', braidsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stylists', stylistsRoutes);
app.use('/api/styles', stylesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    await testConnection();
    console.log('📊 Conexión a MySQL establecida exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error);
    console.log('⚠️ El servidor continuará con funcionalidad limitada');
  }
}

// Inicia el servidor para que escuche en el puerto especificado.
app.listen(port, () => {
  console.log(`⚡️[servidor]: El servidor está corriendo en http://localhost:${port}`);
  
  // Inicializar base de datos de forma asíncrona
  initializeDatabase();
});

export default app;
