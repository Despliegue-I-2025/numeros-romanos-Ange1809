const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

// =====================================================
// Mapa de valores básicos
// =====================================================
const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };

// =====================================================
// LÓGICA DE CONVERSIÓN — ROMANO → ARÁBIGO
// =====================================================
function romanToArabic(roman) {
    if (!roman || typeof roman !== "string") {
        return { error: "Debe ingresar un número romano." };
    }

    roman = roman.toUpperCase().trim();

    // 1. Caracteres válidos
    if (!/^[IVXLCDM]+$/.test(roman)) {
        return { error: "El número romano contiene caracteres inválidos. Solo se permiten: I V X L C D M." };
    }

    // 2. Repeticiones inválidas
    if (/IIII/.test(roman)) {
        return { error: "Símbolo I solo puede repetirse hasta 3 veces consecutivas." };
    }
    if (/XXXX/.test(roman)) {
        return { error: "Símbolo X solo puede repetirse hasta 3 veces consecutivas." };
    }
    if (/CCCC/.test(roman)) {
        return { error: "Símbolo C solo puede repetirse hasta 3 veces consecutivas." };
    }
    if (/MMMM/.test(roman)) {
        return { error: "Símbolo M solo puede repetirse hasta 3 veces consecutivas." };
    }

    // 3. V L D NO pueden repetirse
    if (/VV/.test(roman)) return { error: "Símbolo V no puede repetirse." };
    if (/LL/.test(roman)) return { error: "Símbolo L no puede repetirse." };
    if (/DD/.test(roman)) return { error: "Símbolo D no puede repetirse." };

    // 4. Restas válidas permitidas
    const validSubtractions = ["IV","IX","XL","XC","CD","CM"];

    // 5. Detectar restas inválidas como IL, IC, XM, VX
    for (let i = 0; i < roman.length - 1; i++) {
        const curr = roman[i];
        const next = roman[i + 1];
        const vCurr = map[curr];
        const vNext = map[next];

        if (vCurr < vNext) {
            const pair = curr + next;
            if (!validSubtractions.includes(pair)) {
                return { error: `La resta '${pair}' es inválida.` };
            }
        }
    }

    // 6. Conversión estándar
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
        const curr = map[roman[i]];
        const next = map[roman[i + 1]];
        if (next > curr) {
            total += next - curr;
            i++;
        } else {
            total += curr;
        }
    }

    // 7. Rango permitido 1 a 3999
    if (total < 1) return { error: "El número romano no puede representar 0 ni negativos." };
    if (total > 3999) return { error: "El resultado excede 3999, límite máximo permitido." };

    return total;
}

// =====================================================
// LÓGICA DE CONVERSIÓN — ARÁBIGO → ROMANO
// =====================================================
function arabicToRoman(arabic) {
    if (!Number.isInteger(arabic)) {
        return { error: "Debe ingresar un número entero." };
    }
    if (arabic < 1) {
        return { error: "En números romanos NO existe el 0 ni negativos." };
    }
    if (arabic > 3999) {
        return { error: "El número máximo representable en romano es 3999." };
    }

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

// =====================================================
// INTERFAZ HTML — Home
// =====================================================
app.get('/', (req, res) => {
    res.send(`
    <html>
        <head>
            <meta charset="utf-8" />
            <title>Conversor Romano ↔ Arábigo</title>
        </head>
        <body style="font-family:sans-serif;text-align:center;padding:40px;">
            <h2>Conversor Romano ↔ Arábigo</h2>

            <h3>Romano → Arábigo</h3>
            <form action="/r2a" method="get" style="margin-bottom:20px;">
                <input type="text" name="roman" placeholder="Ej: XXIV" required />
                <button type="submit">Convertir</button>
            </form>

            <h3>Arábigo → Romano</h3>
            <form action="/a2r" method="get">
                <input type="number" name="arabic" placeholder="Ej: 2024" required min="1" max="3999" />
                <button type="submit">Convertir</button>
            </form>

            <p style="margin-top:30px;">Rango válido: 1 a 3999</p>
            <p>También puedes usar las rutas manualmente:<br>
            <code>/r2a?roman=XXIV</code> o <code>/a2r?arabic=2024</code></p>
        </body>
    </html>
    `);
});

// =====================================================
// ENDPOINTS API
// =====================================================

app.get('/r2a', (req, res) => {
    const roman = req.query.roman ? req.query.roman.toUpperCase().trim() : null;

    if (!roman) {
        return res.status(400).json({ error: 'Parametro roman requerido.' });
    }

    const result = romanToArabic(roman);

    if (typeof result === "object" && result.error) {
        return res.status(400).json({ error: result.error });
    }

    return res.json({ arabic: result });
});

app.get('/a2r', (req, res) => {
    const raw = req.query.arabic;

    if (!raw) {
        return res.status(400).json({ error: "Parametro arabic requerido." });
    }

    const num = parseInt(raw, 10);

    if (isNaN(num)) {
        return res.status(400).json({ error: "El valor debe ser numérico." });
    }

    const result = arabicToRoman(num);

    if (typeof result === "object" && result.error) {
        return res.status(400).json({ error: result.error });
    }

    return res.json({ roman: result });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Roman Converter API' });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado.' });
});

// =====================================================
// EXPORTAR PARA VERCEL Y JEST
// =====================================================
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor local en puerto ${PORT}`));
}

module.exports = app;
module.exports.romanToArabic = romanToArabic;
module.exports.arabicToRoman = arabicToRoman;
