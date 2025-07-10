/**
 * @file Middleware de validación reutilizable usando Zod.
 * @description Proporciona funciones middleware para validar request body, 
 *              parámetros y query strings de manera consistente en toda la aplicación.
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * @description Tipos de validación soportados.
 */
export type ValidationTarget = 'body' | 'params' | 'query';

/**
 * @description Interfaz para errores de validación formateados.
 */
interface ValidationError {
  field: string;
  message: string;
  code: string;
  received?: any;
}

/**
 * @description Formatea los errores de Zod en un formato más amigable.
 * @param error - Error de Zod
 * @returns Array de errores formateados
 */
const formatZodError = (error: ZodError): ValidationError[] => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    received: 'received' in err ? err.received : undefined
  }));
};

/**
 * @description Middleware genérico de validación usando esquemas Zod.
 * @param schema - Esquema Zod para validar
 * @param target - Parte del request a validar ('body', 'params', 'query')
 * @returns Middleware function
 */
export const validate = (
  schema: z.ZodSchema<any>,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Obtener los datos a validar según el target
      const dataToValidate = req[target];
      
      // Validar usando el esquema Zod
      const validatedData = schema.parse(dataToValidate);
      
      // Reemplazar los datos originales con los datos validados y transformados
      if (target === 'query') {
        // Para query, necesitamos copiar las propiedades
        Object.keys(validatedData).forEach(key => {
          (req.query as any)[key] = validatedData[key];
        });
      } else {
        (req as any)[target] = validatedData;
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = formatZodError(error);
        
        res.status(400).json({
          success: false,
          message: 'Errores de validación en los datos proporcionados',
          errors: validationErrors,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Error inesperado
      console.error('Error inesperado en validación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno de validación',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * @description Middleware específico para validar el body del request.
 * @param schema - Esquema Zod para validar
 * @returns Middleware function
 */
export const validateBody = (schema: z.ZodSchema<any>) => {
  return validate(schema, 'body');
};

/**
 * @description Middleware específico para validar los parámetros de ruta.
 * @param schema - Esquema Zod para validar
 * @returns Middleware function
 */
export const validateParams = (schema: z.ZodSchema<any>) => {
  return validate(schema, 'params');
};

/**
 * @description Middleware específico para validar query parameters.
 * @param schema - Esquema Zod para validar
 * @returns Middleware function
 */
export const validateQuery = (schema: z.ZodSchema<any>) => {
  return validate(schema, 'query');
};

/**
 * @description Middleware que combina validación de múltiples targets.
 * @param schemas - Objeto con esquemas para diferentes targets
 * @returns Middleware function
 */
export const validateMultiple = (schemas: {
  body?: z.ZodSchema<any>;
  params?: z.ZodSchema<any>;
  query?: z.ZodSchema<any>;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    
    try {
      // Validar body si se proporciona esquema
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodError(error));
          }
        }
      }
      
      // Validar params si se proporciona esquema
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodError(error));
          }
        }
      }
      
      // Validar query si se proporciona esquema
      if (schemas.query) {
        try {
          const validatedQuery = schemas.query.parse(req.query);
          // Para query, copiar las propiedades validadas
          Object.keys(validatedQuery).forEach(key => {
            (req.query as any)[key] = validatedQuery[key];
          });
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodError(error));
          }
        }
      }
      
      // Si hay errores, devolver respuesta de error
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Errores de validación en los datos proporcionados',
          errors: errors,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Error inesperado en validación múltiple:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno de validación',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * @description Middleware para validación condicional basada en condiciones.
 * @param schema - Esquema Zod para validar
 * @param condition - Función que determina si se debe validar
 * @param target - Parte del request a validar
 * @returns Middleware function
 */
export const validateIf = (
  schema: z.ZodSchema<any>,
  condition: (req: Request) => boolean,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Si la condición no se cumple, continuar sin validar
    if (!condition(req)) {
      next();
      return;
    }
    
    // Si la condición se cumple, aplicar validación
    validate(schema, target)(req, res, next);
  };
};

/**
 * @description Middleware para sanitizar datos después de la validación.
 * @param sanitizers - Funciones de sanitización para diferentes campos
 * @returns Middleware function
 */
export const sanitize = (sanitizers: {
  [key: string]: (value: any) => any;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Aplicar sanitizadores al body
      if (req.body && typeof req.body === 'object') {
        for (const [field, sanitizer] of Object.entries(sanitizers)) {
          if (field in req.body) {
            req.body[field] = sanitizer(req.body[field]);
          }
        }
      }
      
      next();
    } catch (error) {
      console.error('Error en sanitización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno en sanitización de datos',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * @description Funciones de sanitización comunes.
 */
export const sanitizers = {
  /**
   * @description Convierte a minúsculas y elimina espacios extra.
   */
  toLowerCase: (value: string): string => {
    return typeof value === 'string' ? value.toLowerCase().trim() : value;
  },
  
  /**
   * @description Elimina espacios extra.
   */
  trim: (value: string): string => {
    return typeof value === 'string' ? value.trim() : value;
  },
  
  /**
   * @description Capitaliza la primera letra de cada palabra.
   */
  toTitleCase: (value: string): string => {
    if (typeof value !== 'string') return value;
    return value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).trim();
  },
  
  /**
   * @description Elimina caracteres especiales excepto letras, números y espacios.
   */
  alphanumericOnly: (value: string): string => {
    if (typeof value !== 'string') return value;
    return value.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  },
  
  /**
   * @description Normaliza números eliminando ceros innecesarios.
   */
  normalizeNumber: (value: number): number => {
    return typeof value === 'number' ? parseFloat(value.toFixed(2)) : value;
  }
};

/**
 * @description Middleware para logging de validaciones (útil para debugging).
 * @param logLevel - Nivel de logging ('info', 'debug')
 * @returns Middleware function
 */
export const logValidation = (logLevel: 'info' | 'debug' = 'debug') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (logLevel === 'debug') {
      console.log(`[Validation] ${req.method} ${req.path}:`, {
        body: req.body,
        params: req.params,
        query: req.query
      });
    } else if (logLevel === 'info') {
      console.log(`[Validation] ${req.method} ${req.path} - Validation passed`);
    }
    
    next();
  };
};