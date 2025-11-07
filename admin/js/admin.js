// Admin Content Management System
class AdminCMS {
    constructor() {
        this.articles = [];
        this.categories = [];
        this.media = [];
        this.auditLog = [];
        this.currentUser = 'Admin User';
        this.editor = null;
        this.currentEditingArticle = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.initTipTapEditor();
        this.bindEvents();
        this.renderDashboard();
        this.renderArticles();
        this.renderCategories();
        this.renderMedia();
        this.renderAuditLog();
    }

    // Data Management
    loadData() {
        const savedArticles = localStorage.getItem('cms_articles');
        const savedCategories = localStorage.getItem('cms_categories');
        const savedMedia = localStorage.getItem('cms_media');
        const savedAuditLog = localStorage.getItem('cms_audit_log');

        if (savedArticles) {
            this.articles = JSON.parse(savedArticles);
        } else {
            // Initialize with sample data
            this.articles = [
                {
                    id: 1,
                    title: 'Welcome to the Admin Panel',
                    slug: 'welcome-admin',
                    content: '<p>This is a sample article to get you started.</p>',
                    excerpt: 'Getting started with the admin panel',
                    category: 'General',
                    tags: ['welcome', 'tutorial'],
                    status: 'published',
                    author: 'Admin',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
        }

        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        } else {
            this.categories = [
                { id: 1, name: 'General', slug: 'general', description: 'General articles', articleCount: 1 },
                { id: 2, name: 'News', slug: 'news', description: 'News and updates', articleCount: 0 },
                { id: 3, name: 'Tutorials', slug: 'tutorials', description: 'How-to guides', articleCount: 0 }
            ];
        }

        if (savedMedia) {
            this.media = JSON.parse(savedMedia);
        }

        if (savedAuditLog) {
            this.auditLog = JSON.parse(savedAuditLog);
        }

        this.saveData();
    }

    saveData() {
        localStorage.setItem('cms_articles', JSON.stringify(this.articles));
        localStorage.setItem('cms_categories', JSON.stringify(this.categories));
        localStorage.setItem('cms_media', JSON.stringify(this.media));
        localStorage.setItem('cms_audit_log', JSON.stringify(this.auditLog));
    }

    // TipTap Editor Initialization
    initTipTapEditor() {
        const editorContent = document.getElementById('editor-content');
        if (editorContent) {
            this.editor = new window.TiptapEditor.Editor({
                element: editorContent,
                extensions: [
                    window.TiptapStarterKit.StarterKit,
                    window.TiptapImage.Image,
                    window.TiptapLink.Link.configure({
                        openOnClick: false,
                    }),
                ],
                content: '',
            });

            // Update toolbar buttons based on editor state
            this.editor.on('update', ({ editor }) => {
                this.updateToolbarState();
            });
        }
    }

    updateToolbarState() {
        if (!this.editor) return;

        const buttons = document.querySelectorAll('.editor-toolbar button');
        buttons.forEach(button => {
            const command = button.dataset.command;
            if (command) {
                if (this.editor.isActive(command)) {
                    button.classList.add('is-active');
                } else {
                    button.classList.remove('is-active');
                }
            }
        });
    }

    // Event Binding
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                
                // Update active nav
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Update section title
                document.getElementById('section-title').textContent = 
                    link.textContent.trim();
            });
        });

        // Article Editor Toolbar
        document.querySelectorAll('.editor-toolbar button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const command = button.dataset.command;
                
                if (command === 'heading') {
                    this.editor.chain().focus().toggleHeading({ level: 1 }).run();
                } else if (command === 'bold') {
                    this.editor.chain().focus().toggleBold().run();
                } else if (command === 'italic') {
                    this.editor.chain().focus().toggleItalic().run();
                } else if (command === 'bulletList') {
                    this.editor.chain().focus().toggleBulletList().run();
                } else if (command === 'orderedList') {
                    this.editor.chain().focus().toggleOrderedList().run();
                } else if (command === 'link') {
                    const url = prompt('Enter URL:');
                    if (url) {
                        this.editor.chain().focus().setLink({ href: url }).run();
                    }
                } else if (command === 'image') {
                    const url = prompt('Enter image URL:');
                    if (url) {
                        this.editor.chain().focus().setImage({ src: url }).run();
                    }
                }
                
                this.updateToolbarState();
            });
        });

        // New Article Button
        document.getElementById('new-article-btn').addEventListener('click', () => {
            this.openArticleEditor();
        });

        // Article Form Events
        document.getElementById('article-title').addEventListener('input', (e) => {
            const slug = e.target.value.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            document.getElementById('article-slug').value = slug;
        });

        document.getElementById('article-status').addEventListener('change', (e) => {
            const scheduleGroup = document.getElementById('schedule-group');
            if (e.target.value === 'scheduled') {
                scheduleGroup.style.display = 'block';
            } else {
                scheduleGroup.style.display = 'none';
            }
        });

        // Save Article
        document.getElementById('save-article').addEventListener('click', () => {
            this.saveArticle();
        });

        // Cancel Edit
        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.closeArticleEditor();
        });

        // Modal Close Buttons
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').style.display = 'none';
            });
        });

        // Category Management
        document.getElementById('new-category-btn').addEventListener('click', () => {
            this.openCategoryModal();
        });

        document.getElementById('category-name').addEventListener('input', (e) => {
            const slug = e.target.value.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            document.getElementById('category-slug').value = slug;
        });

        document.getElementById('save-category').addEventListener('click', () => {
            this.saveCategory();
        });

        document.getElementById('cancel-category').addEventListener('click', () => {
            this.closeCategoryModal();
        });

        // Media Upload
        const uploadArea = document.getElementById('media-upload-area');
        const uploadInput = document.getElementById('media-upload-input');

        uploadArea.addEventListener('click', () => {
            uploadInput.click();
        });

        uploadInput.addEventListener('change', (e) => {
            this.handleMediaUpload(e.target.files);
        });

        // Drag and Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#667eea';
            uploadArea.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = 'transparent';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = 'transparent';
            this.handleMediaUpload(e.dataTransfer.files);
        });

        // Search and Filter
        document.getElementById('article-search').addEventListener('input', () => {
            this.renderArticles();
        });

        document.getElementById('category-filter').addEventListener('change', () => {
            this.renderArticles();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.renderArticles();
        });

        document.getElementById('refresh-articles').addEventListener('click', () => {
            this.renderArticles();
        });

        // Audit Log Filters
        document.getElementById('audit-search').addEventListener('input', () => {
            this.renderAuditLog();
        });

        document.getElementById('action-filter').addEventListener('change', () => {
            this.renderAuditLog();
        });
    }

    // Section Management
    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // Article Management
    openArticleEditor(article = null) {
        this.currentEditingArticle = article;
        const modal = document.getElementById('article-editor-modal');
        const title = document.getElementById('editor-title');
        
        if (article) {
            title.textContent = 'Edit Article';
            document.getElementById('article-title').value = article.title;
            document.getElementById('article-slug').value = article.slug;
            document.getElementById('article-category').value = article.category;
            document.getElementById('article-tags').value = article.tags.join(', ');
            document.getElementById('article-excerpt').value = article.excerpt || '';
            document.getElementById('article-status').value = article.status;
            
            if (this.editor) {
                this.editor.commands.setContent(article.content);
            }
        } else {
            title.textContent = 'New Article';
            document.getElementById('article-form').reset();
            if (this.editor) {
                this.editor.commands.setContent('');
            }
        }
        
        this.populateCategorySelect();
        modal.style.display = 'block';
    }

    closeArticleEditor() {
        document.getElementById('article-editor-modal').style.display = 'none';
        this.currentEditingArticle = null;
    }

    saveArticle() {
        const title = document.getElementById('article-title').value.trim();
        const slug = document.getElementById('article-slug').value.trim();
        const category = document.getElementById('article-category').value;
        const tags = document.getElementById('article-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        const excerpt = document.getElementById('article-excerpt').value.trim();
        const status = document.getElementById('article-status').value;
        const content = this.editor ? this.editor.getHTML() : '';

        if (!title || !slug || !category) {
            alert('Please fill in all required fields');
            return;
        }

        const article = {
            title,
            slug,
            content,
            excerpt,
            category,
            tags,
            status,
            author: this.currentUser,
            updatedAt: new Date().toISOString()
        };

        if (this.currentEditingArticle) {
            // Update existing article
            article.id = this.currentEditingArticle.id;
            article.createdAt = this.currentEditingArticle.createdAt;
            
            const index = this.articles.findIndex(a => a.id === article.id);
            this.articles[index] = article;
            
            this.logAudit('update', article.title, `Updated article: ${article.title}`);
        } else {
            // Create new article
            article.id = Date.now();
            article.createdAt = new Date().toISOString();
            
            this.articles.push(article);
            
            this.logAudit('create', article.title, `Created article: ${article.title}`);
        }

        this.saveData();
        this.renderDashboard();
        this.renderArticles();
        this.closeArticleEditor();
    }

    deleteArticle(articleId) {
        if (confirm('Are you sure you want to delete this article?')) {
            const article = this.articles.find(a => a.id === articleId);
            this.articles = this.articles.filter(a => a.id !== articleId);
            
            this.logAudit('delete', article.title, `Deleted article: ${article.title}`);
            
            this.saveData();
            this.renderDashboard();
            this.renderArticles();
        }
    }

    publishArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (article) {
            article.status = 'published';
            article.updatedAt = new Date().toISOString();
            
            this.logAudit('publish', article.title, `Published article: ${article.title}`);
            
            this.saveData();
            this.renderDashboard();
            this.renderArticles();
        }
    }

    // Category Management
    openCategoryModal(category = null) {
        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-modal-title');
        
        if (category) {
            title.textContent = 'Edit Category';
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-slug').value = category.slug;
            document.getElementById('category-description').value = category.description;
        } else {
            title.textContent = 'New Category';
            document.getElementById('category-form').reset();
        }
        
        modal.style.display = 'block';
    }

    closeCategoryModal() {
        document.getElementById('category-modal').style.display = 'none';
    }

    saveCategory() {
        const name = document.getElementById('category-name').value.trim();
        const slug = document.getElementById('category-slug').value.trim();
        const description = document.getElementById('category-description').value.trim();

        if (!name || !slug) {
            alert('Please fill in all required fields');
            return;
        }

        const category = {
            name,
            slug,
            description,
            articleCount: 0
        };

        // Check if slug already exists
        if (this.categories.some(c => c.slug === slug)) {
            alert('A category with this slug already exists');
            return;
        }

        category.id = Date.now();
        this.categories.push(category);
        
        this.logAudit('create', 'Category', `Created category: ${category.name}`);
        
        this.saveData();
        this.renderCategories();
        this.closeCategoryModal();
    }

    deleteCategory(categoryId) {
        if (confirm('Are you sure you want to delete this category?')) {
            const category = this.categories.find(c => c.id === categoryId);
            this.categories = this.categories.filter(c => c.id !== categoryId);
            
            this.logAudit('delete', 'Category', `Deleted category: ${category.name}`);
            
            this.saveData();
            this.renderCategories();
        }
    }

    // Media Management
    handleMediaUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const mediaItem = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        type: file.type.startsWith('image/') ? 'image' : 'video',
                        url: e.target.result,
                        size: file.size,
                        uploadedAt: new Date().toISOString()
                    };
                    
                    this.media.push(mediaItem);
                    
                    this.logAudit('create', 'Media', `Uploaded media: ${mediaItem.name}`);
                    
                    this.saveData();
                    this.renderMedia();
                };
                
                reader.readAsDataURL(file);
            }
        });
    }

    deleteMedia(mediaId) {
        if (confirm('Are you sure you want to delete this media file?')) {
            const media = this.media.find(m => m.id === mediaId);
            this.media = this.media.filter(m => m.id !== mediaId);
            
            this.logAudit('delete', 'Media', `Deleted media: ${media.name}`);
            
            this.saveData();
            this.renderMedia();
        }
    }

    // Audit Log
    logAudit(action, target, details) {
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            user: this.currentUser,
            action,
            target,
            details
        };
        
        this.auditLog.unshift(entry);
        
        // Keep only last 1000 entries
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(0, 1000);
        }
        
        this.saveData();
    }

    // Rendering Methods
    renderDashboard() {
        const totalArticles = this.articles.length;
        const publishedArticles = this.articles.filter(a => a.status === 'published').length;
        const draftArticles = this.articles.filter(a => a.status === 'draft').length;
        const scheduledArticles = this.articles.filter(a => a.status === 'scheduled').length;

        document.getElementById('total-articles').textContent = totalArticles;
        document.getElementById('published-articles').textContent = publishedArticles;
        document.getElementById('draft-articles').textContent = draftArticles;
        document.getElementById('scheduled-articles').textContent = scheduledArticles;

        // Recent Activity
        const recentActivity = this.auditLog.slice(0, 5);
        const activityList = document.getElementById('recent-activity-list');
        
        activityList.innerHTML = recentActivity.map(entry => `
            <div class="activity-item">
                <div class="activity-time">${new Date(entry.timestamp).toLocaleString()}</div>
                <div><strong>${entry.user}</strong> ${entry.action.toLowerCase()} ${entry.target}</div>
                <div class="activity-details">${entry.details}</div>
            </div>
        `).join('');
    }

    renderArticles() {
        const searchTerm = document.getElementById('article-search').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        let filteredArticles = this.articles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm) ||
                                article.content.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || article.category === categoryFilter;
            const matchesStatus = !statusFilter || article.status === statusFilter;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });

        const tbody = document.getElementById('articles-table-body');
        
        tbody.innerHTML = filteredArticles.map(article => `
            <tr>
                <td>
                    <div>
                        <strong>${article.title}</strong>
                        <div style="font-size: 0.8rem; color: #6c757d;">
                            ${article.slug}
                        </div>
                    </div>
                </td>
                <td>${article.category}</td>
                <td>
                    <span class="status-badge status-${article.status}">
                        ${article.status}
                    </span>
                </td>
                <td>${article.author}</td>
                <td>
                    <div style="font-size: 0.9rem;">
                        ${new Date(article.createdAt).toLocaleDateString()}
                    </div>
                    <div style="font-size: 0.8rem; color: #6c757d;">
                        ${new Date(article.updatedAt).toLocaleDateString()}
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="cms.openArticleEditor(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${article.status !== 'published' ? `
                            <button class="btn btn-sm btn-success" onclick="cms.publishArticle(${article.id})">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger" onclick="cms.deleteArticle(${article.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Update category filter
        this.populateCategoryFilter();
    }

    renderCategories() {
        const grid = document.getElementById('categories-grid');
        
        // Update article counts
        this.categories.forEach(category => {
            category.articleCount = this.articles.filter(a => a.category === category.name).length;
        });
        
        grid.innerHTML = this.categories.map(category => `
            <div class="category-card">
                <div class="category-header">
                    <div class="category-title">${category.name}</div>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-danger" onclick="cms.deleteCategory(${category.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="category-description">${category.description}</div>
                <div class="category-stats">
                    <span><i class="fas fa-newspaper"></i> ${category.articleCount} articles</span>
                    <span><i class="fas fa-link"></i> ${category.slug}</span>
                </div>
            </div>
        `).join('');
    }

    renderMedia() {
        const grid = document.getElementById('media-grid');
        
        grid.innerHTML = this.media.map(item => `
            <div class="media-item">
                ${item.type === 'image' ? 
                    `<img src="${item.url}" alt="${item.name}">` :
                    `<video src="${item.url}" controls></video>`
                }
                <div class="media-info">
                    <div style="font-weight: 500;">${item.name}</div>
                    <div style="font-size: 0.8rem; color: #6c757d;">
                        ${this.formatFileSize(item.size)}
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="cms.deleteMedia(${item.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAuditLog() {
        const searchTerm = document.getElementById('audit-search').value.toLowerCase();
        const actionFilter = document.getElementById('action-filter').value;

        let filteredLog = this.auditLog.filter(entry => {
            const matchesSearch = entry.user.toLowerCase().includes(searchTerm) ||
                                entry.target.toLowerCase().includes(searchTerm) ||
                                entry.details.toLowerCase().includes(searchTerm);
            const matchesAction = !actionFilter || entry.action === actionFilter;
            
            return matchesSearch && matchesAction;
        });

        const tbody = document.getElementById('audit-table-body');
        
        tbody.innerHTML = filteredLog.map(entry => `
            <tr>
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
                <td>${entry.user}</td>
                <td>
                    <span class="status-badge status-${entry.action}">
                        ${entry.action}
                    </span>
                </td>
                <td>${entry.target}</td>
                <td>${entry.details}</td>
            </tr>
        `).join('');
    }

    // Helper Methods
    populateCategorySelect() {
        const select = document.getElementById('article-category');
        select.innerHTML = '<option value="">Select Category</option>' +
            this.categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
    }

    populateCategoryFilter() {
        const select = document.getElementById('category-filter');
        const currentValue = select.value;
        select.innerHTML = '<option value="">All Categories</option>' +
            this.categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
        select.value = currentValue;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the CMS when the page loads
let cms;
document.addEventListener('DOMContentLoaded', () => {
    cms = new AdminCMS();
});