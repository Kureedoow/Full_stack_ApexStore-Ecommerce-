// src/seed/index.js
// Master seed script — runs all seeders in order

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const run = (script) => {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`▶  Running: ${path.basename(script)}`);
  console.log('─'.repeat(50));
  execSync(`node ${script}`, { stdio: 'inherit' });
};

console.log('\n🌱 Starting database seed...\n');

run(path.join(__dirname, 'seedAdmin.js'));
run(path.join(__dirname, 'seedCategories.js'));
run(path.join(__dirname, 'seedProducts.js'));

console.log('\n✅ Database seeded successfully!\n');
console.log('Admin credentials:');
console.log('  Email: admin@ecommerce.com');
console.log('  Password: Admin@12345\n');
