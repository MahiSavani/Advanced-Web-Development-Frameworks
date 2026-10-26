const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5000';
const EMAIL_TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 100;
const title = `Event demo ${Date.now()}`;

function request(path, options = {}) {
  const url = new URL(path, API_URL);

  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: options.body
        ? { 'Content-Type': 'application/json' }
        : undefined,
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        let data;
        try {
          data = body ? JSON.parse(body) : {};
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${error.message}`));
          return;
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`${options.method || 'GET'} ${path} returned ${res.statusCode}.`));
          return;
        }
        resolve(data);
      });
    });

    req.setTimeout(5000, () => {
      req.destroy(new Error('Request timed out.'));
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function main() {
  const requestStartedAt = new Date();
  const result = await request('/tasks', {
    method: 'POST',
    body: { title, description: 'Event-driven response timing demo' },
  });
  const responseAt = new Date();

  console.log(`Request started: ${requestStartedAt.toISOString()}`);
  console.log(`API responded:   ${responseAt.toISOString()} (HTTP task ${result.task.id})`);

  const deadline = Date.now() + EMAIL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const { activity } = await request('/api/activity');
    const email = activity.find(
      (entry) => entry.event === 'email.sent' && entry.taskTitle === title
    );
    if (email) {
      console.log(`Email finished:  ${email.timestamp}`);
      return;
    }

    const { failed } = await request('/api/activity/failed');
    const emailFailure = failed.find(
      (entry) => entry.listener === 'email' && entry.taskTitle === title
    );
    if (emailFailure) {
      console.log(`Email failed:    ${emailFailure.failedAt} after ${emailFailure.attempts} attempts`);
      return;
    }

    await wait(POLL_INTERVAL_MS);
  }

  throw new Error('Timed out waiting for the email listener to finish.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
