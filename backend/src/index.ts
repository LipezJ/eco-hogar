import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import accountsRouter from './routes/accounts.js';
import movementsRouter from './routes/movements.js';
import billsRouter from './routes/bills.js';
import debtsRouter from './routes/debts.js';
import cdtsRouter from './routes/cdts.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/accounts', accountsRouter);
app.use('/api/movements', movementsRouter);
app.use('/api/bills', billsRouter);
app.use('/api/debts', debtsRouter);
app.use('/api/cdts', cdtsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📝 Available endpoints:`);
  console.log(`   GET    /api/accounts`);
  console.log(`   POST   /api/accounts`);
  console.log(`   GET    /api/accounts/:id`);
  console.log(`   PUT    /api/accounts/:id`);
  console.log(`   DELETE /api/accounts/:id`);
  console.log(`\n   GET    /api/movements`);
  console.log(`   POST   /api/movements`);
  console.log(`   GET    /api/movements/:id`);
  console.log(`   PUT    /api/movements/:id`);
  console.log(`   DELETE /api/movements/:id`);
  console.log(`\n   GET    /api/bills`);
  console.log(`   POST   /api/bills`);
  console.log(`   GET    /api/bills/:id`);
  console.log(`   PUT    /api/bills/:id`);
  console.log(`   DELETE /api/bills/:id`);
  console.log(`\n   GET    /api/debts`);
  console.log(`   POST   /api/debts`);
  console.log(`   GET    /api/debts/:id`);
  console.log(`   PUT    /api/debts/:id`);
  console.log(`   DELETE /api/debts/:id`);
  console.log(`   GET    /api/debts/:id/payments`);
  console.log(`   PUT    /api/debts/:id/payments/:paymentId`);
  console.log(`\n   GET    /api/cdts`);
  console.log(`   POST   /api/cdts`);
  console.log(`   GET    /api/cdts/:id`);
  console.log(`   PUT    /api/cdts/:id`);
  console.log(`   DELETE /api/cdts/:id`);
});
