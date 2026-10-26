const BASE_URL = 'http://localhost:3000';
const headers = process.env.TOKEN
  ? { Authorization: `Bearer ${process.env.TOKEN}` }
  : {};
const readings = [];

async function main() {
  for (let i = 0; i < 4; i += 1) {
    const startedAt = process.hrtime.bigint();
    const response = await fetch(`${BASE_URL}/tasks`, { headers });
    if (!response.ok) {
      throw new Error(`GET /tasks failed: ${response.status} ${response.statusText}`);
    }
    await response.arrayBuffer();
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    readings.push(elapsedMs);
  }

  console.log('| Request | Response time (ms) |');
  console.log('| --- | ---: |');
  readings.forEach((time, index) => {
    console.log(`| ${index + 1} | ${time.toFixed(3)} |`);
  });

  const statsResponse = await fetch(`${BASE_URL}/debug/cache-stats`, { headers });
  if (!statsResponse.ok) {
    throw new Error(
      `GET /debug/cache-stats failed: ${statsResponse.status} ${statsResponse.statusText}`
    );
  }
  console.log('\nCache stats:', await statsResponse.json());
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
