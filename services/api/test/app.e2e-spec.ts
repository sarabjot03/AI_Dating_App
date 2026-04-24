import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
  });

  it('GET /v1/health', () => {
    return request(app.getHttpServer()).get('/v1/health').expect(200).expect((res) => {
      expect(res.body.status).toBe('ok');
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
