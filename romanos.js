const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// =================================================================
// LÓGICA DE CONVERSIÓN
// =================================================================

function romanToArabic(roman) {
    if (!/^[IVXLCDM]+$/i.test(roman)) {
        return null; // Caracteres inválidos
    }
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
    return arabic;
}

function arabicToRoman(arabic) {
    if (arabic < 1 || arabic > 3999 || !Number.isInteger(arabic)) {
        return null; // Números fuera de rango (1 a 3999) o no enteros
    }
    const numerals = [
        { value: 1000, symbol: 'M' },
        { value: 900, symbol: 'CM' },
        { value: 500, symbol: 'D' },
        { value: 400, symbol: 'CD' },
        { value: 100, symbol: 'C' },
        { value: 90, symbol: 'XC' },
        { value: 50, symbol: 'L' },
        { value: 40, symbol: 'XL' },
        { value: 10, symbol: 'X' },
        { value: 9, symbol: 'IX' },
        { value: 5, symbol: 'V' },
        { value: 4, symbol: 'IV' },
        { value: 1, symbol: 'I' }
    ];

    let roman = '';
    for (const { value, symbol } of numerals) {
        while (arabic >= value) {
            roman += symbol;
            arabic -= value;
        }
    }
    return roman;
}

// =================================================================
// ENDPOINTS DE LA API
// =================================================================

// Romanos a Arabigos
app.get('/r2a', (req, res) => {
    const romanNumeral = req.query.roman ? req.query.roman.toUpperCase() : null; // Convierte a mayúsculas
    if (!romanNumeral) {
        return res.status(400).json({ error: 'Parametro roman requerido.' });
    }

    const arabicNumber = romanToArabic(romanNumeral);
    if (arabicNumber === null) {
        return res.status(400).json({ error: 'Numero romano invalido.' });
    }

    return res.json({ arabic: arabicNumber });
});

// Arabigos a Romanos
app.get('/a2r', (req, res) => {
    const arabicNumber = parseInt(req.query.arabic, 10);
    if (isNaN(arabicNumber)) {
        return res.status(400).json({ error: 'Parametro arabic requerido.' });
    }

    const romanNumeral = arabicToRoman(arabicNumber);
    if (romanNumeral === null) {
        return res.status(400).json({ error: 'Numero arabico invalido (debe ser entre 1 y 3999).' });
    }

    return res.json({ roman: romanNumeral });
});

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Roman Converter API' });
});

// Manejo de rutas no encontradas (404).
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado.' });
});

// =================================================================
// INICIO DEL SERVIDOR Y EXPORTACIÓN
// =================================================================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor de conversor escuchando en el puerto ${PORT}`);
    });
}

// Exportamos 'app' y las funciones unitarias para los tests
module.exports = { app, romanToArabic, arabicToRoman };
