class CoursesApp {
  constructor() {
    this.currentView = 'catalog';
    this.currentCourse = null;
    this.currentLesson = null;
    this.data = JSON.parse(JSON.stringify(coursesData));
    this.loadState();
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.showCatalog();
  }

  attachEventListeners() {
    document.getElementById('toggleSubscription').addEventListener('click', () => this.toggleSubscription());
    document.getElementById('catalogBtn').addEventListener('click', () => this.showCatalog());
    document.getElementById('toggleTheme').addEventListener('click', () => this.toggleTheme());
  }

  loadState() {
    const savedState = localStorage.getItem('coursesAppState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.data.userSubscription = state.userSubscription;
      this.data.userProgress = state.userProgress;
    }
  }

  saveState() {
    const state = {
      userSubscription: this.data.userSubscription,
      userProgress: this.data.userProgress
    };
    localStorage.setItem('coursesAppState', JSON.stringify(state));
  }

  showCatalog() {
    this.currentView = 'catalog';
    this.currentCourse = null;
    this.currentLesson = null;
    this.render();
  }

  showCourseDetail(courseId) {
    this.currentCourse = this.data.courses.find(c => c.id === courseId);
    if (!this.currentCourse) return;

    this.currentView = 'courseDetail';
    this.currentLesson = null;
    this.render();
  }

