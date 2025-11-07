class ProfileManager {
    constructor() {
        this.goals = this.loadFromStorage('goals') || [];
        this.photos = this.loadFromStorage('photos') || [];
        this.settings = this.loadFromStorage('settings') || this.getDefaultSettings();
        this.charts = {};
        
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupGoals();
        this.setupPhotos();
        this.setupCharts();
        this.setupSettings();
        this.renderGoals();
        this.renderPhotos();
        this.loadSettings();
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');

                if (tabName === 'charts') {
                    this.updateCharts();
                }
            });
        });
    }

    setupGoals() {
        const addGoalBtn = document.getElementById('add-goal-btn');
        const cancelGoalBtn = document.getElementById('cancel-goal-btn');
        const saveGoalBtn = document.getElementById('save-goal-btn');
        const goalForm = document.getElementById('goal-form');

        addGoalBtn.addEventListener('click', () => {
            goalForm.classList.remove('hidden');
            this.clearGoalForm();
        });

        cancelGoalBtn.addEventListener('click', () => {
            goalForm.classList.add('hidden');
            this.clearGoalForm();
        });

        saveGoalBtn.addEventListener('click', () => {
            this.saveGoal();
        });
    }

    clearGoalForm() {
        document.getElementById('goal-title').value = '';
        document.getElementById('goal-target').value = '';
        document.getElementById('goal-unit').value = '';
        document.getElementById('goal-date').value = '';
    }

    saveGoal() {
        const title = document.getElementById('goal-title').value.trim();
        const target = parseFloat(document.getElementById('goal-target').value);
        const unit = document.getElementById('goal-unit').value.trim();
        const date = document.getElementById('goal-date').value;

        if (!title || !target || !unit || !date) {
            this.showToast('Please fill all fields', 'error');
            return;
        }

        const goal = {
            id: Date.now(),
            title,
            target,
            current: 0,
            unit,
            date,
            createdAt: new Date().toISOString()
        };

        this.goals.push(goal);
        this.saveToStorage('goals', this.goals);
        this.renderGoals();
        document.getElementById('goal-form').classList.add('hidden');
        this.clearGoalForm();
        this.showToast('Goal added successfully', 'success');
    }

    renderGoals() {
        const goalsList = document.getElementById('goals-list');
        
        if (this.goals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <div class="empty-state-text">No goals yet</div>
                    <div class="empty-state-subtext">Start by adding your first goal</div>
                </div>
            `;
            return;
        }

        goalsList.innerHTML = this.goals.map(goal => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const daysLeft = this.getDaysUntil(goal.date);
            
            return `
                <div class="goal-card" data-goal-id="${goal.id}">
                    <div class="goal-header">
                        <div class="goal-title">${goal.title}</div>
                        <div class="goal-actions">
                            <button class="icon-btn update" onclick="profileManager.updateGoalProgress(${goal.id})">📊</button>
                            <button class="icon-btn delete" onclick="profileManager.deleteGoal(${goal.id})">🗑️</button>
                        </div>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-info">
                            <span>${goal.current} / ${goal.target} ${goal.unit}</span>
                            <span>${progress.toFixed(0)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="goal-date">${daysLeft}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateGoalProgress(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const newValue = prompt(`Update progress for "${goal.title}"\nCurrent: ${goal.current} ${goal.unit}\nEnter new value:`, goal.current);
        
        if (newValue !== null && !isNaN(newValue)) {
            goal.current = parseFloat(newValue);
            this.saveToStorage('goals', this.goals);
            this.renderGoals();
            this.showToast('Progress updated', 'success');
        }
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            this.saveToStorage('goals', this.goals);
            this.renderGoals();
            this.showToast('Goal deleted', 'success');
        }
    }

    getDaysUntil(dateString) {
        const targetDate = new Date(dateString);
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `Overdue by ${Math.abs(diffDays)} days`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return '1 day left';
        } else {
            return `${diffDays} days left`;
        }
    }

    setupPhotos() {
        const addPhotoBtn = document.getElementById('add-photo-btn');
        const cancelPhotoBtn = document.getElementById('cancel-photo-btn');
        const savePhotoBtn = document.getElementById('save-photo-btn');
        const photoInput = document.getElementById('photo-input');
        const modal = document.getElementById('photo-upload-modal');

        addPhotoBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            this.clearPhotoForm();
        });

        cancelPhotoBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            this.clearPhotoForm();
        });

        photoInput.addEventListener('change', (e) => {
            this.previewPhoto(e.target.files[0]);
        });

        savePhotoBtn.addEventListener('click', () => {
            this.savePhoto();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                this.clearPhotoForm();
            }
        });
    }

    clearPhotoForm() {
        document.getElementById('photo-input').value = '';
        document.getElementById('photo-date').value = '';
        document.getElementById('photo-notes').value = '';
        document.getElementById('photo-preview').innerHTML = '';
        document.querySelector('input[name="photo-type"][value="before"]').checked = true;
    }

    previewPhoto(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }

    savePhoto() {
        const fileInput = document.getElementById('photo-input');
        const photoDate = document.getElementById('photo-date').value;
        const photoNotes = document.getElementById('photo-notes').value;
        const photoType = document.querySelector('input[name="photo-type"]:checked').value;

        if (!fileInput.files[0] || !photoDate) {
            this.showToast('Please select a photo and date', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const photo = {
                id: Date.now(),
                type: photoType,
                date: photoDate,
                notes: photoNotes,
                dataUrl: e.target.result,
                createdAt: new Date().toISOString()
            };

            this.photos.push(photo);
            this.saveToStorage('photos', this.photos);
            this.renderPhotos();
            document.getElementById('photo-upload-modal').classList.add('hidden');
            this.clearPhotoForm();
            this.showToast('Photo uploaded successfully', 'success');
        };
        reader.readAsDataURL(fileInput.files[0]);
    }

    renderPhotos() {
        const gallery = document.getElementById('photo-gallery');
        
        if (this.photos.length === 0) {
            gallery.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">📸</div>
                    <div class="empty-state-text">No photos yet</div>
                    <div class="empty-state-subtext">Add your first before/after photo</div>
                </div>
            `;
            return;
        }

        const sortedPhotos = [...this.photos].sort((a, b) => new Date(b.date) - new Date(a.date));

        gallery.innerHTML = sortedPhotos.map(photo => `
            <div class="photo-card" onclick="profileManager.viewPhoto(${photo.id})">
                <img src="${photo.dataUrl}" alt="${photo.type} photo">
                <span class="photo-badge ${photo.type}">${photo.type}</span>
                <span class="photo-date-badge">${this.formatDate(photo.date)}</span>
            </div>
        `).join('');
    }

    viewPhoto(photoId) {
        const photo = this.photos.find(p => p.id === photoId);
        if (!photo) return;

        const deleteConfirm = confirm(`Photo Details:\n\nType: ${photo.type}\nDate: ${this.formatDate(photo.date)}\nNotes: ${photo.notes || 'None'}\n\nDelete this photo?`);
        
        if (deleteConfirm) {
            this.photos = this.photos.filter(p => p.id !== photoId);
            this.saveToStorage('photos', this.photos);
            this.renderPhotos();
            this.showToast('Photo deleted', 'success');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    setupCharts() {
        this.initWeightChart();
        this.initWorkoutChart();
        this.initCompletionChart();

        document.getElementById('chart-timeframe').addEventListener('change', () => {
            this.updateCharts();
        });
    }

    initWeightChart() {
        const ctx = document.getElementById('weight-chart').getContext('2d');
        const data = this.generateWeightData();
        
        this.charts.weight = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Weight',
                    data: data.values,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    initWorkoutChart() {
        const ctx = document.getElementById('workout-chart').getContext('2d');
        const data = this.generateWorkoutData();
        
        this.charts.workout = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Workouts',
                    data: data.values,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    initCompletionChart() {
        const ctx = document.getElementById('completion-chart').getContext('2d');
        const completionRate = this.calculateCompletionRate();
        
        this.charts.completion = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Not Started'],
                datasets: [{
                    data: [completionRate.completed, completionRate.inProgress, completionRate.notStarted],
                    backgroundColor: ['#10b981', '#6366f1', '#e2e8f0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts() {
        const timeframe = parseInt(document.getElementById('chart-timeframe').value);
        
        const weightData = this.generateWeightData(timeframe);
        this.charts.weight.data.labels = weightData.labels;
        this.charts.weight.data.datasets[0].data = weightData.values;
        this.charts.weight.update();

        const workoutData = this.generateWorkoutData(timeframe);
        this.charts.workout.data.labels = workoutData.labels;
        this.charts.workout.data.datasets[0].data = workoutData.values;
        this.charts.workout.update();

        const completionRate = this.calculateCompletionRate();
        this.charts.completion.data.datasets[0].data = [
            completionRate.completed,
            completionRate.inProgress,
            completionRate.notStarted
        ];
        this.charts.completion.update();
    }

    generateWeightData(days = 30) {
        const labels = [];
        const values = [];
        const startWeight = 180;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const randomVariation = (Math.random() - 0.5) * 2;
            const trend = -0.1 * (days - i);
            values.push(parseFloat((startWeight + trend + randomVariation).toFixed(1)));
        }
        
        return { labels, values };
    }

    generateWorkoutData(days = 30) {
        const labels = [];
        const values = [];
        
        const daysToShow = Math.min(days, 7);
        
        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            values.push(Math.floor(Math.random() * 3));
        }
        
        return { labels, values };
    }

    calculateCompletionRate() {
        if (this.goals.length === 0) {
            return { completed: 0, inProgress: 0, notStarted: 1 };
        }

        let completed = 0;
        let inProgress = 0;
        let notStarted = 0;

        this.goals.forEach(goal => {
            const progress = (goal.current / goal.target) * 100;
            if (progress >= 100) {
                completed++;
            } else if (progress > 0) {
                inProgress++;
            } else {
                notStarted++;
            }
        });

        return { completed, inProgress, notStarted };
    }

    setupSettings() {
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('clear-data-btn').addEventListener('click', () => {
            this.clearAllData();
        });

        const settingInputs = ['user-name', 'user-email', 'user-weight', 'weight-unit', 
                               'notify-daily', 'notify-milestones', 'notify-weekly', 'notify-motivation',
                               'theme-select', 'language-select'];
        
        settingInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.autoSaveSettings();
                });
            }
        });
    }

    getDefaultSettings() {
        return {
            userName: '',
            userEmail: '',
            userWeight: '',
            weightUnit: 'kg',
            notifications: {
                daily: false,
                milestones: true,
                weekly: false,
                motivation: false
            },
            theme: 'light',
            language: 'en'
        };
    }

    loadSettings() {
        document.getElementById('user-name').value = this.settings.userName || '';
        document.getElementById('user-email').value = this.settings.userEmail || '';
        document.getElementById('user-weight').value = this.settings.userWeight || '';
        document.getElementById('weight-unit').value = this.settings.weightUnit || 'kg';
        
        document.getElementById('notify-daily').checked = this.settings.notifications.daily;
        document.getElementById('notify-milestones').checked = this.settings.notifications.milestones;
        document.getElementById('notify-weekly').checked = this.settings.notifications.weekly;
        document.getElementById('notify-motivation').checked = this.settings.notifications.motivation;
        
        document.getElementById('theme-select').value = this.settings.theme || 'light';
        document.getElementById('language-select').value = this.settings.language || 'en';
    }

    autoSaveSettings() {
        this.settings = {
            userName: document.getElementById('user-name').value,
            userEmail: document.getElementById('user-email').value,
            userWeight: document.getElementById('user-weight').value,
            weightUnit: document.getElementById('weight-unit').value,
            notifications: {
                daily: document.getElementById('notify-daily').checked,
                milestones: document.getElementById('notify-milestones').checked,
                weekly: document.getElementById('notify-weekly').checked,
                motivation: document.getElementById('notify-motivation').checked
            },
            theme: document.getElementById('theme-select').value,
            language: document.getElementById('language-select').value
        };
        
        this.saveToStorage('settings', this.settings);
    }

    saveSettings() {
        this.autoSaveSettings();
        this.showToast('Settings saved successfully', 'success');
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            if (confirm('This will delete all goals, photos, and settings. Continue?')) {
                localStorage.clear();
                this.goals = [];
                this.photos = [];
                this.settings = this.getDefaultSettings();
                this.renderGoals();
                this.renderPhotos();
                this.loadSettings();
                this.updateCharts();
                this.showToast('All data cleared', 'success');
            }
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Error loading ${key} from storage:`, e);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving ${key} to storage:`, e);
            this.showToast('Failed to save data', 'error');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

let profileManager;

document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});
