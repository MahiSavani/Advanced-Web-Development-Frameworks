const activity = [];
const failedActivity = [];
let nextActivityId = 1;
let nextFailureId = 1;

function recordActivity(entry) {
  activity.unshift({ id: nextActivityId++, ...entry });
}

function recordFailedActivity(entry) {
  failedActivity.unshift({ id: nextFailureId++, ...entry });
}

function getActivity() {
  return activity.map((entry) => ({ ...entry }));
}

function getFailedActivity() {
  return failedActivity.map((entry) => ({ ...entry }));
}

module.exports = {
  recordActivity,
  recordFailedActivity,
  getActivity,
  getFailedActivity,
};
