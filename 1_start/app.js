// Article Library Application
class ArticleLibrary {
    constructor() {
        this.articles = [];
        this.favorites = this.loadFavorites();
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentView = 'articleListView';
        this.offlineMode = false;
        this.cachedArticles = this.loadCachedArticles();
        this.currentArticle = null;
        
        this.init();
    }

    init() {
        this.loadArticles();
        this.setupEventListeners();
        this.updateFavoritesCount();
        this.setupOfflineHandling();
        this.trackAnalytics('app_opened');
    }

    // Sample article data
    generateSampleArticles() {
        return [
            {
                id: 1,
                title: "The Future of Mobile Development",
                excerpt: "Exploring the latest trends and technologies shaping the mobile app landscape in 2024 and beyond.",
                content: `
                    <p>The mobile development landscape is evolving at an unprecedented pace. With new frameworks, tools, and methodologies emerging regularly, developers must stay informed to remain competitive.</p>
                    <h2>Key Trends</h2>
                    <ul>
                        <li>Cross-platform development gaining momentum</li>
                        <li>AI integration becoming standard</li>
                        <li>Progressive Web Apps (PWAs) on the rise</li>
                        <li>5G enabling new possibilities</li>
                    </ul>
                    <p>As we look to the future, several key trends are emerging that will shape how we build and experience mobile applications.</p>
                    <h2>Technology Stack Evolution</h2>
                    <p>The traditional native approach is being challenged by powerful cross-platform solutions like React Native, Flutter, and .NET MAUI. These frameworks offer near-native performance while significantly reducing development time and costs.</p>
                `,
                category: "technology",
                author: "Sarah Johnson",
                date: "2024-01-15",
                readTime: "5 min read",
                image: "https://picsum.photos/seed/mobile-dev/400/300.jpg",
                featured: true
            },
            {
                id: 2,
                title: "UX Design Principles for Mobile Apps",
                excerpt: "Essential design principles and best practices for creating intuitive and engaging mobile user experiences.",
                content: `
                    <p>Creating exceptional mobile user experiences requires a deep understanding of user behavior, device capabilities, and design principles that work specifically for mobile contexts.</p>
                    <h2>Core Principles</h2>
                    <ul>
                        <li>Thumb-friendly navigation</li>
                        <li>Consistent visual hierarchy</li>
                        <li>Minimal cognitive load</li>
                        <li>Accessibility first approach</li>
                    </ul>
                    <p>Mobile design isn't just about making things smaller – it's about rethinking the entire user interaction paradigm.</p>
                    <h2>Design Systems</h2>
                    <p>Implementing a robust design system ensures consistency across your application and makes future updates more manageable.</p>
                `,
                category: "design",
                author: "Michael Chen",
                date: "2024-01-12",
                readTime: "7 min read",
                image: "https://picsum.photos/seed/ux-design/400/300.jpg",
                featured: false
            },
            {
                id: 3,
                title: "Building Scalable Business Apps",
                excerpt: "Strategies and architectures for developing mobile applications that can grow with your business needs.",
                content: `
                    <p>Scalability is a critical consideration when developing business applications. The decisions you make early in development can have significant impacts on your ability to grow and adapt.</p>
                    <h2>Architecture Considerations</h2>
                    <ul>
                        <li>Microservices architecture</li>
                        <li>Cloud-native solutions</li>
                        <li>Data management strategies</li>
                        <li>Performance optimization</li>
                    </ul>
                    <p>Building for scale requires careful planning and the right technology choices from the start.</p>
                    <h2>Best Practices</h2>
                    <p>Implementing caching strategies, optimizing API calls, and designing for offline functionality are essential for creating scalable mobile applications.</p>
                `,
                category: "business",
                author: "Emily Rodriguez",
                date: "2024-01-10",
                readTime: "6 min read",
                image: "https://picsum.photos/seed/business-app/400/300.jpg",
                featured: true
            },
            {
                id: 4,
                title: "Mobile App Monetization Strategies",
                excerpt: "Explore different approaches to monetize your mobile applications and generate sustainable revenue.",
                content: `
                    <p>Monetizing mobile apps requires a strategic approach that balances user experience with revenue generation. Understanding different monetization models helps you choose the right path for your app.</p>
                    <h2>Popular Models</h2>
                    <ul>
                        <li>Freemium and in-app purchases</li>
                        <li>Subscription-based models</li>
                        <li>Advertising integration</li>
                        <li>Premium one-time purchases</li>
                    </ul>
                    <p>Each monetization strategy has its pros and cons, and the best choice depends on your app's value proposition and target audience.</p>
                    <h2>Implementation Tips</h2>
                    <p>Successful monetization requires careful timing, user-friendly implementation, and continuous optimization based on user feedback and analytics.</p>
                `,
                category: "business",
                author: "David Kim",
                date: "2024-01-08",
                readTime: "8 min read",
                image: "https://picsum.photos/seed/monetization/400/300.jpg",
                featured: false
            },
            {
                id: 5,
                title: "The Rise of Progressive Web Apps",
                excerpt: "How PWAs are bridging the gap between web and mobile applications, offering the best of both worlds.",
                content: `
                    <p>Progressive Web Apps represent a significant shift in how we think about web applications, bringing native-like experiences to the web platform.</p>
                    <h2>Key Features</h2>
                    <ul>
                        <li>Offline functionality</li>
                        <li>Push notifications</li>
                        <li>App-like installation</li>
                        <li>Background sync</li>
                    </ul>
                    <p>PWAs combine the reach of the web with the functionality of native apps, creating compelling experiences for users.</p>
                    <h2>Development Considerations</h2>
                    <p>Building PWAs requires understanding service workers, manifest files, and responsive design principles that work across all devices.</p>
                `,
                category: "technology",
                author: "Lisa Thompson",
                date: "2024-01-05",
                readTime: "6 min read",
                image: "https://picsum.photos/seed/pwa/400/300.jpg",
                featured: true
            },
            {
                id: 6,
                title: "Mobile-First Design Strategy",
                excerpt: "Why designing for mobile first is no longer optional but essential for modern digital products.",
                content: `
                    <p>The mobile-first approach to design has become crucial in today's multi-device world. Starting with mobile constraints leads to better overall design solutions.</p>
                    <h2>Benefits</h2>
                    <ul>
                        <li>Improved user experience</li>
                        <li>Better performance</li>
                        <li>Higher engagement rates</li>
                        <li>SEO advantages</li>
                    </ul>
                    <p>Mobile-first design forces you to prioritize content and functionality, resulting in cleaner, more focused user experiences.</p>
                    <h2>Implementation</h2>
                    <p>Adopting mobile-first requires changes to design processes, development workflows, and organizational mindset.</p>
                `,
                category: "design",
                author: "Alex Martinez",
                date: "2024-01-03",
                readTime: "5 min read",
                image: "https://picsum.photos/seed/mobile-first/400/300.jpg",
                featured: false
            },
            {
                id: 7,
                title: "Work-Life Balance in Tech",
                excerpt: "Practical strategies for maintaining mental health and work-life balance in the fast-paced tech industry.",
                content: `
                    <p>The tech industry is known for its demanding work culture, but maintaining work-life balance is essential for long-term success and well-being.</p>
                    <h2>Key Strategies</h2>
                    <ul>
                        <li>Setting clear boundaries</li>
                        <li>Time management techniques</li>
                        <li>Regular breaks and disconnect time</li>
                        <li>Mental health awareness</li>
                    </ul>
                    <p>Finding balance isn't about working less, but working smarter and taking care of your mental and physical health.</p>
                    <h2>Company Culture</h2>
                    <p>Organizations that prioritize work-life balance see higher productivity, better retention, and more innovative solutions.</p>
                `,
                category: "lifestyle",
                author: "Rachel Green",
                date: "2024-01-01",
                readTime: "7 min read",
                image: "https://picsum.photos/seed/work-life/400/300.jpg",
                featured: false
            },
            {
                id: 8,
                title: "Mobile Security Best Practices",
                excerpt: "Essential security measures every mobile developer should implement to protect user data and privacy.",
                content: `
                    <p>Mobile security is more important than ever as apps handle increasingly sensitive user data. Implementing robust security measures is non-negotiable.</p>
                    <h2>Security Fundamentals</h2>
                    <ul>
                        <li>Data encryption</li>
                        <li>Secure authentication</li>
                        <li>API security</li>
                        <li>Regular security audits</li>
                    </ul>
                    <p>Security should be considered at every stage of development, from initial design to deployment and maintenance.</p>
                    <h2>Common Vulnerabilities</h2>
                    <p>Understanding common mobile security threats helps developers build more secure applications and protect user data effectively.</p>
                `,
                category: "technology",
                author: "James Wilson",
                date: "2023-12-28",
                readTime: "8 min read",
                image: "https://picsum.photos/seed/security/400/300.jpg",
                featured: true
            }
        ];
    }

