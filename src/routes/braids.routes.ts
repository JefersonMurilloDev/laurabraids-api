import { Router } from 'express';
import { getBraids, getBraidById, createBraid, updateBraid, deleteBraid } from '../controllers/braids.controller';

const router = Router();

// Definición de las rutas para las trenzas

// GET /api/braids - Obtener todas las trenzas
router.get('/', getBraids);

// GET /api/braids/:id - Obtener una trenza por ID
router.get('/:id', getBraidById);

// POST /api/braids - Crear una nueva trenza
router.post('/', createBraid);

// PUT /api/braids/:id - Actualizar una trenza existente
router.put('/:id', updateBraid);

// DELETE /api/braids/:id - Eliminar una trenza
router.delete('/:id', deleteBraid);

export default router;
