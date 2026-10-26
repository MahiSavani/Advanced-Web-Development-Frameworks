import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function RecentActivity() {
  const [activity, setActivity] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadActivity() {
      try {
        const response = await fetch(`${API_URL}/api/activity`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Activity request failed (${response.status}).`)
        }
        const data = await response.json()
        setActivity(data.activity)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
        }
      }
    }

    loadActivity()
    return () => controller.abort()
  }, [])

  return (
    <section className="recent-activity" aria-labelledby="recent-activity-title">
      <h2 id="recent-activity-title">Recent activity</h2>
      {error ? (
        <p className="recent-activity-message" role="alert">{error}</p>
      ) : activity.length ? (
        <ul>
          {activity.slice(0, 5).map((item) => (
            <li key={item.id}>
              <span>{item.event.replaceAll('.', ' ')}: {item.taskTitle}</span>
              <time dateTime={item.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="recent-activity-message">No activity yet.</p>
      )}
    </section>
  )
}

export default RecentActivity
