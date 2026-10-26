const cache = require('../../cache');
const eventBus = require('../eventBus');

const taskEvents = [
  'task.created',
  'task.updated',
  'task.deleted',
  'task.completed',
];

taskEvents.forEach((eventName) => {
  eventBus.subscribeWithRetry(eventName, 'cache-invalidation', () => {
    cache.flushAll();
  });
});
