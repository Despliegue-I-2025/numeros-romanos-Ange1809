const express = require('express');
const app = express();

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
    // Limite máximo 3999
    if (arabic > 3999) return null; 
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
    let tempArabic = arabic;
    for (const { value, symbol } of numerals) {
        while (tempArabic >= value) {
            roman += symbol;
            tempArabic -= value;
        }
    }
    return roman;
}

// =================================================================
// ENDPOINTS
// =================================================================

// Página de inicio: muestra las rutas disponibles
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Conversor Romano ↔ Arábigo</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; text-align: center; padding: 50px; }
                    h1 { color: #333; }
                    a { display: inline-block; margin: 10px; padding: 10px 20px; background: #007BFF; color: white; text-decoration: none; border-radius: 8px; }
                    a:hover { background: #0056b3; }
                    p { color: #444; }
                </style>
            </head>
            <body>
                <h1>Conversor de Números Romanos ↔ Arábigos</h1>
                <p>Selecciona qué conversión deseas realizar:</p>
                <a href="/r2a">Romano → Arábigo</a>
                <a href="/a2r">Arábigo → Romano</a>
                <p>Por ejemplo: <code>/r2a?roman=XXIV</code> o <code>/a2r?arabic=24</code></p>
            </body>
        </html>
    `);
});

// Romanos a Arabigos
app.get('/r2a', (req, res) => {
    const roman = req.query.roman ? req.query.roman.toUpperCase() : null;

    // Mostrar ayuda si no se pasa el parámetro
    if (!roman) {
        return res.send(`
            <h2>Conversor Romano → Arábigo</h2>
            <p>Convierte números romanos a arábigos.</p>
            <p><b>Uso:</b> /r2a?roman=XXIV</p>
            <p>Ejemplo: <a href="/r2a?roman=XXIV">/r2a?roman=XXIV</a></p>
            <a href="/">⬅ Volver al inicio</a>
        `);
    }

    const arabic = romanToArabic(roman);
    if (arabic === null) {
        return res.status(400).json({ error: 'Numero romano invalido.' });
    }

    return res.json({ arabic });
});

// Arabigos a Romanos
app.get('/a2r', (req, res) => {
    const arabic = parseInt(req.query.arabic, 10);

    // Mostrar ayuda si no se pasa el parámetro
    if (isNaN(arabic)) {
        return res.send(`
            <h2>Conversor Arábigo → Romano</h2>
            <p>Convierte números arábigos a romanos (1 a 3999).</p>
            <p><b>Uso:</b> /a2r?arabic=10</p>
            <p>Ejemplo: <a href="/a2r?arabic=10">/a2r?arabic=10</a></p>
            <a href="/">⬅ Volver al inicio</a>
        `);
    }

    const roman = arabicToRoman(arabic);
    if (roman === null) {
        return res.status(400).json({ error: 'Numero arabico invalido (debe ser entre 1 y 3999).' });
    }

    return res.json({ roman });
});

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Roman Converter API' });
});

// Manejo de rutas no encontradas (404)
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado.' });
});

// Solo iniciar servidor localmente (no en Vercel)
if (process.env.VERCEL === undefined) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
}

// Exportar para tests y vercel
module.exports = { app, romanToArabic, arabicToRoman };