  showLessonPlayer(lessonId) {
    if (!this.currentCourse) return;

    for (const module of this.currentCourse.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        this.currentLesson = { ...lesson, moduleId: module.id };
        this.currentView = 'player';
        this.render();
        return;
      }
    }
  }

  canAccessLesson(lesson) {
    if (!lesson.premium) return true;
    return this.data.userSubscription.isPremium;
  }

  completeLesson(lessonId) {
    if (!this.currentCourse) return;

    const lessonKey = `lesson_${this.currentCourse.id}_${lessonId}`;
    this.data.userProgress[lessonKey] = { completed: true, completedAt: new Date().toISOString() };

    for (const module of this.currentCourse.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.completed = true;
        break;
      }
    }

    this.updateCourseProgress();
    this.saveState();
    this.render();
  }

  resumeLastLesson() {
    for (const course of this.data.courses) {
      const lastLesson = this.getLastViewedLesson(course.id);
      if (lastLesson) {
        this.showCourseDetail(course.id);
        return;
      }
    }
  }

  getLastViewedLesson(courseId) {
    for (let i = 1; ; i++) {
      const lessonKey = `lesson_${courseId}_${i}`;
      if (!(lessonKey in this.data.userProgress)) {
        for (let j = i - 1; j >= 0; j--) {
          const checkKey = `lesson_${courseId}_${j}`;
          if (checkKey in this.data.userProgress) {
            return this.data.userProgress[checkKey];
          }
        }
      }
    }
  }

  updateCourseProgress() {
    if (!this.currentCourse) return;

    let totalLessons = 0;
    let completedLessons = 0;

    for (const module of this.currentCourse.modules) {
      for (const lesson of module.lessons) {
        totalLessons++;
        if (lesson.completed) {
          completedLessons++;
        }
      }
    }

    this.currentCourse.progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  }

  toggleSubscription() {
    this.data.userSubscription.isPremium = !this.data.userSubscription.isPremium;
    if (this.data.userSubscription.isPremium) {
      this.data.userSubscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      this.data.userSubscription.expiresAt = null;
    }
    this.saveState();
    this.render();
  }

  toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle('dark-theme');
  }

  render() {
    const content = document.getElementById('appContent');

    if (this.currentView === 'catalog') {
      content.innerHTML = this.renderCatalog();
    } else if (this.currentView === 'courseDetail') {
      content.innerHTML = this.renderCourseDetail();
    } else if (this.currentView === 'player') {
      content.innerHTML = this.renderPlayer();
    }

    this.updateHeader();
    this.attachDynamicListeners();
  }

  updateHeader() {
    const subscriptionStatus = document.getElementById('subscriptionStatus');
    if (this.data.userSubscription.isPremium) {
      subscriptionStatus.innerHTML = '<span class="premium-badge">Premium</span>';
    } else {
      subscriptionStatus.innerHTML = '<span class="free-badge">Free</span>';
    }
  }

  renderCatalog() {
    let html = '<div class="catalog-container">';
    html += '<h2>My Courses</h2>';

    for (const course of this.data.courses) {
      const isPremium = course.premium && !this.data.userSubscription.isPremium;
      html += `
        <div class="course-card ${isPremium ? 'premium-locked' : ''}">
          <div class="course-thumbnail">
            <img src="${course.thumbnail}" alt="${course.title}" />
            ${isPremium ? '<div class="lock-overlay"><span class="lock-icon">🔒</span></div>' : ''}
          </div>
          <div class="course-info">
            <h3>${course.title}</h3>
            <p class="course-instructor">by ${course.instructor}</p>
            <p class="course-description">${course.description}</p>
            <div class="progress-section">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${course.progress}%"></div>
              </div>
              <span class="progress-text">${course.progress}% Complete</span>
            </div>
            ${isPremium ? '<button class="btn btn-premium" disabled>Premium Only</button>' : `<button class="btn btn-primary" data-action="viewCourse" data-courseId="${course.id}">View Course</button>`}
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  renderCourseDetail() {
    if (!this.currentCourse) return '';

    let html = '<div class="course-detail-container">';
    html += `
      <div class="course-header">
        <h2>${this.currentCourse.title}</h2>
        <p class="course-instructor">Instructor: ${this.currentCourse.instructor}</p>
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${this.currentCourse.progress}%"></div>
          </div>
          <span class="progress-text">${this.currentCourse.progress}% Complete</span>
        </div>
      </div>
      <div class="modules-container">
    `;

    for (const module of this.currentCourse.modules) {
      html += `<div class="module">`;
      html += `<h3 class="module-title">${module.title}</h3>`;

      for (const lesson of module.lessons) {
        const isAccessible = this.canAccessLesson(lesson);
        const isCompleted = lesson.completed ? 'completed' : '';

        html += `
          <div class="lesson-item ${isCompleted} ${!isAccessible ? 'locked' : ''}">
            <div class="lesson-left">
              <span class="lesson-status">${lesson.completed ? '✓' : '▶'}</span>
              <div class="lesson-details">
                <p class="lesson-title">${lesson.title}</p>
                <span class="lesson-duration">${lesson.duration} min</span>
              </div>
            </div>
            <div class="lesson-right">
              ${lesson.premium ? '<span class="badge badge-premium">Premium</span>' : ''}
              ${isAccessible ? `<button class="btn btn-small" data-action="playLesson" data-lessonId="${lesson.id}">Play</button>` : '<span class="lock-small">🔒</span>'}
            </div>
          </div>
        `;
      }

      html += `</div>`;
    }

    html += `
      </div>
      <button class="btn btn-secondary" data-action="backToCatalog">Back to Courses</button>
      </div>
    `;

    return html;
  }

  renderPlayer() {
    if (!this.currentLesson) return '';

    const canAccess = this.canAccessLesson(this.currentLesson);

    if (!canAccess) {
      return `
        <div class="player-container">
          <div class="premium-gate">
            <h2>Premium Content</h2>
            <p>This lesson is only available for premium members.</p>
            <p>Upgrade your subscription to access this content.</p>
            <button class="btn btn-primary" data-action="toggleSubscription">Upgrade to Premium</button>
            <button class="btn btn-secondary" data-action="backToCourse">Back</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="player-container">
        <div class="video-player">
          <div class="player-placeholder">
            <div class="play-button">▶</div>
            <p>${this.currentLesson.title}</p>
            <p class="duration">${this.currentLesson.duration} minutes</p>
          </div>
        </div>
        <div class="lesson-info">
          <h2>${this.currentLesson.title}</h2>
          <p class="lesson-duration">Duration: ${this.currentLesson.duration} minutes</p>
          <p class="lesson-progress">
            Status: ${this.currentLesson.completed ? '<span class="status-complete">✓ Completed</span>' : '<span class="status-pending">In Progress</span>'}
          </p>
          ${!this.currentLesson.completed ? `<button class="btn btn-primary" data-action="completeLesson">Mark as Complete</button>` : ''}
          <button class="btn btn-secondary" data-action="backToCourse">Back to Course</button>
        </div>
      </div>
    `;
  }

  attachDynamicListeners() {
    document.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const courseId = e.target.dataset.courseid;
        const lessonId = e.target.dataset.lessonid;

        if (action === 'viewCourse' && courseId) {
          this.showCourseDetail(parseInt(courseId));
        } else if (action === 'playLesson' && lessonId) {
          this.showLessonPlayer(parseInt(lessonId));
        } else if (action === 'completeLesson') {
          this.completeLesson(this.currentLesson.id);
        } else if (action === 'backToCatalog') {
          this.showCatalog();
        } else if (action === 'backToCourse') {
          this.showCourseDetail(this.currentCourse.id);
        } else if (action === 'toggleSubscription') {
          this.toggleSubscription();
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new CoursesApp();
});
