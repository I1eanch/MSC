// Habit Tracker Application
class HabitTracker {
    constructor() {
        this.habits = [];
        this.history = [];
        this.currentTab = 'habits';
        this.editingHabitId = null;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.draggedElement = null;
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderHabits();
        this.renderHistory();
        this.updateStats();
        this.processSyncQueue();
        this.setupOfflineSync();
    }

    // Storage Management
    loadFromStorage() {
        const storedHabits = localStorage.getItem('habits');
        const storedHistory = localStorage.getItem('history');
        const storedQueue = localStorage.getItem('syncQueue');
        
        if (storedHabits) {
            this.habits = JSON.parse(storedHabits);
        } else {
            // Load default habits
            this.loadDefaultHabits();
        }
        
        if (storedHistory) {
            this.history = JSON.parse(storedHistory);
        }
        
        if (storedQueue) {
            this.syncQueue = JSON.parse(storedQueue);
        }
    }

    saveToStorage() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
        localStorage.setItem('history', JSON.stringify(this.history));
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }

    loadDefaultHabits() {
        this.habits = [
            {
                id: this.generateId(),
                name: 'Morning Exercise',
                description: 'Start the day with physical activity',
                category: 'health',
                frequency: 'daily',
                preferredTime: '07:00',
                createdAt: new Date().toISOString(),
                completedDates: [],
                streak: 0,
                order: 0
            },
            {
                id: this.generateId(),
                name: 'Read for 30 minutes',
                description: 'Expand knowledge and vocabulary',
                category: 'learning',
                frequency: 'daily',
                preferredTime: '20:00',
                createdAt: new Date().toISOString(),
                completedDates: [],
                streak: 0,
                order: 1
            },
            {
                id: this.generateId(),
                name: 'Meditation',
                description: 'Practice mindfulness and reduce stress',
                category: 'mindfulness',
                frequency: 'daily',
                preferredTime: '06:30',
                createdAt: new Date().toISOString(),
                completedDates: [],
                streak: 0,
                order: 2
            }
        ];
        this.saveToStorage();
    }

    // Event Listeners
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.closest('.tab-btn').dataset.tab));
        });

        // Add habit button
        document.getElementById('addHabitBtn').addEventListener('click', () => this.showAddHabitModal());

        // Habit form
        document.getElementById('habitForm').addEventListener('submit', (e) => this.handleHabitSubmit(e));

        // History filter
        document.getElementById('historyFilter').addEventListener('change', () => this.renderHistory());

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });

        // Online/Offline events
        window.addEventListener('online', () => this.handleOnlineStatusChange(true));
        window.addEventListener('offline', () => this.handleOnlineStatusChange(false));

        // Drag and drop for habit reordering
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const habitsList = document.getElementById('habitsList');
        
        habitsList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('habit-item')) {
                this.draggedElement = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        habitsList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('habit-item')) {
                e.target.classList.remove('dragging');
                this.draggedElement = null;
            }
        });

        habitsList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(habitsList, e.clientY);
            if (afterElement == null) {
                habitsList.appendChild(this.draggedElement);
            } else {
                habitsList.insertBefore(this.draggedElement, afterElement);
            }
        });

        habitsList.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateHabitOrder();
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.habit-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateHabitOrder() {
        const habitElements = document.querySelectorAll('.habit-item');
        const newOrder = [];
        
        habitElements.forEach((element, index) => {
            const habitId = element.dataset.habitId;
            const habit = this.habits.find(h => h.id === habitId);
            if (habit) {
                habit.order = index;
                newOrder.push(habit);
            }
        });
        
        this.habits.sort((a, b) => a.order - b.order);
        this.saveToStorage();
        this.addToSyncQueue('reorder', { habits: this.habits });
    }

    // Tab Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Refresh content when switching tabs
        if (tabName === 'history') {
            this.renderHistory();
        } else if (tabName === 'stats') {
            this.updateStats();
        }
    }

    // Modal Management
    showAddHabitModal() {
        this.editingHabitId = null;
        document.getElementById('modalTitle').textContent = 'Add New Habit';
        document.getElementById('habitForm').reset();
        document.getElementById('habitModal').classList.add('active');
    }

    showEditHabitModal(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        this.editingHabitId = habitId;
        document.getElementById('modalTitle').textContent = 'Edit Habit';
        document.getElementById('habitName').value = habit.name;
        document.getElementById('habitDescription').value = habit.description || '';
        document.getElementById('habitCategory').value = habit.category;
        document.getElementById('habitFrequency').value = habit.frequency;
        document.getElementById('habitTime').value = habit.preferredTime || '';
        document.getElementById('habitModal').classList.add('active');
    }

    closeHabitModal() {
        document.getElementById('habitModal').classList.remove('active');
        this.editingHabitId = null;
    }

    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').classList.add('active');
        
        const confirmBtn = document.getElementById('confirmBtn');
        confirmBtn.onclick = () => {
            onConfirm();
            this.closeConfirmModal();
        };
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('active');
    }

    closeModals() {
        this.closeHabitModal();
        this.closeConfirmModal();
    }

    // Habit Management
    handleHabitSubmit(e) {
        e.preventDefault();
        
        const habitData = {
            name: document.getElementById('habitName').value,
            description: document.getElementById('habitDescription').value,
            category: document.getElementById('habitCategory').value,
            frequency: document.getElementById('habitFrequency').value,
            preferredTime: document.getElementById('habitTime').value
        };

        if (this.editingHabitId) {
            this.updateHabit(this.editingHabitId, habitData);
        } else {
            this.addHabit(habitData);
        }

        this.closeHabitModal();
    }

    addHabit(habitData) {
        const newHabit = {
            id: this.generateId(),
            ...habitData,
            createdAt: new Date().toISOString(),
            completedDates: [],
            streak: 0,
            order: this.habits.length
        };

        // Optimistic update
        this.habits.push(newHabit);
        this.saveToStorage();
        this.renderHabits();
        this.showToast('Habit added successfully!', 'success');

        // Add to sync queue
        this.addToSyncQueue('add', { habit: newHabit });
    }

    updateHabit(habitId, habitData) {
        const habitIndex = this.habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;

        // Optimistic update
        const oldHabit = { ...this.habits[habitIndex] };
        this.habits[habitIndex] = {
            ...this.habits[habitIndex],
            ...habitData,
            updatedAt: new Date().toISOString()
        };

        this.saveToStorage();
        this.renderHabits();
        this.showToast('Habit updated successfully!', 'success');

        // Add to sync queue
        this.addToSyncQueue('update', { 
            habitId, 
            habitData: this.habits[habitIndex],
            oldHabit 
        });
    }

    deleteHabit(habitId) {
        this.showConfirmModal(
            'Delete Habit',
            'Are you sure you want to delete this habit? This action cannot be undone.',
            () => {
                const habitIndex = this.habits.findIndex(h => h.id === habitId);
                if (habitIndex === -1) return;

                // Optimistic update
                const deletedHabit = this.habits[habitIndex];
                this.habits.splice(habitIndex, 1);
                
                this.saveToStorage();
                this.renderHabits();
                this.showToast('Habit deleted successfully!', 'success');

                // Add to sync queue
                this.addToSyncQueue('delete', { habit: deletedHabit });
            }
        );
    }

    toggleHabitCompletion(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toDateString();
        const isCompleted = habit.completedDates.includes(today);

        if (isCompleted) {
            // Uncomplete
            habit.completedDates = habit.completedDates.filter(date => date !== today);
            this.showToast('Habit marked as incomplete', 'warning');
        } else {
            // Complete
            habit.completedDates.push(today);
            this.animateCompletion(habitId);
            this.showToast('Great job! Habit completed!', 'success');
            
            // Add to history
            this.addToHistory(habitId, 'completed');
        }

        // Update streak
        this.updateHabitStreak(habit);
        
        this.saveToStorage();
        this.renderHabits();
        this.updateStats();

        // Add to sync queue
        this.addToSyncQueue('toggle', { 
            habitId, 
            date: today, 
            completed: !isCompleted 
        });
    }

    updateHabitStreak(habit) {
        const sortedDates = habit.completedDates.sort((a, b) => new Date(b) - new Date(a));
        let streak = 0;
        let currentDate = new Date();
        
        for (let i = 0; i < sortedDates.length; i++) {
            const habitDate = new Date(sortedDates[i]);
            const daysDiff = Math.floor((currentDate - habitDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
                currentDate = new Date(habitDate);
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        habit.streak = streak;
    }

    // History Management
    addToHistory(habitId, action) {
        const historyItem = {
            id: this.generateId(),
            habitId,
            action,
            timestamp: new Date().toISOString()
        };
        
        this.history.unshift(historyItem);
        this.saveToStorage();
    }

    // Rendering
    renderHabits() {
        const habitsList = document.getElementById('habitsList');
        const emptyState = document.getElementById('emptyState');
        
        if (this.habits.length === 0) {
            habitsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        habitsList.style.display = 'block';
        emptyState.style.display = 'none';
        
        // Sort habits by order
        const sortedHabits = [...this.habits].sort((a, b) => a.order - b.order);
        
        habitsList.innerHTML = sortedHabits.map(habit => {
            const today = new Date().toDateString();
            const isCompleted = habit.completedDates.includes(today);
            const categoryIcon = this.getCategoryIcon(habit.category);
            
            return `
                <div class="habit-item ${isCompleted ? 'completed' : ''}" 
                     data-habit-id="${habit.id}" 
                     draggable="true">
                    <div class="habit-header">
                        <div class="habit-info">
                            <div class="habit-name">
                                <i class="${categoryIcon}"></i>
                                ${habit.name}
                            </div>
                            ${habit.description ? `<div class="habit-description">${habit.description}</div>` : ''}
                            <div class="habit-meta">
                                <span class="habit-category">${this.formatCategory(habit.category)}</span>
                                ${habit.preferredTime ? `<span class="habit-time"><i class="fas fa-clock"></i> ${habit.preferredTime}</span>` : ''}
                            </div>
                        </div>
                        <div class="habit-actions">
                            <button class="complete-btn" onclick="habitTracker.toggleHabitCompletion('${habit.id}')" title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
                                <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-circle'}"></i>
                            </button>
                            <button onclick="habitTracker.showEditHabitModal('${habit.id}')" title="Edit habit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="habitTracker.deleteHabit('${habit.id}')" title="Delete habit">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${habit.streak > 0 ? `
                        <div class="habit-streak">
                            <i class="fas fa-fire"></i>
                            ${habit.streak} day streak
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        const filterDays = parseInt(document.getElementById('historyFilter').value);
        
        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - filterDays);
        
        const filteredHistory = this.history.filter(item => 
            new Date(item.timestamp) >= filterDate
        );
        
        // Group by date
        const groupedHistory = {};
        filteredHistory.forEach(item => {
            const date = new Date(item.timestamp).toDateString();
            if (!groupedHistory[date]) {
                groupedHistory[date] = [];
            }
            groupedHistory[date].push(item);
        });
        
        if (Object.keys(groupedHistory).length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No history found for the selected period</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = Object.entries(groupedHistory)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .map(([date, items]) => {
                const dateObj = new Date(date);
                const formattedDate = this.formatDate(dateObj);
                
                return `
                    <div class="history-date-group">
                        <div class="history-date">${formattedDate}</div>
                        ${items.map(item => {
                            const habit = this.habits.find(h => h.id === item.habitId);
                            if (!habit) return '';
                            
                            const time = new Date(item.timestamp).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            });
                            
                            return `
                                <div class="history-item">
                                    <div class="history-item-info">
                                        <div class="history-item-icon">
                                            <i class="${this.getCategoryIcon(habit.category)}"></i>
                                        </div>
                                        <div class="history-item-details">
                                            <div class="history-item-name">${habit.name}</div>
                                            <div class="history-item-time">${time}</div>
                                        </div>
                                    </div>
                                    <div class="history-item-action">
                                        ${item.action === 'completed' ? 
                                            '<i class="fas fa-check-circle" style="color: #28a745;"></i>' : 
                                            '<i class="fas fa-info-circle" style="color: #6c757d;"></i>'
                                        }
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }).join('');
    }

    updateStats() {
        // Calculate stats
        let totalCompleted = 0;
        let currentStreak = 0;
        let bestStreak = 0;
        
        this.habits.forEach(habit => {
            totalCompleted += habit.completedDates.length;
            currentStreak += habit.streak;
            bestStreak = Math.max(bestStreak, habit.streak);
        });
        
        // Calculate completion rate
        const totalPossible = this.habits.length * 30; // Last 30 days
        const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        
        // Update DOM
        document.getElementById('currentStreak').textContent = currentStreak;
        document.getElementById('bestStreak').textContent = bestStreak;
        document.getElementById('totalCompleted').textContent = totalCompleted;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
        
        // Update habit progress
        this.renderHabitProgress();
    }

    renderHabitProgress() {
        const progressList = document.getElementById('habitProgressList');
        
        if (this.habits.length === 0) {
            progressList.innerHTML = '<p style="text-align: center; color: #6c757d;">No habits to track</p>';
            return;
        }
        
        progressList.innerHTML = this.habits.map(habit => {
            const last30Days = 30;
            const completedInLast30Days = habit.completedDates.filter(date => {
                const habitDate = new Date(date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - last30Days);
                return habitDate >= thirtyDaysAgo;
            }).length;
            
            const percentage = Math.round((completedInLast30Days / last30Days) * 100);
            
            return `
                <div class="habit-progress-item">
                    <div class="habit-progress-header">
                        <div class="habit-progress-name">${habit.name}</div>
                        <div class="habit-progress-percentage">${percentage}%</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Animations
    animateCompletion(habitId) {
        const habitElement = document.querySelector(`[data-habit-id="${habitId}"]`);
        if (habitElement) {
            habitElement.classList.add('completing');
            setTimeout(() => {
                habitElement.classList.remove('completing');
            }, 300);
        }
    }

    // Sync and Offline Management
    addToSyncQueue(action, data) {
        const queueItem = {
            id: this.generateId(),
            action,
            data,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };
        
        this.syncQueue.push(queueItem);
        this.saveToStorage();
        
        if (this.isOnline) {
            this.processSyncQueue();
        }
    }

    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;
        
        this.updateSyncStatus('syncing');
        
        // Process queue items one by one
        for (let i = 0; i < this.syncQueue.length; i++) {
            const queueItem = this.syncQueue[i];
            
            try {
                await this.syncWithServer(queueItem);
                // Remove successfully synced item
                this.syncQueue.splice(i, 1);
                i--; // Adjust index after removal
            } catch (error) {
                console.error('Sync failed for item:', queueItem, error);
                queueItem.retryCount++;
                
                // Remove item if it has failed too many times
                if (queueItem.retryCount >= 3) {
                    this.syncQueue.splice(i, 1);
                    i--;
                    this.showToast('Failed to sync some changes. Please check your connection.', 'error');
                }
            }
        }
        
        this.saveToStorage();
        this.updateSyncStatus(this.syncQueue.length > 0 ? 'partial' : 'synced');
    }

    async syncWithServer(queueItem) {
        // Simulate server sync with delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    console.log('Synced successfully:', queueItem);
                    resolve();
                } else {
                    reject(new Error('Network error'));
                }
            }, 1000);
        });
    }

    setupOfflineSync() {
        // Attempt to sync every 30 seconds when online
        setInterval(() => {
            if (this.isOnline && this.syncQueue.length > 0) {
                this.processSyncQueue();
            }
        }, 30000);
    }

    handleOnlineStatusChange(isOnline) {
        this.isOnline = isOnline;
        this.updateSyncStatus(isOnline ? 'synced' : 'offline');
        
        if (isOnline && this.syncQueue.length > 0) {
            this.processSyncQueue();
        }
    }

    updateSyncStatus(status) {
        const syncIcon = document.getElementById('syncIcon');
        const syncStatus = document.getElementById('syncStatus');
        const syncStatusElement = document.querySelector('.sync-status');
        
        syncStatusElement.className = 'sync-status';
        
        switch (status) {
            case 'syncing':
                syncStatusElement.classList.add('syncing');
                syncIcon.className = 'fas fa-wifi';
                syncStatus.textContent = 'Syncing...';
                break;
            case 'synced':
                syncIcon.className = 'fas fa-wifi';
                syncStatus.textContent = 'Synced';
                break;
            case 'partial':
                syncIcon.className = 'fas fa-exclamation-triangle';
                syncStatus.textContent = 'Partial sync';
                break;
            case 'offline':
                syncStatusElement.classList.add('offline');
                syncIcon.className = 'fas fa-wifi';
                syncStatus.textContent = 'Offline';
                break;
        }
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCategoryIcon(category) {
        const icons = {
            health: 'fas fa-heartbeat',
            productivity: 'fas fa-rocket',
            mindfulness: 'fas fa-spa',
            learning: 'fas fa-book',
            social: 'fas fa-users',
            other: 'fas fa-star'
        };
        return icons[category] || icons.other;
    }

    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
    }

    formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toast.className = `toast ${type}`;
        toastMessage.textContent = message;
        
        // Update icon based on type
        const icon = toast.querySelector('i');
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                break;
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application
let habitTracker;
document.addEventListener('DOMContentLoaded', () => {
    habitTracker = new HabitTracker();
});

// Add service worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // In a real app, you would register a service worker here
        // navigator.serviceWorker.register('/sw.js');
    });
}