const API = '/tasks';

// ── Load all tasks and render table ──────────────────────────────────────────
async function loadTasks() {
  const res = await fetch(API);
  const data = await res.json();
  renderTable(data.tasks);
}

function renderTable(tasks) {
  const tbody = document.getElementById('taskBody');
  tbody.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    tbody.innerHTML =
      '<tr class="empty-row"><td colspan="4">No tasks yet. Add one above!</td></tr>';
    return;
  }

  tasks.forEach((task) => {
    const tr = document.createElement('tr');
    tr.id = `row-${task.id}`;
    tr.innerHTML = `
      <td>${task.id}</td>
      <td id="title-${task.id}">${escapeHtml(task.title)}</td>
      <td id="status-${task.id}">
        <span class="badge ${task.completed ? 'completed' : 'pending'}">
          ${task.completed ? 'Completed' : 'Pending'}
        </span>
      </td>
      <td id="actions-${task.id}">
        <button class="btn-update" onclick="enterEditMode(${task.id}, '${escapeHtml(task.title)}', ${task.completed})">&#9998; Update</button>
        <button class="btn-delete" onclick="deleteTask(${task.id})">&#128465; Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Enter inline edit mode ────────────────────────────────────────────────────
function enterEditMode(id, currentTitle, currentCompleted) {
  // Title cell → input
  document.getElementById(`title-${id}`).innerHTML = `
    <input type="text" id="edit-title-${id}" value="${escapeHtml(currentTitle)}" class="inline-input" />
  `;

  // Status cell → dropdown
  document.getElementById(`status-${id}`).innerHTML = `
    <select id="edit-status-${id}" class="inline-select">
      <option value="false" ${!currentCompleted ? 'selected' : ''}>Pending</option>
      <option value="true"  ${currentCompleted  ? 'selected' : ''}>Completed</option>
    </select>
  `;

  // Actions cell → Save / Cancel
  document.getElementById(`actions-${id}`).innerHTML = `
    <button class="btn-save"   onclick="saveUpdate(${id})">&#10003; Save</button>
    <button class="btn-cancel" onclick="loadTasks()">&#10007; Cancel</button>
  `;
}

// ── Save updated task ─────────────────────────────────────────────────────────
async function saveUpdate(id) {
  const title     = document.getElementById(`edit-title-${id}`).value.trim();
  const completed = document.getElementById(`edit-status-${id}`).value === 'true';

  if (!title) {
    alert('Task title cannot be empty.');
    return;
  }

  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, completed }),
  });

  if (res.ok) {
    loadTasks();
  } else {
    const err = await res.json();
    alert('Error: ' + (err.message || 'Could not update task'));
  }
}

// ── Add task ──────────────────────────────────────────────────────────────────
async function addTask() {
  const titleInput     = document.getElementById('taskTitle');
  const completedInput = document.getElementById('taskCompleted');
  const title          = titleInput.value.trim();

  if (!title) {
    alert('Please enter a task title.');
    return;
  }

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, completed: completedInput.checked }),
  });

  if (res.ok) {
    titleInput.value      = '';
    completedInput.checked = false;
    loadTasks();
  } else {
    const err = await res.json();
    alert('Error: ' + (err.message || 'Could not add task'));
  }
}

// ── Delete task ───────────────────────────────────────────────────────────────
async function deleteTask(id) {
  if (!confirm(`Delete task #${id}?`)) return;

  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });

  if (res.ok) {
    loadTasks();
  } else {
    const err = await res.json();
    alert('Error: ' + (err.message || 'Could not delete task'));
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadTasks();
