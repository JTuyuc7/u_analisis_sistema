import { AppDataSource } from './data-source';

console.log('Starting migration runner...');
console.log('Node environment:', process.env.NODE_ENV);
console.log('Database URL provided:', !!process.env.DATABASE_URL);

AppDataSource.initialize().then(async () => {
  console.log('Data Source has been initialized');
  try {
    await AppDataSource.runMigrations();
    console.log('Migrations have been run successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}).catch(error => {
  console.error('Error during Data Source initialization:', error);
  if (error.code === 'ECONNREFUSED') {
    console.error('Connection refused. Please check if the database server is running and accessible.');
  }
  if (error.message.includes('SSL')) {
    console.error('SSL connection error. You might need to adjust SSL settings in your database configuration.');
  }
  process.exit(1);
});
