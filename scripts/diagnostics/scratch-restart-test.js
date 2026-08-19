const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const request = require('supertest');

async function testRestartAndRealRequest() {
  console.log('==================================================');
  console.log('--- RESTARTING NESTJS PROCESS & INITIALIZING AI MODULE ---');
  console.log('==================================================');

  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  app.setGlobalPrefix('api/v1');
  await app.init();

  console.log('\n--- PERFORMING REAL POST /api/v1/ai/chat REQUEST ---');
  const response = await request(app.getHttpServer())
    .post('/api/v1/ai/chat')
    .send({ message: 'Salom, bitta qisqa gap bilan javob ber.' });

  console.log('\n--- HTTP RESPONSE STATUS & DATA ---');
  console.log('HTTP Status:', response.status);
  console.log('Response Body:', JSON.stringify(response.body, null, 2));

  await app.close();
  console.log('\n==================================================');
  console.log('NESTJS RESTART VERIFICATION COMPLETED SUCCESSFULLY');
  console.log('==================================================');
}

testRestartAndRealRequest().catch((err) => {
  console.error('Test Execution Error:', err);
  process.exit(1);
});
