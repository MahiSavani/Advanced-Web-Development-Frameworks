import { useState } from 'react'

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(form)
    setSent(true)
  }

  return (
    <section className="contact">
      <h2>Contact Me</h2>

      <p className="live-preview">
        <strong>Preview:</strong> {form.name || '...'} — {form.message || '...'}
      </p>

      {sent ? (
        <p>Thanks for reaching out! I'll get back to you soon.</p>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={form.message}
            onChange={handleChange}
            required
          />
          <p className="char-count">{form.message.length} characters</p>

          <button type="submit" className="btn primary">Send Message</button>
        </form>
      )}
    </section>
  )
}

export default Contact