const request = require('supertest');
const app = require('../server');

describe('Task Manager API', () => {
  test('GET /tasks returns 200 and a task list', async () => {
    const response = await request(app).get('/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body.tasks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: expect.any(Number), title: expect.any(String) }),
    ]));
  });

  test('GET /api/activity returns 200 and an activity list', async () => {
    const response = await request(app).get('/api/activity');

    expect(response.statusCode).toBe(200);
    expect(response.body.activity).toEqual(expect.any(Array));
  });
});
