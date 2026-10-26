module.exports = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  title: `Sample task ${index + 1}`,
  description: `Description for sample task ${index + 1}`,
  completed: index % 2 === 0,
  createdAt: new Date().toISOString(),
}));
