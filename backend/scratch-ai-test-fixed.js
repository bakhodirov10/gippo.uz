const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const request = require('supertest');

async function runVerification() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  await app.init();

  console.log('\n--- 1. REAL AI MESSAGE (Unauthenticated Guest Access) ---');
  const res1 = await request(app.getHttpServer())
    .post('/api/v1/ai/chat')
    .send({ message: 'Bosh og\'rig\'i va charchoq sabablari nimada?' });
  
  console.log('Status Code:', res1.status);
  console.log('Response Body:', JSON.stringify(res1.body, null, 2));

  console.log('\n--- 2. REAL AI MESSAGE (Emergency Keyword Detection) ---');
  const res2 = await request(app.getHttpServer())
    .post('/api/v1/ai/chat')
    .send({ message: 'Ko\'krak qafasida qattiq og\'riq va nafas qisishi bor (chest pain)' });
  
  console.log('Status Code:', res2.status);
  console.log('Response Body:', JSON.stringify(res2.body, null, 2));

  console.log('\n--- 3. EMPTY MESSAGE VALIDATION ---');
  const res3 = await request(app.getHttpServer())
    .post('/api/v1/ai/chat')
    .send({ message: '' });

  console.log('Status Code:', res3.status);
  console.log('Response Body:', JSON.stringify(res3.body, null, 2));

  console.log('\n--- 4. INVALID CONVERSATION ID VALIDATION ---');
  const res4 = await request(app.getHttpServer())
    .post('/api/v1/ai/chat')
    .send({ message: 'General question', conversationId: 'not-a-uuid' });

  console.log('Status Code:', res4.status);
  console.log('Response Body:', JSON.stringify(res4.body, null, 2));

  await app.close();
}

runVerification().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
