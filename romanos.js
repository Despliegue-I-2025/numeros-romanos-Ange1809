const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

// =================================================================
// LÓGICA DE CONVERSIÓN (Funciones puras)
// =================================================================

function romanToArabic(roman) {
    // 1. Validar caracteres no romanos (Input cleanliness)
    if (!/^[IVXLCDM]+$/i.test(roman)) {
        return { error: 'El número romano contiene caracteres inválidos.' };
    }

    // 2. Regla específica: V, L y D no se pueden repetir.
    if (/(V|L|D){2,}/.test(roman)) { 
        return { error: 'Símbolos V, L y D no pueden ser repetidos.' };
    }

    // 3. Regla específica: I, X, C y M solo se pueden repetir hasta 3 veces consecutivas.
    if (/(I|X|C|M){4,}/.test(roman)) {
        return { error: 'Símbolos I, X, C y M solo se pueden repetir hasta 3 veces consecutivas.' };
    }
    
    // 4. VALIDACIÓN ESTRUCTURAL (La única regex confiable hasta 3999)
    // Esta regex (probada y confiable) garantiza que el número sea matemáticamente válido y corrige los errores de las Pruebas 1, 2, 3, 4, 10 y 16.
    const strictRomanRegex = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

    if (!strictRomanRegex.test(roman)) {
        // Este mensaje general cubre todas las reglas complejas (sustracción, orden, etc.)
        return { error: 'El número romano es estructuralmente inválido. Verifique las reglas de sustracción y orden (ej: "IL" es incorrecto).' };
    }
    
    // 5. Ejecutar la lógica de suma (Si pasa las validaciones)
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let arabic = 0;
    
    for (let i = 0; i < roman.length; i++) {
        const current = map[roman[i]];
        const next = map[roman[i + 1]];
        if (next > current) {
            arabic += next - current;
            i++;
        } else {
            arabic += current;
        }
    }
    
    // 6. Revisar el rango (Doble verificación, aunque la regex ya lo limita)
    if (arabic < 1 || arabic > 3999) {
        return { error: 'El valor arábigo calculado está fuera del rango permitido (1 a 3999).' };
    }
    
    return arabic;
}

function arabicToRoman(arabic) {
    // 1. Caso Borde: No es un número entero
    if (!Number.isInteger(arabic)) {
        return { error: 'El valor debe ser un número entero.' };
    }
    
    // 2. Caso Borde: Número es cero o negativo
    if (arabic < 1) {
        return { error: 'El número arábigo es inválido. Los números romanos comienzan en 1.' };
    }
    
    // 3. Caso Borde: Número fuera de rango (máximo 3999)
    if (arabic > 3999) {
        return { error: 'El número arábigo es inválido. Los números romanos solo llegan hasta 3999.' };
    }
    
    // Conversión (sin cambios)
    const numerals = [
        { v: 1000, s: 'M' }, { v: 900, s: 'CM' }, { v: 500, s: 'D' },
        { v: 400, s: 'CD' }, { v: 100, s: 'C' }, { v: 90, s: 'XC' },
        { v: 50, s: 'L' }, { v: 40, s: 'XL' }, { v: 10, s: 'X' },
        { v: 9, s: 'IX' }, { v: 5, s: 'V' }, { v: 4, s: 'IV' }, { v: 1, s: 'I' }
    ];
    let roman = '';
    for (const { v, s } of numerals) {
        while (arabic >= v) {
              roman += s;
              arabic -= v;
        }
    }
    return roman;
}

// =================================================================
// ENDPOINTS
// =================================================================

app.get('/', (req, res) => {
    // ... HTML interfaz ...
});


app.get('/r2a', (req, res) => {
    const roman = req.query.roman ? req.query.roman.toUpperCase().trim() : null;
    
    if (!roman) {
        return res.status(400).json({ error: 'Parametro roman requerido.' });
    }
    
    const result = romanToArabic(roman);
    
    // Manejo de errores detallado (si result es un objeto)
    if (typeof result === 'object' && result !== null && result.error) {
        return res.status(400).json({ error: result.error });
    }
    
    res.json({ arabic: result }); // 200 OK
});

app.get('/a2r', (req, res) => {
    const arabicQuery = req.query.arabic;
    
    if (!arabicQuery) {
        return res.status(400).json({ error: 'Parametro arabic requerido.' });
    }
    
    const arabic = parseInt(arabicQuery, 10);
    
    if (isNaN(arabic)) {
        return res.status(400).json({ error: 'Parametro arabic requerido: el valor no es un número válido.' });
    }
    
    const result = arabicToRoman(arabic);

    // Manejo de errores detallado (si result es un objeto)
    if (typeof result === 'object' && result !== null && result.error) {
        return res.status(400).json({ error: result.error });
    }
    
    res.json({ roman: result }); // 200 OK
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Roman Converter API' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado.' });
});

// =================================================================
// EXPORTAR PARA VERCEL
// =================================================================
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor local en puerto ${PORT}`));
}

module.exports.romanToArabic = romanToArabic;
module.exports.arabicToRoman = arabicToRoman;
module.exports = (req, res) => app(req, res);