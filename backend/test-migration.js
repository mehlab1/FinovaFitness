import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Test script starting...');

const migrationPath = path.join(__dirname, 'src', 'database', 'migrations', 'update-gym-visits-table.sql');
console.log('Migration path:', migrationPath);

if (fs.existsSync(migrationPath)) {
  console.log('Migration file exists!');
  const content = fs.readFileSync(migrationPath, 'utf8');
  console.log('File size:', content.length);
  console.log('First 100 characters:', content.substring(0, 100));
} else {
  console.log('Migration file does not exist!');
}

console.log('Test script completed.');
