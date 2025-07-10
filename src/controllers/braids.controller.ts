import { RequestHandler } from 'express';
import { Braid } from '../interfaces/braid.interface';

// Mockup de una base de datos en memoria. Será reemplazado por MySQL.
export const initialBraids: Braid[] = [
  { 
    id: 1, 
    name: 'Box Braids', 
    description: 'Clásicas y versátiles, las Box Braids son un estilo protector duradero.',
    photo_url: 'https://example.com/box_braids.jpg',
    category: 'Largo',
    price: 150 
  },
  { 
    id: 2, 
    name: 'Cornrows', 
    description: 'Trenzas pegadas al cuero cabelludo, ideales para un look deportivo o elegante.',
    photo_url: 'https://example.com/cornrows.jpg',
    category: 'Corto',
    price: 80 
  },
];

let braids: Braid[] = [...initialBraids];

export const resetBraids = () => {
  braids = [...initialBraids];
}

/**
 * @description Obtiene todas las trenzas.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getBraids: RequestHandler = (req, res) => {
  res.json(braids);
};

/**
 * @description Obtiene una trenza específica por su ID.
 * @param {Request} req - El objeto de solicitud de Express, con el ID en los parámetros.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getBraidById: RequestHandler = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const braid = braids.find(b => b.id === id);
  if (braid) {
    res.json(braid);
  } else {
    res.status(404).send('Braid not found');
  }
};

/**
 * @description Crea una nueva trenza.
 * @param {Request} req - El objeto de solicitud de Express, con los datos de la trenza en el cuerpo.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const createBraid: RequestHandler = (req, res) => {
  const { name, description, photo_url, category, price } = req.body;

  // Validación simple de los datos de entrada
  if (!name || !description || !category || price === undefined) {
    res.status(400).json({ message: 'Faltan campos requeridos: name, description, category, price' });
    return;
  }

  // Creamos la nueva trenza con un ID autoincremental (simulado)
  const newBraid: Braid = {
    id: braids.length > 0 ? Math.max(...braids.map(b => b.id as number)) + 1 : 1,
    name,
    description,
    photo_url: photo_url || 'https://example.com/default.jpg', // URL por defecto
    category,
    price,
  };

  braids.push(newBraid);

  // Devolvemos la nueva trenza con el código de estado 201 (Created)
  res.status(201).json(newBraid);
};

/**
 * @description Actualiza una trenza existente por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const updateBraid: RequestHandler = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const braidIndex = braids.findIndex(b => b.id === id);

  if (braidIndex === -1) {
    res.status(404).send('Braid not found');
    return;
  }

  const { name, description, photo_url, category, price } = req.body;
  if (!name || !description || !category || price === undefined) {
    res.status(400).json({ message: 'Faltan campos requeridos: name, description, category, price' });
    return;
  }

  const updatedBraid: Braid = { id, name, description, photo_url, category, price };
  braids[braidIndex] = updatedBraid;

  res.json(updatedBraid);
};

/**
 * @description Elimina una trenza por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const deleteBraid: RequestHandler = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const braidIndex = braids.findIndex(b => b.id === id);

  if (braidIndex === -1) {
    res.status(404).send('Braid not found');
    return;
  }

  braids.splice(braidIndex, 1);

  // El código de estado 204 (No Content) es estándar para eliminaciones exitosas.
  res.status(204).send();
};
