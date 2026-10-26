const eventBus = require('../eventBus');
const { recordActivity } = require('../activityStore');

const EMAIL_DELAY_MS = 2000;
const DEMO_EMAIL_FAILURE = process.env.DEMO_EMAIL_FAILURE === 'true';
const taskEvents = [
  'task.created',
  'task.updated',
  'task.deleted',
  'task.completed',
];

taskEvents.forEach((eventName) => {
  eventBus.subscribeWithRetry(eventName, 'email', (event) => (
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (DEMO_EMAIL_FAILURE) {
          reject(new Error('Demo email failure is enabled.'));
          return;
        }

        const timestamp = new Date().toISOString();
        console.log(
          `[${timestamp}] Fake email sent for ${eventName}: ${event.task.title}`
        );
        recordActivity({
          event: 'email.sent',
          sourceEvent: eventName,
          taskId: event.task.id,
          taskTitle: event.task.title,
          timestamp,
        });
        resolve();
      }, EMAIL_DELAY_MS);
    })
  ));
});
