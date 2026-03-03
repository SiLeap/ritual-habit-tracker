// ============================================
// Ritual — Habit Tracker Web App
// Pure Vanilla JS with localStorage
// ============================================

// Proverb Data
const PROVERBS = {
  learning: [
    "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    "An investment in knowledge pays the best interest.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    "The mind is not a vessel to be filled, but a fire to be kindled.",
    "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
  ],
  fitness: [
    "Take care of your body. It's the only place you have to live.",
    "The body achieves what the mind believes.",
    "Strength does not come from physical capacity. It comes from an indomitable will.",
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind that you have to convince."
  ],
  mindfulness: [
    "Almost everything will work again if you unplug it for a few minutes — including you.",
    "The present moment is the only moment available to us.",
    "Smile, breathe, and go slowly.",
    "In today's rush, we all think too much, seek too much, want too much, and forget about the joy of just being.",
    "Peace comes from within. Do not seek it without."
  ]
};

// Habit Store - localStorage CRUD
const HabitStore = {
  STORAGE_KEY: 'ritual_habits',
  
  // Get all habits
  getAll() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  // Save habits
  save(habits) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(habits));
  },
  
  // Add new habit
  add(habit) {
    const habits = this.getAll();
    const newHabit = {
      id: this.generateId(),
      name: habit.name,
      icon: habit.icon,
      category: habit.category,
      targetDays: parseInt(habit.targetDays),
      createdAt: new Date().toISOString().split('T')[0],
      checkIns: []
    };
    habits.push(newHabit);
    this.save(habits);
    return newHabit;
  },
  
  // Delete habit
  delete(id) {
    const habits = this.getAll().filter(h => h.id !== id);
    this.save(habits);
  },
  
  // Toggle check-in for today
  toggleCheckIn(id) {
    const habits = this.getAll();
    const habit = habits.find(h => h.id === id);
    if (!habit) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const checkInIndex = habit.checkIns.indexOf(today);
    
    if (checkInIndex === -1) {
      // Check in
      habit.checkIns.push(today);
      habit.checkIns.sort();
    } else {
      // Uncheck
      habit.checkIns.splice(checkInIndex, 1);
    }
    
    this.save(habits);
    return habit;
  },
  
  // Generate UUID
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

// Calculate streak and progress
function getHabitStats(habit) {
  const today = new Date().toISOString().split('T')[0];
  const checkIns = habit.checkIns;
  
  // Current streak
  let streak = 0;
  let checkDate = new Date(today);
  
  // Check if checked in today, if not start from yesterday
  if (!checkIns.includes(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (checkIns.includes(checkDate.toISOString().split('T')[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Total days completed
  const completedDays = checkIns.length;
  
  // Progress percentage
  const progress = Math.min((completedDays / habit.targetDays) * 100, 100);
  
  // Is checked in today
  const isCheckedIn = checkIns.includes(today);
  
  return { streak, completedDays, progress, isCheckedIn };
}

// Get random proverb
function getProverb(category) {
  const proverbs = PROVERBS[category] || PROVERBS.learning;
  return proverbs[Math.floor(Math.random() * proverbs.length)];
}

// Create confetti effect
function createConfetti(element) {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  
  const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
  const rect = element.getBoundingClientRect();
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 100}px`;
    confetti.style.top = `${rect.top + rect.height / 2}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    if (Math.random() > 0.5) {
      confetti.style.borderRadius = '50%';
    }
    
    container.appendChild(confetti);
  }
  
  setTimeout(() => container.remove(), 3500);
}

// Show toast
function showToast(habit) {
  const container = document.getElementById('toastContainer');
  const proverb = getProverb(habit.category);
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">${habit.icon}</div>
    <div class="toast-text">${proverb}</div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => toast.remove(), 4000);
}

// Render habits
function renderHabits() {
  const container = document.getElementById('habitsContainer');
  const emptyState = document.getElementById('emptyState');
  const habits = HabitStore.getAll();
  
  if (habits.length === 0) {
    container.innerHTML = '';
    emptyState.classList.add('visible');
    return;
  }
  
  emptyState.classList.remove('visible');
  
  container.innerHTML = habits.map(habit => {
    const stats = getHabitStats(habit);
    const today = new Date().toISOString().split('T')[0];
    const isCheckedInToday = habit.checkIns.includes(today);
    
    return `
      <div class="habit-card" data-id="${habit.id}">
        <div class="habit-card-header">
          <div class="habit-icon">${habit.icon}</div>
          <div class="habit-info">
            <div class="habit-name">${escapeHtml(habit.name)}</div>
            <div class="habit-meta">${habit.category}</div>
          </div>
          <button class="habit-delete" onclick="deleteHabit('${habit.id}')" title="Delete habit">×</button>
        </div>
        
        <div class="habit-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${stats.progress}%"></div>
          </div>
          <div class="progress-text">
            <span class="progress-days">${stats.completedDays} of ${habit.targetDays} days</span>
            ${stats.streak > 0 ? `<span class="streak"><span class="streak-fire">🔥</span> ${stats.streak} day${stats.streak > 1 ? 's' : ''}</span>` : ''}
          </div>
        </div>
        
        <div class="habit-checkin">
          <button class="btn-checkin ${isCheckedInToday ? 'checked' : ''}" 
                  onclick="toggleCheckIn('${habit.id}')"
                  ${isCheckedInToday ? 'disabled' : ''}>
            ${isCheckedInToday ? '✓ Completed Today!' : '✓ Check In'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Toggle check-in
function toggleCheckIn(id) {
  const habit = HabitStore.toggleCheckIn(id);
  if (!habit) return;
  
  const today = new Date().toISOString().split('T')[0];
  const wasCheckedIn = habit.checkIns.includes(today);
  
  // If checked in (not unchecked), show effects
  if (wasCheckedIn) {
    const btn = document.querySelector(`[data-id="${id}"] .btn-checkin`);
    if (btn) {
      btn.classList.add('checked');
      createConfetti(btn);
    }
    showToast(habit);
  }
  
  renderHabits();
}

// Delete habit
function deleteHabit(id) {
  if (confirm('Are you sure you want to delete this habit? This cannot be undone.')) {
    HabitStore.delete(id);
    renderHabits();
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Modal handling
const modalOverlay = document.getElementById('modalOverlay');
const habitForm = document.getElementById('habitForm');
const iconPicker = document.getElementById('iconPicker');

function openModal() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  habitForm.reset();
  // Reset icon selection
  document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
  document.querySelector('.icon-option[data-icon="📖"]').classList.add('selected');
  document.getElementById('habitIcon').value = '📖';
}

// Event listeners for modal
document.getElementById('btnAdd').addEventListener('click', openModal);
document.getElementById('btnAddEmpty').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('btnCancel').addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Icon picker
iconPicker.addEventListener('click', (e) => {
  const option = e.target.closest('.icon-option');
  if (!option) return;
  
  document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
  option.classList.add('selected');
  document.getElementById('habitIcon').value = option.dataset.icon;
});

// Form submission
habitForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const habit = {
    name: document.getElementById('habitName').value.trim(),
    icon: document.getElementById('habitIcon').value,
    category: document.getElementById('habitCategory').value,
    targetDays: document.getElementById('habitDays').value
  };
  
  if (!habit.name || !habit.targetDays) {
    alert('Please fill in all required fields.');
    return;
  }
  
  HabitStore.add(habit);
  closeModal();
  renderHabits();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
    closeModal();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderHabits();
});
