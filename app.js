// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}

// Tab logic (ARIA-friendly)
const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.panel'));

function activateTab(tab) {
  tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
  panels.forEach(p => p.classList.toggle('active', p.id === tab.getAttribute('aria-controls')));
  tab.focus();
  // Persist selected tab
  localStorage.setItem('activeTab', tab.id);
  updateStatusNote();
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(tab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      activateTab(tabs[(i + 1) % tabs.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      activateTab(tabs[(i - 1 + tabs.length) % tabs.length]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      activateTab(tabs[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      activateTab(tabs[tabs.length - 1]);
    }
  });
});

// Restore active tab
const savedTabId = localStorage.getItem('activeTab');
if (savedTabId) {
  const savedTab = document.getElementById(savedTabId);
  if (savedTab) activateTab(savedTab);
} else {
  activateTab(tabs[0]);
}

// Expand/Collapse controls
const expandAllBtn = document.getElementById('expandAll');
const collapseAllBtn = document.getElementById('collapseAll');

expandAllBtn.addEventListener('click', () => {
  const currentPanel = document.querySelector('.panel.active');
  currentPanel.querySelectorAll('details').forEach(d => d.open = true);
});

collapseAllBtn.addEventListener('click', () => {
  const currentPanel = document.querySelector('.panel.active');
  currentPanel.querySelectorAll('details').forEach(d => d.open = false);
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
function applyTheme(mode) {
  document.body.classList.toggle('day', mode === 'day');
  themeToggle.setAttribute('aria-pressed', mode === 'day' ? 'true' : 'false');
  localStorage.setItem('theme', mode);
  updateStatusNote();
}
const savedTheme = localStorage.getItem('theme') || 'night';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const next = document.body.classList.contains('day') ? 'night' : 'day';
  applyTheme(next);
});

// Mark done buttons (persist per item)
const doneKeyPrefix = 'itemDone:';
document.querySelectorAll('.item .btn').forEach((btn, idx) => {
  const itemId = btn.closest('.item').querySelector('.label')?.textContent?.trim() || `item-${idx}`;
  const key = doneKeyPrefix + itemId;

  function setState(done) {
    btn.classList.toggle('done', done);
    btn.textContent = done ? 'Done' : 'Mark done';
    localStorage.setItem(key, done ? '1' : '0');
    updateStatusNote();
  }

  // Initialize from storage
  const saved = localStorage.getItem(key) === '1';
  setState(saved);

  btn.addEventListener('click', () => setState(!btn.classList.contains('done')));
});

// Status note
const statusNote = document.getElementById('statusNote');
function updateStatusNote() {
  const total = document.querySelectorAll('.item .btn').length;
  const done = document.querySelectorAll('.item .btn.done').length;
  const theme = document.body.classList.contains('day') ? 'Day' : 'Night';
  const activeTab = tabs.find(t => t.getAttribute('aria-selected') === 'true')?.textContent || 'Preflight';
  statusNote.textContent = `${theme} theme. ${done}/${total} items done. Viewing: ${activeTab}.`;
}
updateStatusNote();

// Keyboard support for <summary> to improve clarity
document.querySelectorAll('summary').forEach(sum => {
  sum.setAttribute('role', 'button');
  sum.setAttribute('tabindex', '0');
  sum.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      sum.parentElement.open = !sum.parentElement.open;
    }
  });
});
