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

  test('POST /tasks responds before its delayed notification completes', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    try {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'Event timing test', assignedUser: 'CI tester' })
        .expect(201);

      expect(response.body.task.assignedUser).toBe('CI tester');

      const messages = log.mock.calls.map(([message]) => message);
      const responseLogIndex = messages.findIndex((message) =>
        message.startsWith('[API] POST /tasks response sent at')
      );
      const handlerLogIndex = messages.findIndex((message) =>
        message.startsWith('[Notification] task-created handler started at')
      );
      expect(responseLogIndex).toBeGreaterThanOrEqual(0);
      expect(handlerLogIndex).toBeGreaterThan(responseLogIndex);
      expect(messages.some((message) =>
        message.startsWith('[Notification] Task "Event timing test" created at')
      )).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(log.mock.calls.some(([message]) =>
        message.startsWith('[Notification] Task "Event timing test" created at')
      )).toBe(true);
    } finally {
      log.mockRestore();
    }
  });
});
