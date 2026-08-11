const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const request = require('supertest');

async function testAi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  await app.init();

  console.log('\n--- TEST 1: Unauthenticated request to POST /api/v1/ai/chat ---');
  const res1 = await request(app.getHttpServer())
    .post('/api/v1/ai/chat')
    .send({ message: 'Bosh og\'rig\'i haqida ma\'lumot bering' });
  
  console.log('Status Code:', res1.status);
  console.log('Response Body:', JSON.stringify(res1.body, null, 2));

  console.log('\n--- TEST 2: Empty message validation check ---');
  const res2 = await request(app.getHttpServer())
    .post('/api/v1/ai/chat')
    .send({ message: '' });

  console.log('Status Code:', res2.status);
  console.log('Response Body:', JSON.stringify(res2.body, null, 2));

  console.log('\n--- TEST 3: Invalid conversationId check ---');
  const res3 = await request(app.getHttpServer())
    .post('/api/v1/ai/chat')
    .send({ message: 'Headache', conversationId: 'not-a-uuid' });

  console.log('Status Code:', res3.status);
  console.log('Response Body:', JSON.stringify(res3.body, null, 2));

  await app.close();
}

testAi().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
