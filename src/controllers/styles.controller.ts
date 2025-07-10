import { RequestHandler } from 'express';
import { Style } from '../interfaces/style.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * @file Controller para la gestión de estilos del sistema LauraBraids.
 * @description Maneja las operaciones CRUD para la entidad Style, incluyendo
 *              catálogo de estilos, categorías y filtros.
 */

// Mockup de una base de datos en memoria. Será reemplazado por PostgreSQL.
export const initialStyles: Style[] = [
  {
    id: uuidv4(),
    name: 'Box Braids',
    photo_url: 'https://example.com/box-braids.jpg',
    description: 'Clásicas y versátiles, las Box Braids son un estilo protector duradero que funciona para cualquier ocasión.',
    category: 'Largo',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: uuidv4(),
    name: 'Cornrows',
    photo_url: 'https://example.com/cornrows.jpg',
    description: 'Trenzas pegadas al cuero cabelludo, ideales para un look deportivo o elegante. Perfectas para el día a día.',
    category: 'Corto',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: uuidv4(),
    name: 'Fulani Braids',
    photo_url: 'https://example.com/fulani-braids.jpg',
    description: 'Combinación tradicional de trenzas y cornrows con accesorios decorativos. Estilo cultural y elegante.',
    category: 'Clásico',
    created_at: new Date('2024-01-05'),
    updated_at: new Date('2024-01-05'),
  },
  {
    id: uuidv4(),
    name: 'Knotless Braids',
    photo_url: 'https://example.com/knotless-braids.jpg',
    description: 'Trenzas sin nudos que ofrecen mayor comodidad y un look más natural. Ideal para cabello sensible.',
    category: 'Largo',
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-10'),
  },
  {
    id: uuidv4(),
    name: 'Goddess Braids',
    photo_url: 'https://example.com/goddess-braids.jpg',
    description: 'Trenzas gruesas y voluminosas que crean un look dramático y elegante. Perfectas para ocasiones especiales.',
    category: 'Colorido',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15'),
  },
];

let styles: Style[] = [...initialStyles];

/**
 * @description Reinicia los datos de estilos al estado inicial.
 * Útil para testing y desarrollo.
 */
export const resetStyles = () => {
  styles = [...initialStyles];
};

/**
 * @description Obtiene todos los estilos del sistema.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getStyles: RequestHandler = (req, res) => {
  const { category } = req.query;
  
  // Filtrar por categoría si se solicita
  if (category && typeof category === 'string') {
    const filteredStyles = styles.filter(s => 
      s.category.toLowerCase() === category.toLowerCase()
    );
    res.json(filteredStyles);
    return;
  }
  
  res.json(styles);
};

/**
 * @description Obtiene un estilo específico por su ID.
 * @param {Request} req - El objeto de solicitud de Express, con el ID en los parámetros.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const getStyleById: RequestHandler = (req, res) => {
  const id = req.params.id;
  const style = styles.find(s => s.id === id);
  
  if (style) {
    res.json(style);
  } else {
    res.status(404).json({ message: 'Estilo no encontrado' });
  }
};

/**
 * @description Crea un nuevo estilo.
 * @param {Request} req - El objeto de solicitud de Express, con los datos del estilo en el cuerpo.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const createStyle: RequestHandler = (req, res) => {
  const { name, photo_url, description, category } = req.body;

  // Validación simple de los datos de entrada
  if (!name || !description || !category) {
    res.status(400).json({ message: 'Faltan campos requeridos: name, description, category' });
    return;
  }

  // Validar categorías permitidas
  const validCategories = ['Largo', 'Corto', 'Clásico', 'Colorido', 'Moderno'];
  if (!validCategories.includes(category)) {
    res.status(400).json({ 
      message: `Categoría inválida. Debe ser una de: ${validCategories.join(', ')}` 
    });
    return;
  }

  // Crear el nuevo estilo
  const newStyle: Style = {
    id: uuidv4(),
    name,
    photo_url: photo_url || 'https://example.com/default-style.jpg',
    description,
    category,
    created_at: new Date(),
    updated_at: new Date(),
  };

  styles.push(newStyle);

  // Devolver el nuevo estilo con el código de estado 201 (Created)
  res.status(201).json(newStyle);
};

/**
 * @description Actualiza un estilo existente por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const updateStyle: RequestHandler = (req, res) => {
  const id = req.params.id;
  const styleIndex = styles.findIndex(s => s.id === id);

  if (styleIndex === -1) {
    res.status(404).json({ message: 'Estilo no encontrado' });
    return;
  }

  const { name, photo_url, description, category } = req.body;
  const currentStyle = styles[styleIndex];

  // Validar categoría si se proporciona
  if (category) {
    const validCategories = ['Largo', 'Corto', 'Clásico', 'Colorido', 'Moderno'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ 
        message: `Categoría inválida. Debe ser una de: ${validCategories.join(', ')}` 
      });
      return;
    }
  }

  // Actualizar campos proporcionados
  const updatedStyle: Style = {
    ...currentStyle,
    name: name || currentStyle.name,
    photo_url: photo_url || currentStyle.photo_url,
    description: description || currentStyle.description,
    category: category || currentStyle.category,
    updated_at: new Date(),
  };

  styles[styleIndex] = updatedStyle;

  res.json(updatedStyle);
};

/**
 * @description Elimina un estilo por su ID.
 * @param {Request} req - El objeto de solicitud de Express.
 * @param {Response} res - El objeto de respuesta de Express.
 */
export const deleteStyle: RequestHandler = (req, res) => {
  const id = req.params.id;
  const styleIndex = styles.findIndex(s => s.id === id);

  if (styleIndex === -1) {
    res.status(404).json({ message: 'Estilo no encontrado' });
    return;
  }

  styles.splice(styleIndex, 1);

  // El código de estado 204 (No Content) es estándar para eliminaciones exitosas.
  res.status(204).send();
};