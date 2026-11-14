/**
 * FocusFlow Todo - Application Logic
 * Pure Vanilla JavaScript (ES6+)
 */

(() => {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    TODOS: 'focusflow_todos',
    THEME: 'focusflow_theme'
  };

  // Application State
  const state = {
    todos: [],
    filter: 'all', // 'all' | 'active' | 'completed'
    editingId: null
  };

  // DOM Elements
  const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    todoForm: document.getElementById('todo-form'),
    todoInput: document.getElementById('todo-input'),
    todoList: document.getElementById('todo-list'),
    emptyState: document.getElementById('empty-state'),
    filterTabs: document.querySelectorAll('.tab-btn'),
    clearCompletedBtn: document.getElementById('clear-completed-btn'),
    itemsLeft: document.getElementById('items-left'),
    countAll: document.getElementById('count-all'),
    countActive: document.getElementById('count-active'),
    countCompleted: document.getElementById('count-completed')
  };

  /**
   * Initialize Application
   */
  function init() {
    initTheme();
    loadTodos();
    setupEventListeners();
    render();
  }

  /**
   * Theme Management (Light / Dark)
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for OS theme changes if user hasn't explicitly set one
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
  }

  /**
   * Data Storage Management
   */
  function loadTodos() {
    try {
      const rawData = localStorage.getItem(STORAGE_KEYS.TODOS);
      state.todos = rawData ? JSON.parse(rawData) : getDefaultTodos();
    } catch (err) {
      console.warn('Failed to parse todos from localStorage, resetting to defaults.', err);
      state.todos = getDefaultTodos();
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(state.todos));
    } catch (err) {
      console.error('Failed to save todos to localStorage.', err);
    }
  }

  function getDefaultTodos() {
    return [
      {
        id: 'sample-1',
        text: 'Chào mừng bạn đến với FocusFlow! 🎉',
        completed: true,
        createdAt: Date.now() - 60000
      },
      {
        id: 'sample-2',
        text: 'Nhấn đúp chuột vào công việc này để thử tính năng sửa nhanh',
        completed: false,
        createdAt: Date.now() - 30000
      },
      {
        id: 'sample-3',
        text: 'Thử chuyển đổi giao diện Sáng / Tối ở góc trên bên phải',
        completed: false,
        createdAt: Date.now()
      }
    ];
  }

  /**
   * Todo Operations
   */
  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTodo = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      text: trimmed,
      completed: false,
      createdAt: Date.now()
    };

    state.todos.unshift(newTodo);
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const item = state.todos.find(t => t.id === id);
    if (!item) return;

    item.completed = !item.completed;
    saveTodos();
    render();
  }

  function deleteTodo(id) {
    state.todos = state.todos.filter(t => t.id !== id);
    saveTodos();
    render();
  }

  function updateTodoText(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) {
      deleteTodo(id);
      return;
    }

    const item = state.todos.find(t => t.id === id);
    if (item) {
      item.text = trimmed;
      saveTodos();
    }
    state.editingId = null;
    render();
  }

  function clearCompleted() {
    const initialCount = state.todos.length;
    state.todos = state.todos.filter(t => !t.completed);
    if (state.todos.length !== initialCount) {
      saveTodos();
      render();
    }
  }

  function setFilter(filter) {
    state.filter = filter;
    elements.filterTabs.forEach(tab => {
      const isTarget = tab.dataset.filter === filter;
      tab.classList.toggle('active', isTarget);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    render();
  }

  /**
   * Inline Edit Trigger
   */
  function startEditing(id, textContainer) {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    state.editingId = id;

    // Create edit input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = todo.text;
    input.maxLength = 200;
    input.setAttribute('aria-label', 'Sửa tên công việc');

    let finished = false;
    const finish = (save) => {
      if (finished) return;
      finished = true;
      if (save) {
        updateTodoText(id, input.value);
      } else {
        state.editingId = null;
        render();
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finish(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        finish(false);
      }
    });

    input.addEventListener('blur', () => {
      finish(true);
    });

    // Replace text element with input
    textContainer.replaceWith(input);
    input.focus();
    input.select();
  }

  /**
   * Event Handlers Setup
   */
  function setupEventListeners() {
    // Form Submit
    elements.todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTodo(elements.todoInput.value);
      elements.todoInput.value = '';
    });

    // Theme Toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Filter Buttons
    elements.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        setFilter(tab.dataset.filter);
      });
    });

    // Clear Completed
    elements.clearCompletedBtn.addEventListener('click', () => {
      clearCompleted();
    });

    // Event Delegation on Todo List
    elements.todoList.addEventListener('change', (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        const itemEl = e.target.closest('.todo-item');
        if (itemEl && itemEl.dataset.id) {
          toggleTodo(itemEl.dataset.id);
        }
      }
    });

    elements.todoList.addEventListener('click', (e) => {
      // Delete Button
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        const itemEl = deleteBtn.closest('.todo-item');
        if (itemEl && itemEl.dataset.id) {
          deleteTodo(itemEl.dataset.id);
        }
        return;
      }

      // Checkbox container click
      const checkboxContainer = e.target.closest('.checkbox-container');
      if (checkboxContainer) {
        return; // Handled by change event
      }
    });

    // Double click to edit
    elements.todoList.addEventListener('dblclick', (e) => {
      const textEl = e.target.closest('.task-content');
      if (textEl) {
        const itemEl = textEl.closest('.todo-item');
        if (itemEl && itemEl.dataset.id) {
          startEditing(itemEl.dataset.id, textEl);
        }
      }
    });
  }

  /**
   * Rendering UI
   */
  function render() {
    // Compute Counts
    const totalCount = state.todos.length;
    const activeCount = state.todos.filter(t => !t.completed).length;
    const completedCount = totalCount - activeCount;

    // Update Badges & Counters
    elements.countAll.textContent = totalCount;
    elements.countActive.textContent = activeCount;
    elements.countCompleted.textContent = completedCount;
    elements.itemsLeft.textContent = `${activeCount} việc còn lại`;

    // Clear completed button state
    elements.clearCompletedBtn.style.visibility = completedCount > 0 ? 'visible' : 'hidden';

    // Filter Todos for display
    let visibleTodos = state.todos;
    if (state.filter === 'active') {
      visibleTodos = state.todos.filter(t => !t.completed);
    } else if (state.filter === 'completed') {
      visibleTodos = state.todos.filter(t => t.completed);
    }

    // Toggle Empty State
    if (visibleTodos.length === 0) {
      elements.emptyState.classList.remove('hidden');
      elements.todoList.innerHTML = '';
      return;
    } else {
      elements.emptyState.classList.add('hidden');
    }

    // Render List Items cleanly using DocumentFragment
    const fragment = document.createDocumentFragment();

    visibleTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.dataset.id = todo.id;

      // Checkbox Container
      const checkLabel = document.createElement('label');
      checkLabel.className = 'checkbox-container';
      checkLabel.setAttribute('aria-label', `Đánh dấu ${todo.text} là ${todo.completed ? 'chưa hoàn thành' : 'đã hoàn thành'}`);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;

      const customCheck = document.createElement('span');
      customCheck.className = 'custom-checkbox';
      customCheck.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      checkLabel.appendChild(checkbox);
      checkLabel.appendChild(customCheck);
      li.appendChild(checkLabel);

      // Task Text
      const textSpan = document.createElement('span');
      textSpan.className = 'task-content';
      textSpan.textContent = todo.text;
      textSpan.title = 'Nhấn đúp chuột để chỉnh sửa';
      li.appendChild(textSpan);

      // Delete Button
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-delete';
      delBtn.title = 'Xoá việc này';
      delBtn.setAttribute('aria-label', `Xoá công việc: ${todo.text}`);
      delBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      `;
      li.appendChild(delBtn);

      fragment.appendChild(li);
    });

    elements.todoList.innerHTML = '';
    elements.todoList.appendChild(fragment);
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
