import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const STATUS_COLORS = {
  Pending: '#d8a447',
  Completed: '#5b8f68',
}

function TaskStatsChart({ tasks }) {
  const data = [
    { name: 'Pending', value: tasks.filter((task) => !task.done).length },
    { name: 'Completed', value: tasks.filter((task) => task.done).length },
  ].filter((status) => status.value > 0)

  return (
    <section className="task-stats" aria-labelledby="task-stats-title">
      <h2 id="task-stats-title">Tasks by status</h2>
      {data.length ? (
        <div className="task-stats-chart" role="img" aria-label="Task counts by status">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius="72%">
                {data.map((status) => (
                  <Cell key={status.name} fill={STATUS_COLORS[status.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="task-stats-empty">Add a task to see its status here.</p>
      )}
    </section>
  )
}

export default TaskStatsChart