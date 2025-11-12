import express, { type Request, type Response } from 'express';
import {
  type Movement,
} from '@web-project/types/movements';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_: Request, res: Response) => {
  res.json({ message: 'Backend API con TypeScript - Tipos compartidos con frontend' });
});

app.get('/health', (_: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ejemplo de endpoint usando tipos compartidos
app.get('/api/movements', (_: Request, res: Response) => {
  const movements: Movement[] = [
    {
      id: '1',
      type: 'ingreso',
      category: 'otros',
      amount: 1000,
      description: 'Ejemplo de movimiento',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];
  res.json(movements);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
