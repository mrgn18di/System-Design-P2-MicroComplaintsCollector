const form = document.getElementById('complaint-form');
const textInput = document.getElementById('complaint-text');
const categorySelect = document.getElementById('category');
const messageEl = document.getElementById('form-message');
const complaintsList = document.getElementById('complaints-list');

const API_BASE = '/api/complaints'; // same origin as server.js

// Helper: get selected intensity
function getSelectedIntensity() {
  const radios = document.querySelectorAll('input[name="intensity"]');
  for (const r of radios) {
    if (r.checked) return r.value;
  }
  return null;
}

// Render complaints
function renderComplaints(complaints) {
  complaintsList.innerHTML = '';

  if (!complaints.length) {
    complaintsList.innerHTML = '<p>No complaints yet. You must be very zen. 🧘‍♀️</p>';
    return;
  }

  complaints.forEach((c) => {
    const card = document.createElement('article');
    card.className = 'complaint-card';

    const intensityEmoji =
      c.intensity === 'mild' ? '😐' :
      c.intensity === 'bad' ? '😫' :
      '💀';

    const date = new Date(c.createdAt);
    const dateStr = date.toLocaleString();

    card.innerHTML = `
      <div class="complaint-meta">
        <strong>${c.category}</strong> • ${intensityEmoji} ${c.intensity} • ${dateStr}
      </div>
      <p class="complaint-text">${c.text}</p>
      <button class="delete-btn">Delete</button>
    `;

    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async () => {
      try {
        await fetch(`${API_BASE}/${c._id}`, { method: 'DELETE' });
        loadComplaints();
      } catch (err) {
        console.error('Error deleting complaint', err);
      }
    });

    complaintsList.appendChild(card);
  });
}

// Load complaints from backend
async function loadComplaints() {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    renderComplaints(data);
  } catch (err) {
    console.error('Error loading complaints:', err);
    complaintsList.innerHTML = '<p>Error loading complaints.</p>';
  }
}

// Handle form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageEl.textContent = '';

  const text = textInput.value.trim();
  const category = categorySelect.value;
  const intensity = getSelectedIntensity();

  if (!text || !category || !intensity) {
    messageEl.textContent = 'Please fill in all fields.';
    return;
  }

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, category, intensity }),
    });

    if (!res.ok) {
      messageEl.textContent = 'Error submitting complaint.';
      return;
    }

    // Clear form
    textInput.value = '';
    categorySelect.value = '';
    document
      .querySelectorAll('input[name="intensity"]')
      .forEach((r) => (r.checked = false));

    messageEl.textContent = 'Complaint added. 💀';
    loadComplaints();
  } catch (err) {
    console.error('Error submitting complaint:', err);
    messageEl.textContent = 'Error submitting complaint.';
  }
});

// Initial load
loadComplaints();
