function TaskInsights({ tasks }) {
  const completed = tasks.filter((task) => task.done).length
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  return (
    <aside className="task-insights" aria-label="Task progress">
      <div>
        <span className="insight-label">Progress</span>
        <strong>{progress}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${progress}%` }} />
      </div>
      <span className="insight-label">{completed} of {tasks.length} tasks complete</span>
    </aside>
  )
}

export default TaskInsights