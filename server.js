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

// Rota de teste CORRIGIDA
app.get('/', (req, res) => {
  // ANTES: res.send('API do Proto Milk está funcionando!');
  // AGORA: Enviando uma resposta JSON válida
  res.json({ message: 'API do Proto Milk está funcionando!' });
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

app.put('/producers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, property, phone } = req.body;
    try {
        const result = await pool.query(
            'UPDATE producers SET name = $1, property = $2, phone = $3 WHERE id = $4 RETURNING *',
            [name, property, phone, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/producers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM producers WHERE id = $1', [id]);
        res.status(204).send(); // No content
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- ROTAS PARA ANIMAIS ---
app.get('/animals/:producerId', async (req, res) => {
    const { producerId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM animals WHERE producer_id = $1 ORDER BY name_or_id', [producerId]);
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

app.put('/animals/:id', async (req, res) => {
    const { id } = req.params;
    const { name_or_id, breed, sex, in_lactation, is_covered, mother_id, father_id } = req.body;
    try {
        const result = await pool.query(
            'UPDATE animals SET name_or_id = $1, breed = $2, sex = $3, in_lactation = $4, is_covered = $5, mother_id = $6, father_id = $7 WHERE id = $8 RETURNING *',
            [name_or_id, breed, sex, in_lactation, is_covered, mother_id, father_id, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/animals/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM animals WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- ROTAS PARA MEDICAMENTOS ---
app.get('/medications', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM medications ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/medications', async (req, res) => {
    const { name, dosage_per_kg, milk_withdrawal_days, price, purchase_date, expiration_date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO medications (name, dosage_per_kg, milk_withdrawal_days, price, purchase_date, expiration_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, dosage_per_kg, milk_withdrawal_days, price, purchase_date, expiration_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/medications/:id', async (req, res) => {
    const { id } = req.params;
    const { name, dosage_per_kg, milk_withdrawal_days, price, purchase_date, expiration_date } = req.body;
    try {
        const result = await pool.query(
            'UPDATE medications SET name = $1, dosage_per_kg = $2, milk_withdrawal_days = $3, price = $4, purchase_date = $5, expiration_date = $6 WHERE id = $7 RETURNING *',
            [name, dosage_per_kg, milk_withdrawal_days, price, purchase_date, expiration_date, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/medications/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM medications WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- ROTAS PARA TRATAMENTOS ---
app.get('/treatments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM treatments ORDER BY start_date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/treatments', async (req, res) => {
    const { animal_id, reason, medication_name, start_date, milk_withdrawal_days } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO treatments (animal_id, reason, medication_name, start_date, milk_withdrawal_days) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [animal_id, reason, medication_name, start_date, milk_withdrawal_days]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/treatments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM treatments WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
