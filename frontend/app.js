const API_BASE = 'https://taskflow-api.onrender.com/api/tasks';

let tasks       = [];
let activeFilter = 'all';
let editingId    = null;

const taskForm        = document.getElementById('task-form');
const titleInput      = document.getElementById('task-title');
const descInput       = document.getElementById('task-description');
const titleError      = document.getElementById('title-error');
const taskList        = document.getElementById('task-list');
const emptyState      = document.getElementById('empty-state');
const loader          = document.getElementById('loader');
const addBtn          = document.getElementById('add-btn');
const statTotal       = document.getElementById('stat-total');
const statDone        = document.getElementById('stat-done');
const filterTabs      = document.querySelectorAll('.filter-tab');
const editModal       = document.getElementById('edit-modal');
const editForm        = document.getElementById('edit-form');
const editTitleInput  = document.getElementById('edit-title');
const editDescInput   = document.getElementById('edit-description');
const editTitleError  = document.getElementById('edit-title-error');
const modalClose      = document.getElementById('modal-close');
const cancelEdit      = document.getElementById('cancel-edit');
const toastContainer  = document.getElementById('toast-container');

function showToast(message, type = 'info') {
  const icons = { success: '✓', error: '✕', info: '•' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

async function apiFetch(url, options = {}) {
  options.headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function updateStats() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.status === 'completed').length;
  statTotal.textContent = `${total} task${total !== 1 ? 's' : ''}`;
  statDone.textContent  = `${done} done`;
}

function formatDate(isoString) {
  const d = new Date(isoString + (isoString.endsWith('Z') ? '' : 'Z'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderTasks() {
  const filtered = tasks.filter(t => {
    if (activeFilter === 'all')       return true;
    if (activeFilter === 'pending')   return t.status === 'pending';
    if (activeFilter === 'completed') return t.status === 'completed';
  });

  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item${task.status === 'completed' ? ' completed' : ''}`;
    item.dataset.id = task.id;

    item.innerHTML = `
      <button
        class="task-check"
        title="${task.status === 'completed' ? 'Mark pending' : 'Mark complete'}"
        aria-label="${task.status === 'completed' ? 'Mark pending' : 'Mark complete'}"
        onclick="toggleTask(${task.id})"
      >${task.status === 'completed' ? '✓' : ''}</button>

      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
          <span class="task-date">${formatDate(task.created_at)}</span>
          <span class="status-badge ${task.status}">${task.status}</span>
        </div>
      </div>

      <div class="task-actions">
        <button class="btn-icon-only" onclick="openEditModal(${task.id})" title="Edit task" aria-label="Edit task">✎</button>
        <button class="btn-icon-only btn-delete" onclick="deleteTask(${task.id})" title="Delete task" aria-label="Delete task">✕</button>
      </div>
    `;

    taskList.appendChild(item);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadTasks() {
  loader.classList.remove('hidden');
  emptyState.classList.add('hidden');
  taskList.innerHTML = '';

  try {
    tasks = await apiFetch(API_BASE);
    updateStats();
    renderTasks();
  } catch (err) {
    showToast('Failed to load tasks. Is the server running?', 'error');
    console.error(err);
  } finally {
    loader.classList.add('hidden');
  }
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title) {
    titleInput.classList.add('error');
    titleError.textContent = 'Title is required.';
    titleInput.focus();
    return;
  }
  titleInput.classList.remove('error');
  titleError.textContent = '';

  addBtn.disabled = true;
  addBtn.textContent = 'Adding…';

  try {
    const newTask = await apiFetch(API_BASE, {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
    tasks.unshift(newTask);
    updateStats();
    renderTasks();
    taskForm.reset();
    showToast('Task added!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    addBtn.disabled = false;
    addBtn.innerHTML = '<span class="btn-icon">✦</span> Add Task';
  }
});

titleInput.addEventListener('input', () => {
  titleInput.classList.remove('error');
  titleError.textContent = '';
});

async function toggleTask(id) {
  try {
    const updated = await apiFetch(`${API_BASE}/${id}/toggle`, { method: 'PATCH' });
    tasks = tasks.map(t => t.id === id ? updated : t);
    updateStats();
    renderTasks();
    showToast(
      updated.status === 'completed' ? 'Task completed! 🎉' : 'Task marked pending.',
      updated.status === 'completed' ? 'success' : 'info'
    );
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteTask(id) {
  const el = document.querySelector(`.task-item[data-id="${id}"]`);
  if (el) el.classList.add('removing');

  try {
    await new Promise(r => setTimeout(r, 200));
    await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    tasks = tasks.filter(t => t.id !== id);
    updateStats();
    renderTasks();
    showToast('Task deleted.', 'info');
  } catch (err) {
    showToast(err.message, 'error');
    renderTasks();
  }
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingId = id;
  editTitleInput.value = task.title;
  editDescInput.value  = task.description || '';
  editTitleError.textContent = '';
  editTitleInput.classList.remove('error');

  editModal.classList.remove('hidden');
  editTitleInput.focus();
}

function closeEditModal() {
  editModal.classList.add('hidden');
  editingId = null;
}

modalClose.addEventListener('click', closeEditModal);
cancelEdit.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.classList.contains('hidden')) closeEditModal();
});

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (editingId === null) return;

  const title = editTitleInput.value.trim();
  const description = editDescInput.value.trim();

  if (!title) {
    editTitleInput.classList.add('error');
    editTitleError.textContent = 'Title is required.';
    editTitleInput.focus();
    return;
  }

  try {
    const updated = await apiFetch(`${API_BASE}/${editingId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description }),
    });
    tasks = tasks.map(t => t.id === editingId ? updated : t);
    updateStats();
    renderTasks();
    closeEditModal();
    showToast('Task updated!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    renderTasks();
  });
});

loadTasks();
