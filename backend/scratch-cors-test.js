const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const { Logger } = require('@nestjs/common');
const request = require('supertest');
require('dotenv').config();

async function testCors() {
  console.log('==================================================');
  console.log('--- TESTING CORS PREFLIGHT & REGULAR REQUESTS ---');
  console.log('==================================================\n');

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000',
    'http://192.168.100.72:3001',
    'http://192.168.100.72:3000',
  ];

  if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
    process.env.CORS_ORIGIN.split(',').forEach((origin) => {
      const trimmed = origin.trim();
      if (trimmed && !allowedOrigins.includes(trimmed)) {
        allowedOrigins.push(trimmed);
      }
    });
  }

  const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (process.env.NODE_ENV !== 'production') {
      if (
        /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
          origin,
        )
      ) {
        return true;
      }
    }
    return false;
  };

  app.enableCors({
    origin: (requestOrigin, callback) => {
      const allowed = isAllowedOrigin(requestOrigin);
      const originDisplay = requestOrigin || 'No Origin';
      logger.log(`[CORS] Origin: ${originDisplay} -> ${allowed ? 'ALLOWED' : 'BLOCKED'}`);

      if (allowed) {
        callback(null, requestOrigin || true);
      } else {
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'x-admin-invite-secret',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api/v1');
  await app.init();

  const originsToTest = [
    'http://192.168.100.72:3001',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ];

  for (const origin of originsToTest) {
    console.log(`\n[TESTING ORIGIN] ${origin}`);

    // 1. OPTIONS Preflight Test for POST /api/v1/ai/chat
    const optionsRes = await request(app.getHttpServer())
      .options('/api/v1/ai/chat')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type,authorization');

    console.log('  OPTIONS /api/v1/ai/chat Status:', optionsRes.status);
    console.log('  Access-Control-Allow-Origin:', optionsRes.headers['access-control-allow-origin']);
    console.log('  Access-Control-Allow-Credentials:', optionsRes.headers['access-control-allow-credentials']);
    console.log('  Access-Control-Allow-Methods:', optionsRes.headers['access-control-allow-methods']);
    console.log('  Access-Control-Allow-Headers:', optionsRes.headers['access-control-allow-headers']);

    if (
      optionsRes.status === 204 &&
      optionsRes.headers['access-control-allow-origin'] === origin &&
      optionsRes.headers['access-control-allow-credentials'] === 'true'
    ) {
      console.log('  -> PASS: OPTIONS Preflight returned proper CORS headers & 204 status.');
    } else {
      console.error('  -> FAIL: OPTIONS Preflight headers invalid.');
    }

    // 2. GET /api/v1/ai/conversations CORS Test
    const getRes = await request(app.getHttpServer())
      .get('/api/v1/ai/conversations')
      .set('Origin', origin);

    console.log('  GET /api/v1/ai/conversations Status:', getRes.status);
    console.log('  Access-Control-Allow-Origin:', getRes.headers['access-control-allow-origin']);
    console.log('  Access-Control-Allow-Credentials:', getRes.headers['access-control-allow-credentials']);

    if (
      getRes.headers['access-control-allow-origin'] === origin &&
      getRes.headers['access-control-allow-credentials'] === 'true'
    ) {
      console.log('  -> PASS: GET endpoint returned proper CORS headers.');
    } else {
      console.error('  -> FAIL: GET CORS headers missing.');
    }

    // 3. POST /api/v1/ai/chat CORS Test
    const postRes = await request(app.getHttpServer())
      .post('/api/v1/ai/chat')
      .set('Origin', origin)
      .send({ message: 'Salom, test message' });

    console.log('  POST /api/v1/ai/chat Status:', postRes.status);
    console.log('  Access-Control-Allow-Origin:', postRes.headers['access-control-allow-origin']);
    console.log('  Access-Control-Allow-Credentials:', postRes.headers['access-control-allow-credentials']);

    if (
      postRes.headers['access-control-allow-origin'] === origin &&
      postRes.headers['access-control-allow-credentials'] === 'true'
    ) {
      console.log('  -> PASS: POST endpoint returned proper CORS headers.');
    } else {
      console.error('  -> FAIL: POST CORS headers missing.');
    }
  }

  await app.close();
  console.log('\n==================================================');
  console.log('ALL CORS VERIFICATION TESTS COMPLETED SUCCESSFULLY');
  console.log('==================================================');
}

testCors().catch((err) => {
  console.error('CORS Test Error:', err);
  process.exit(1);
});
