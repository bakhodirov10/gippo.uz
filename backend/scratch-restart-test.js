const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const request = require('supertest');

async function testRestartAndRealRequest() {
  console.log('--- RESTARTING NESTJS PROCESS & INITIALIZING CONFIG ---');
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  app.setGlobalPrefix('api/v1');
  await app.init();

  console.log('\n--- PERFORMING REAL POST /api/v1/ai/chat REQUEST ---');
  const response = await request(app.getHttpServer())
    .post('/api/v1/ai/chat')
    .send({ message: 'Bosh og\'rig\'i va holsizlik bo\'lsa nima qilish kerak?' });

  console.log('\n--- HTTP RESPONSE STATUS & DATA ---');
  console.log('HTTP Status:', response.status);
  console.log('Success:', response.body.success);
  console.log('Is Emergency:', response.body.data.isEmergency);
  console.log('Response Content Snippet:', response.body.data.reply.slice(0, 300));

  await app.close();
  console.log('\n--- TEST COMPLETED SUCCESSFULLY ---');
}

testRestartAndRealRequest().catch((err) => {
  console.error('Test Execution Error:', err);
  process.exit(1);
});
