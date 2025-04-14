import { AppDataSource } from './data-source';

AppDataSource.initialize().then(async () => {
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
  process.exit(1);
});
