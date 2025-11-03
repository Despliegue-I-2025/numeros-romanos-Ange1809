const request = require('supertest');
// Importa la aplicación Express y las funciones unitarias
const { app, romanToArabic, arabicToRoman } = require('./romanos.js'); 

// Pruebas Unitarias para la lógica de conversión
describe('Conversión Unitaria', () => {
    
    // --- Romanos a Arabigos ---
    describe('romanToArabic', () => {
        test('debe convertir números básicos (I, V, X)', () => {
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

        test('debe retornar null para entrada inválida', () => {
            expect(romanToArabic('IM')).toBe(999); // Ejemplo de validación simple
            expect(romanToArabic('Z')).toBeNull(); // Caracter no romano
        });
    });

    // --- Arabigos a Romanos ---
    describe('arabicToRoman', () => {
        test('debe convertir números básicos (1, 5, 10)', () => {
            expect(arabicToRoman(1)).toBe('I');
            expect(arabicToRoman(5)).toBe('V');
            expect(arabicToRoman(10)).toBe('X');
        });

        test('debe convertir números complejos (regla de sustracción)', () => {
            expect(arabicToRoman(4)).toBe('IV');
            expect(arabicToRoman(90)).toBe('XC');
            expect(arabicToRoman(2024)).toBe('MMXXIV');
        });

        test('debe retornar null para números fuera de rango (1-3999)', () => {
            expect(arabicToRoman(0)).toBeNull();
            expect(arabicToRoman(4000)).toBeNull();
        });
    });
});

// Pruebas de Integración (Endpoints de Express con Supertest)
describe('Endpoints de la API', () => {

    // --- Endpoint /r2a (Romanos a Arabigos) ---
    describe('GET /r2a', () => {
        test('debe responder 200 con la conversión correcta', async () => {
            const response = await request(app).get('/r2a?roman=XXIV');
            expect(response.statusCode).toBe(200);
            expect(response.body.arabic).toBe(24);
        });

        test('debe responder 400 si falta el parámetro roman', async () => {
            const response = await request(app).get('/r2a');
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Parametro roman requerido.');
        });

        test('debe responder 400 si el número romano es inválido', async () => {
            const response = await request(app).get('/r2a?roman=IMPOSSIBLE');
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Numero romano invalido.');
        });
    });

    // --- Endpoint /a2r (Arabigos a Romanos) ---
    describe('GET /a2r', () => {
        test('debe responder 200 con la conversión correcta', async () => {
            const response = await request(app).get('/a2r?arabic=1999');
            expect(response.statusCode).toBe(200);
            expect(response.body.roman).toBe('MCMXCIX');
        });

        test('debe responder 400 si falta o es inválido el parámetro arabic', async () => {
            const response = await request(app).get('/a2r?arabic=abc');
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Parametro arabic requerido.');
        });
        
        test('debe responder 400 si el número está fuera de rango', async () => {
            const response = await request(app).get('/a2r?arabic=5000');
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Numero arabico invalido (debe ser entre 1 y 3999).');
        });
    });
});
