import { AppDataSource } from '../src/data-source';
import { seedInitialData } from '../src/seeders/initialData';

AppDataSource.initialize()
  .then(async (connection) => {
    await seedInitialData(connection);
    console.log('✅ Seeding complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
