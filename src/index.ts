import dotenv from 'dotenv';
import express, { Application } from 'express';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app: Application = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Nano Pulse!');
});

app.listen(PORT, () => {
  console.log(`Server is Running on Port http://localhost:${PORT}`);
});
