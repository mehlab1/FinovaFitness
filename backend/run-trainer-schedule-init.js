import { runCompleteInitialization } from './src/database/init-trainer-schedules.js';

console.log('Starting trainer schedule initialization...');
runCompleteInitialization()
  .then(() => {
    console.log('Initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });
