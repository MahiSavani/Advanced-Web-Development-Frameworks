const eventBus = require('../eventBus');

const NOTIFICATION_DELAY_MS = 2000;

eventBus.subscribeWithRetry('task.created', 'task-notification', (event) => {
  const startedAt = new Date().toISOString();
  console.log(`[Notification] task-created handler started at ${startedAt}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      const timestamp = new Date().toISOString();
      console.log(
        `[Notification] Task "${event.task.title}" created at ${timestamp}; assigned user: ${event.task.assignedUser}`
      );
      resolve();
    }, NOTIFICATION_DELAY_MS);
  });
});

eventBus.subscribeWithRetry('task.deleted', 'task-notification', (event) => {
  console.log(
    `[Notification] Task "${event.task.title}" deleted at ${new Date().toISOString()}`
  );
});