    // Load articles (from cache or generate sample data)
    async loadArticles() {
        this.showLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (this.offlineMode && this.cachedArticles.length > 0) {
            this.articles = this.cachedArticles;
            this.showToast('Showing cached articles');
        } else {
            this.articles = this.generateSampleArticles();
            this.cacheArticles();
        }
        
        this.renderArticles();
        this.showLoading(false);
        this.trackAnalytics('articles_loaded', { count: this.articles.length });
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchContainer = document.getElementById('searchContainer');
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');

        searchBtn.addEventListener('click', () => {
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchInput.focus();
                this.trackAnalytics('search_opened');
            }
        });

        searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.renderArticles();
            this.trackAnalytics('search_performed', { query: this.currentSearch });
        });

        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            this.currentSearch = '';
            this.renderArticles();
        });

        // Filter functionality
        const filterPills = document.querySelectorAll('.filter-pill');
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.currentFilter = pill.dataset.category;
                this.renderArticles();
                this.trackAnalytics('filter_applied', { category: this.currentFilter });
            });
        });

        // Navigation
        const navItems = document.querySelectorAll('.nav-item[data-view]');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const viewName = item.dataset.view;
                this.switchView(viewName);
                
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Favorites button in header
        document.getElementById('favoritesBtn').addEventListener('click', () => {
            this.switchView('favoritesView');
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelector('[data-view="favoritesView"]').classList.add('active');
            this.trackAnalytics('favorites_viewed');
        });

        // Offline toggle
        document.getElementById('offlineToggle').addEventListener('click', () => {
            this.toggleOfflineMode();
        });

        // Share modal
        const shareModal = document.getElementById('shareModal');
        const closeShareModal = document.getElementById('closeShareModal');
        
        closeShareModal.addEventListener('click', () => {
            shareModal.classList.remove('active');
        });

        // Share options
        const shareOptions = document.querySelectorAll('.share-option');
        shareOptions.forEach(option => {
            option.addEventListener('click', () => {
                const platform = option.dataset.platform;
                this.shareArticle(platform);
                shareModal.classList.remove('active');
            });
        });

        // Close modal on background click
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.classList.remove('active');
            }
        });
    }

    // Render articles based on current filter and search
    renderArticles() {
        let filteredArticles = this.articles;

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filteredArticles = filteredArticles.filter(article => 
                article.category === this.currentFilter
            );
        }

        // Apply search filter
        if (this.currentSearch) {
            filteredArticles = filteredArticles.filter(article =>
                article.title.toLowerCase().includes(this.currentSearch) ||
                article.excerpt.toLowerCase().includes(this.currentSearch) ||
                article.content.toLowerCase().includes(this.currentSearch)
            );
        }

        const articleList = document.getElementById('articleList');
        
        if (filteredArticles.length === 0) {
            articleList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No articles found</p>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }

        articleList.innerHTML = filteredArticles.map(article => `
            <article class="article-card" data-id="${article.id}">
                <img src="${article.image}" alt="${article.title}" class="article-image" loading="lazy">
                <div class="article-content">
                    <span class="article-category">${article.category}</span>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span>${article.author} • ${article.date}</span>
                        <span>${article.readTime}</span>
                    </div>
                    <div class="article-actions">
                        <button class="action-btn favorite-btn" data-id="${article.id}">
                            <i class="fas fa-heart ${this.isFavorite(article.id) ? 'favorited' : ''}"></i>
                        </button>
                        <button class="action-btn share-btn" data-id="${article.id}">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');

        // Add click listeners to article cards
        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.article-actions')) {
                    const articleId = parseInt(card.dataset.id);
                    this.showArticleDetail(articleId);
                }
            });
        });

        // Add click listeners to action buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const articleId = parseInt(btn.dataset.id);
                this.toggleFavorite(articleId);
            });
        });

        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const articleId = parseInt(btn.dataset.id);
                this.currentArticle = this.articles.find(a => a.id === articleId);
                this.openShareModal();
            });
        });
    }

    // Show article detail view
    showArticleDetail(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;

        this.currentArticle = article;
        const detailView = document.getElementById('articleDetailView');
        const articleDetail = document.getElementById('articleDetail');

        articleDetail.innerHTML = `
            <div class="detail-header">
                <img src="${article.image}" alt="${article.title}" class="detail-image">
                <button class="back-btn" onclick="app.switchView('articleListView')">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <div class="detail-actions">
                    <button class="action-btn favorite-btn ${this.isFavorite(article.id) ? 'favorited' : ''}" 
                            onclick="app.toggleFavorite(${article.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="action-btn share-btn" onclick="app.openShareModal()">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
            <div class="detail-content">
                <span class="detail-category">${article.category}</span>
                <h1 class="detail-title">${article.title}</h1>
                <div class="detail-meta">
                    <span>${article.author}</span>
                    <span>${article.date}</span>
                    <span>${article.readTime}</span>
                </div>
                <div class="detail-body">
                    ${article.content}
                </div>
            </div>
        `;

        this.switchView('articleDetailView');
        this.trackAnalytics('article_viewed', { articleId: article.id, category: article.category });
    }

    // Switch between views
    switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(viewName).classList.add('active');
        this.currentView = viewName;

        if (viewName === 'favoritesView') {
            this.renderFavorites();
        }
    }

    // Toggle favorite status
    toggleFavorite(articleId) {
        const index = this.favorites.indexOf(articleId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showToast('Removed from favorites');
            this.trackAnalytics('favorite_removed', { articleId });
        } else {
            this.favorites.push(articleId);
            this.showToast('Added to favorites');
            this.trackAnalytics('favorite_added', { articleId });
        }
        
        this.saveFavorites();
        this.updateFavoritesCount();
        this.renderArticles();
        
        // Update detail view if active
        if (this.currentView === 'articleDetailView' && this.currentArticle) {
            this.showArticleDetail(this.currentArticle.id);
        }
    }

    // Check if article is favorited
    isFavorite(articleId) {
        return this.favorites.includes(articleId);
    }

    // Update favorites count badge
    updateFavoritesCount() {
        const count = document.getElementById('favoritesCount');
        count.textContent = this.favorites.length;
        count.style.display = this.favorites.length > 0 ? 'flex' : 'none';
    }

    // Render favorites view
    renderFavorites() {
        const favoriteArticles = this.articles.filter(article => 
            this.favorites.includes(article.id)
        );

        const favoritesList = document.getElementById('favoritesList');
        const emptyFavorites = document.getElementById('emptyFavorites');

        if (favoriteArticles.length === 0) {
            favoritesList.style.display = 'none';
            emptyFavorites.style.display = 'block';
        } else {
            favoritesList.style.display = 'block';
            emptyFavorites.style.display = 'none';
            
            favoritesList.innerHTML = favoriteArticles.map(article => `
                <article class="article-card" data-id="${article.id}">
                    <img src="${article.image}" alt="${article.title}" class="article-image" loading="lazy">
                    <div class="article-content">
                        <span class="article-category">${article.category}</span>
                        <h3 class="article-title">${article.title}</h3>
                        <p class="article-excerpt">${article.excerpt}</p>
                        <div class="article-meta">
                            <span>${article.author} • ${article.date}</span>
                            <span>${article.readTime}</span>
                        </div>
                        <div class="article-actions">
                            <button class="action-btn favorite-btn favorited" data-id="${article.id}">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button class="action-btn share-btn" data-id="${article.id}">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `).join('');

            // Re-attach event listeners
            document.querySelectorAll('#favoritesList .article-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.article-actions')) {
                        const articleId = parseInt(card.dataset.id);
                        this.showArticleDetail(articleId);
                    }
                });
            });

            document.querySelectorAll('#favoritesList .favorite-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const articleId = parseInt(btn.dataset.id);
                    this.toggleFavorite(articleId);
                });
            });

            document.querySelectorAll('#favoritesList .share-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const articleId = parseInt(btn.dataset.id);
                    this.currentArticle = this.articles.find(a => a.id === articleId);
                    this.openShareModal();
                });
            });
        }
    }

    // Open share modal
    openShareModal() {
        if (!this.currentArticle) return;
        document.getElementById('shareModal').classList.add('active');
        this.trackAnalytics('share_modal_opened', { articleId: this.currentArticle.id });
    }

    // Share article
    shareArticle(platform) {
        if (!this.currentArticle) return;

        const url = window.location.href;
        const title = this.currentArticle.title;
        const text = this.currentArticle.excerpt;

        let shareUrl = '';

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url).then(() => {
                    this.showToast('Link copied to clipboard!');
                });
                this.trackAnalytics('link_copied', { articleId: this.currentArticle.id });
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            this.trackAnalytics('article_shared', { platform, articleId: this.currentArticle.id });
        }
    }

    // Toggle offline mode
    toggleOfflineMode() {
        this.offlineMode = !this.offlineMode;
        const offlineToggle = document.getElementById('offlineToggle');
        const offlineIndicator = document.createElement('div');
        offlineIndicator.className = 'offline-indicator';
        offlineIndicator.textContent = this.offlineMode ? 'Offline Mode' : 'Online Mode';

        if (this.offlineMode) {
            offlineToggle.classList.add('active');
            this.showToast('Offline mode enabled');
            this.trackAnalytics('offline_mode_enabled');
        } else {
            offlineToggle.classList.remove('active');
            this.showToast('Online mode enabled');
            this.loadArticles(); // Refresh articles
            this.trackAnalytics('offline_mode_disabled');
        }

        // Show indicator
        document.body.appendChild(offlineIndicator);
        setTimeout(() => {
            offlineIndicator.classList.add('active');
        }, 100);

        setTimeout(() => {
            offlineIndicator.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(offlineIndicator);
            }, 300);
        }, 2000);
    }

    // Setup offline handling
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            if (this.offlineMode) {
                this.showToast('Connection restored');
                this.trackAnalytics('connection_restored');
            }
        });

        window.addEventListener('offline', () => {
            this.showToast('Connection lost - using cached content');
            this.trackAnalytics('connection_lost');
        });
    }

    // Show/hide loading state
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.style.display = 'block';
        } else {
            loading.style.display = 'none';
        }
    }

    // Show toast notification
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Local storage methods
    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    loadFavorites() {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    }

    cacheArticles() {
        localStorage.setItem('cachedArticles', JSON.stringify(this.articles));
    }

    loadCachedArticles() {
        const cached = localStorage.getItem('cachedArticles');
        return cached ? JSON.parse(cached) : [];
    }

    // Analytics tracking
    trackAnalytics(event, data = {}) {
        // In a real app, this would send to an analytics service
        const analyticsData = {
            event,
            timestamp: new Date().toISOString(),
            data,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };
        
        console.log('Analytics Event:', analyticsData);
        
        // Store events locally for demonstration
        const events = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
        events.push(analyticsData);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('analyticsEvents', JSON.stringify(events));
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ArticleLibrary();
});