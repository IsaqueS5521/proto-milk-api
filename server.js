// server.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); // Para carregar variáveis de ambiente

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Banco de Dados Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middlewares
app.use(cors()); // Permite que seu app no Netlify acesse este servidor
app.use(express.json()); // Permite que o servidor entenda JSON

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do Proto Milk está funcionando!');
});

// --- ROTAS PARA PRODUTORES ---
app.get('/producers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM producers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/producers', async (req, res) => {
    const { name, property, phone } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO producers (name, property, phone) VALUES ($1, $2, $3) RETURNING *',
            [name, property, phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Adicione aqui as rotas PUT (update) e DELETE para produtores...

// --- ROTAS PARA ANIMAIS ---
app.get('/animals/:producerId', async (req, res) => {
    const { producerId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM animals WHERE producer_id = $1', [producerId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/animals', async (req, res) => {
    const { producer_id, name_or_id, breed, sex, in_lactation, is_covered, mother_id, father_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO animals (producer_id, name_or_id, breed, sex, in_lactation, is_covered, mother_id, father_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [producer_id, name_or_id, breed, sex, in_lactation, is_covered, mother_id, father_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Adicione aqui as rotas PUT (update) e DELETE para animais...

// Adicione aqui as rotas para MEDICAMENTOS e TRATAMENTOS...


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
