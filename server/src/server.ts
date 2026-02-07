import 'dotenv/config';
import { buildApp } from './app';

const port = parseInt(process.env.PORT || '3001', 10);

async function start() {
  const app = await buildApp();

  await app.listen({ port, host: '0.0.0.0' });
  console.log(`Server is running at http://localhost:${port}`);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
