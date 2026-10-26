const EventEmitter = require('events');
const { recordFailedActivity } = require('./activityStore');

const eventBus = new EventEmitter();
// Four attempts total means the initial try plus three retries.
const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 100;

eventBus.on('error', (error, context) => {
  console.error(
    `[${new Date().toISOString()}] ${context.listenerName} failed for ${context.eventName} on attempt ${context.attempt}:`,
    error
  );
});

function subscribeWithRetry(eventName, listenerName, handler) {
  eventBus.on(eventName, (event) => {
    function attempt(attemptNumber) {
      try {
        const result = handler(event);
        if (result && typeof result.then === 'function') {
          result.catch((error) => handleFailure(error, attemptNumber));
        }
      } catch (error) {
        handleFailure(error, attemptNumber);
      }
    }

    function handleFailure(error, attemptNumber) {
      if (attemptNumber < MAX_ATTEMPTS) {
        setTimeout(() => attempt(attemptNumber + 1), RETRY_DELAY_MS);
        return;
      }

      eventBus.emit('error', error, {
        eventName,
        listenerName,
        attempt: attemptNumber,
      });
      recordFailedActivity({
        event: eventName,
        listener: listenerName,
        taskId: event.task.id,
        taskTitle: event.task.title,
        attempts: MAX_ATTEMPTS,
        error: error.message,
        failedAt: new Date().toISOString(),
      });
    }

    attempt(1);
  });
}

eventBus.subscribeWithRetry = subscribeWithRetry;

module.exports = eventBus;
