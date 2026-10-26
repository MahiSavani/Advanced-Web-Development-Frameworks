import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import RecentActivity from '../components/RecentActivity.jsx'

const TaskInsights = lazy(() => import('./TaskInsights'))
const TaskStatsChart = lazy(() => import('../components/TaskStatsChart.jsx'))

function Home() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Plan this week', done: true },
    { id: 2, title: 'Review project milestones', done: false },
  ])
  const [newTask, setNewTask] = useState('')

  function addTask(event) {
    event.preventDefault()
    const title = newTask.trim()
    if (!title) return
    setTasks([...tasks, { id: Date.now(), title, done: false }])
    setNewTask('')
  }

  return (
    <section className="home">
      <h1>Focus on what matters.</h1>
      <p>Keep your work clear, moving, and in one place.</p>
      <form className="task-form" onSubmit={addTask}>
        <input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a task..." aria-label="New task" />
        <button className="btn primary" type="submit">Add task</button>
      </form>
      <div className="task-list">
        {tasks.map((task) => (
          <label className={`task-item${task.done ? ' complete' : ''}`} key={task.id}>
            <input type="checkbox" checked={task.done} onChange={() => setTasks(tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))} />
            <span>{task.title}</span>
          </label>
        ))}
      </div>
      <Suspense fallback={<p className="chart-loading" role="status">Loading task chart...</p>}>
        <TaskStatsChart tasks={tasks} />
      </Suspense>
      <Suspense fallback={null}>
        <TaskInsights tasks={tasks} />
      </Suspense>
      <RecentActivity />
      <Link className="repo-link" to="/projects">View projects</Link>
    </section>
  )
}

export default Home