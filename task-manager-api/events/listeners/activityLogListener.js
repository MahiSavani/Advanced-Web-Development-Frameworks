const eventBus = require('../eventBus');
const { recordActivity } = require('../activityStore');

const taskEvents = [
  'task.created',
  'task.updated',
  'task.deleted',
  'task.completed',
];

taskEvents.forEach((eventName) => {
  eventBus.subscribeWithRetry(eventName, 'activity-log', (event) => {
    recordActivity({
      event: eventName,
      taskId: event.task.id,
      taskTitle: event.task.title,
      timestamp: event.timestamp,
    });
  });
});
