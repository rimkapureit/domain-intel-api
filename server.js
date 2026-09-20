require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

const domainRoutes = require('./routes/domainRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Interface Swagger UI pour visualiser la documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route Health Check pour RapidAPI
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes API
app.use('/api/v1', domainRoutes);

// Middleware d'erreur global
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Domain Intel API en écoute sur le port ${PORT}`);
  console.log(`Documentation accessible sur http://localhost:${PORT}/docs`);
});