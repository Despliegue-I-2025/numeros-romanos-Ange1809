const request = require('supertest');
// Importamos la app y las funciones unitarias
const { app, romanToArabic, arabicToRoman } = require('../romanos');

// =====================================================================
// PRUEBAS UNITARIAS DE CONVERSIÓN
// =====================================================================
describe('Conversión Unitaria', () => {

  // --- Romanos a Arábigos ---
  describe('romanToArabic', () => {
    test('debe convertir números básicos', () => {
      expect(romanToArabic('I')).toBe(1);
      expect(romanToArabic('V')).toBe(5);
      expect(romanToArabic('X')).toBe(10);
    });

    test('debe convertir números complejos (regla de sustracción)', () => {
      expect(romanToArabic('IV')).toBe(4);
      expect(romanToArabic('IX')).toBe(9);
      expect(romanToArabic('XL')).toBe(40);
      expect(romanToArabic('CM')).toBe(900);
    });

    test('debe convertir un número grande (3999)', () => {
      expect(romanToArabic('MMMCMXCIX')).toBe(3999);
    });

    test('debe retornar null para entrada vacía o caracteres inválidos', () => {
      expect(romanToArabic('')).toBeNull();
      expect(romanToArabic(' ')).toBeNull();
      expect(romanToArabic('ABC')).toBeNull();
      expect(romanToArabic('IIIIIIII')).toBeNull();
    });

    test('debe ser insensible a mayúsculas/minúsculas', () => {
      expect(romanToArabic('x')).toBe(10);
      expect(romanToArabic('mcm')).toBe(1900);
    });

    test('debe retornar null si el número es mayor a 3999', () => {
      // Ejemplo de repetición excesiva
      expect(romanToArabic('MMMM')).toBeNull();
    });
  });

  // --- Arábigos a Romanos ---
  describe('arabicToRoman', () => {
    test('debe convertir números básicos', () => {
      expect(arabicToRoman(1)).toBe('I');
      expect(arabicToRoman(5)).toBe('V');
      expect(arabicToRoman(10)).toBe('X');
    });

    test('debe convertir números complejos (regla de sustracción)', () => {
      expect(arabicToRoman(4)).toBe('IV');
      expect(arabicToRoman(9)).toBe('IX');
      expect(arabicToRoman(2024)).toBe('MMXXIV');
    });

    test('debe retornar null para valores fuera del rango (1-3999)', () => {
      expect(arabicToRoman(0)).toBeNull();
      expect(arabicToRoman(4000)).toBeNull();
      expect(arabicToRoman(-5)).toBeNull();
    });

    test('debe retornar null para entradas no numéricas o decimales', () => {
      expect(arabicToRoman('abc')).toBeNull();
      expect(arabicToRoman(NaN)).toBeNull();
      expect(arabicToRoman(2.5)).toBeNull();
    });
  });
});

// =====================================================================
// PRUEBAS DE INTEGRACIÓN (API con Supertest)
// =====================================================================
describe('Endpoints de la API', () => {

  // --- /r2a ---
  describe('GET /r2a', () => {
    test('debe responder 200 con la conversión correcta', async () => {
      const res = await request(app).get('/r2a?roman=XXIV');
      expect(res.statusCode).toBe(200);
      expect(res.body.arabic).toBe(24);
    });

    test('debe responder 400 si falta el parámetro roman', async () => {
      const res = await request(app).get('/r2a');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Parametro roman requerido.');
    });

    test('debe responder 400 si el número romano es inválido', async () => {
      const res = await request(app).get('/r2a?roman=HELLO');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Numero romano invalido.');
    });

    test('debe responder 400 si el número supera el rango válido', async () => {
      const res = await request(app).get('/r2a?roman=MMMM');
      expect(res.statusCode).toBe(400);
    });

    test('debe manejar minúsculas correctamente', async () => {
      const res = await request(app).get('/r2a?roman=xv');
      expect(res.statusCode).toBe(200);
      expect(res.body.arabic).toBe(15);
    });
  });

  // --- /a2r ---
  describe('GET /a2r', () => {
    test('debe responder 200 con la conversión correcta', async () => {
      const res = await request(app).get('/a2r?arabic=1999');
      expect(res.statusCode).toBe(200);
      expect(res.body.roman).toBe('MCMXCIX');
    });

    test('debe responder 400 si falta o es inválido el parámetro arabic', async () => {
      const res = await request(app).get('/a2r?arabic=abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Parametro arabic requerido.');
    });

    test('debe responder 400 si el número está fuera de rango', async () => {
      const res = await request(app).get('/a2r?arabic=5000');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Numero arabico invalido (debe ser entre 1 y 3999).');
    });

    test('debe responder 400 si se pasa un número decimal', async () => {
      const res = await request(app).get('/a2r?arabic=12.7');
      expect(res.statusCode).toBe(400);
    });

    test('debe responder 200 para límite inferior y superior (1 y 3999)', async () => {
      const r1 = await request(app).get('/a2r?arabic=1');
      expect(r1.statusCode).toBe(200);
      const r2 = await request(app).get('/a2r?arabic=3999');
      expect(r2.statusCode).toBe(200);
    });
  });

  // --- /health ---
  describe('GET /health', () => {
    test('debe responder con estado OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });

  // --- Rutas no encontradas ---
  describe('GET /rutaInexistente', () => {
    test('debe devolver 404 con mensaje apropiado', async () => {
      const res = await request(app).get('/noExiste');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Endpoint no encontrado.');
    });
  });
});
