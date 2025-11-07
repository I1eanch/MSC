// Chat Application with Offline Support and S3 Integration
class ChatApp {
    constructor() {
        this.messages = [];
        this.offlineQueue = [];
        this.isOnline = navigator.onLine;
        this.currentUser = 'user';
        this.trainerId = 'trainer-sarah';
        this.s3Bucket = 'trainer-chat-attachments';
        this.apiEndpoint = 'https://api.trainer-chat.com';
        
        this.initializeElements();
        this.loadStoredMessages();
        this.setupEventListeners();
        this.setupServiceWorker();
        this.requestNotificationPermission();
        this.setupBackgroundSync();
        
        // Simulate receiving messages
        this.simulateTrainerMessages();
    }

    initializeElements() {
        this.elements = {
            messagesContainer: document.getElementById('messagesContainer'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            attachmentBtn: document.getElementById('attachmentBtn'),
            attachmentOptions: document.getElementById('attachmentOptions'),
            fileInput: document.getElementById('fileInput'),
            photoInput: document.getElementById('photoInput'),
            offlineIndicator: document.getElementById('offlineIndicator'),
            uploadProgress: document.getElementById('uploadProgress'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            typingIndicator: document.querySelector('.typing-indicator'),
            notificationModal: document.getElementById('notificationModal'),
            acceptNotifications: document.getElementById('acceptNotifications'),
            declineNotifications: document.getElementById('declineNotifications'),
            emojiBtn: document.getElementById('emojiBtn')
        };
    }

    setupEventListeners() {
        // Message sending
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.elements.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.sendTypingIndicator();
        });

        // Attachments
        this.elements.attachmentBtn.addEventListener('click', () => {
            this.toggleAttachmentOptions();
        });

        document.querySelectorAll('.attachment-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.handleAttachment(type);
            });
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        this.elements.photoInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Online/Offline status
        window.addEventListener('online', () => this.handleOnlineStatusChange(true));
        window.addEventListener('offline', () => this.handleOnlineStatusChange(false));

        // Notifications
        this.elements.acceptNotifications.addEventListener('click', () => {
            this.requestNotificationPermission(true);
        });

        this.elements.declineNotifications.addEventListener('click', () => {
            this.hideNotificationModal();
        });

        // Close attachment options when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.attachment-btn') && !e.target.closest('.attachment-options')) {
                this.elements.attachmentOptions.style.display = 'none';
            }
        });

        // Emoji button (simplified - would integrate with emoji picker)
        this.elements.emojiBtn.addEventListener('click', () => {
            this.insertEmoji('💪');
        });
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('chat-messages');
            });
        }
    }

    async requestNotificationPermission(showModal = false) {
        if ('Notification' in window) {
            if (Notification.permission === 'default' && showModal) {
                this.elements.notificationModal.style.display = 'flex';
            } else if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    this.showNotification('Notifications enabled', 'You\'ll receive messages from your trainer');
                }
            }
        }
    }

    hideNotificationModal() {
        this.elements.notificationModal.style.display = 'none';
    }

    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: 'https://picsum.photos/seed/trainer/40/40.jpg',
                badge: 'https://picsum.photos/seed/badge/40/40.jpg'
            });
        }
    }

    async sendMessage() {
        const text = this.elements.messageInput.value.trim();
        if (!text) return;

        const message = {
            id: Date.now(),
            text: text,
            sender: this.currentUser,
            timestamp: new Date().toISOString(),
            status: 'sending'
        };

        this.addMessage(message);
        this.elements.messageInput.value = '';
        this.autoResizeTextarea();

        if (this.isOnline) {
            try {
                await this.syncMessage(message);
                message.status = 'sent';
                this.updateMessageStatus(message.id, 'sent');
                
                // Simulate delivery
                setTimeout(() => {
                    message.status = 'delivered';
                    this.updateMessageStatus(message.id, 'delivered');
                }, 1000);
                
                setTimeout(() => {
                    message.status = 'read';
                    this.updateMessageStatus(message.id, 'read');
                }, 2000);
            } catch (error) {
                message.status = 'failed';
                this.updateMessageStatus(message.id, 'failed');
                this.offlineQueue.push(message);
            }
        } else {
            message.status = 'queued';
            this.updateMessageStatus(message.id, 'queued');
            this.offlineQueue.push(message);
        }
    }

    async syncMessage(message) {
        // Simulate API call - in real app, this would be your backend
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Message synced:', message);
                resolve();
            }, 500);
        });
    }

    addMessage(message) {
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
        this.saveMessages();
    }

    renderMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.sender === this.currentUser ? 'sent' : 'received'}`;
        messageEl.dataset.messageId = message.id;

        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (message.sender === this.currentUser) {
            messageEl.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">${this.escapeHtml(message.text)}</div>
                    <div class="message-time">${time}</div>
                    <div class="message-status" data-status="${message.status}">
                        ${this.getStatusIcon(message.status)}
                    </div>
                </div>
            `;
        } else {
            messageEl.innerHTML = `
                <img src="https://picsum.photos/seed/trainer/32/32.jpg" alt="Trainer" class="message-avatar">
                <div class="message-content">
                    <div class="message-bubble">${this.escapeHtml(message.text)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        }

        // Insert before typing indicator if it exists
        const typingIndicator = this.elements.typingIndicator;
        if (typingIndicator && typingIndicator.style.display !== 'none') {
            this.elements.messagesContainer.insertBefore(messageEl, typingIndicator);
        } else {
            this.elements.messagesContainer.appendChild(messageEl);
        }
    }

    getStatusIcon(status) {
        const icons = {
            'sending': '<i class="fas fa-clock"></i>',
            'sent': '<i class="fas fa-check"></i>',
            'delivered': '<i class="fas fa-check"></i>',
            'read': '<i class="fas fa-check-double"></i>',
            'queued': '<i class="fas fa-wifi-slash"></i>',
            'failed': '<i class="fas fa-exclamation-triangle"></i>'
        };
        return icons[status] || '';
    }

    updateMessageStatus(messageId, status) {
        const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageEl) {
            const statusEl = messageEl.querySelector('.message-status');
            if (statusEl) {
                statusEl.dataset.status = status;
                statusEl.innerHTML = this.getStatusIcon(status);
            }
        }
        
        // Update in memory
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.status = status;
        }
        
        this.saveMessages();
    }

    toggleAttachmentOptions() {
        const isVisible = this.elements.attachmentOptions.style.display === 'flex';
        this.elements.attachmentOptions.style.display = isVisible ? 'none' : 'flex';
    }

    handleAttachment(type) {
        this.elements.attachmentOptions.style.display = 'none';
        
        if (type === 'photo') {
            this.elements.photoInput.click();
        } else {
            this.elements.fileInput.click();
        }
    }

    async handleFileSelect(file) {
        if (!file) return;

        const message = {
            id: Date.now(),
            text: '',
            sender: this.currentUser,
            timestamp: new Date().toISOString(),
            status: 'uploading',
            attachment: {
                name: file.name,
                size: file.size,
                type: file.type,
                url: null
            }
        };

        this.addMessage(message);
        
        if (this.isOnline) {
            await this.uploadFile(file, message);
        } else {
            message.status = 'queued';
            this.updateMessageStatus(message.id, 'queued');
            this.offlineQueue.push(message);
        }
    }

    async uploadFile(file, message) {
        this.showUploadProgress(0);

        try {
            // Simulate S3 upload - in real app, use AWS SDK
            const uploadedUrl = await this.simulateS3Upload(file, (progress) => {
                this.showUploadProgress(progress);
            });

            message.attachment.url = uploadedUrl;
            message.status = 'sent';
            this.updateMessageStatus(message.id, 'sent');
            
            // Update message to show file preview
            this.updateMessageWithAttachment(message);
            
            this.hideUploadProgress();
            
        } catch (error) {
            message.status = 'failed';
            this.updateMessageStatus(message.id, 'failed');
            this.hideUploadProgress();
        }
    }

    async simulateS3Upload(file, onProgress) {
        return new Promise((resolve) => {
            const totalSize = file.size;
            let uploaded = 0;
            
            const interval = setInterval(() => {
                uploaded += totalSize / 20;
                const progress = Math.min((uploaded / totalSize) * 100, 100);
                onProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    // Simulate S3 URL
                    resolve(`https://${this.s3Bucket}.s3.amazonaws.com/${Date.now()}-${file.name}`);
                }
            }, 200);
        });
    }

    showUploadProgress(progress) {
        this.elements.uploadProgress.style.display = 'block';
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `Uploading... ${Math.round(progress)}%`;
    }

    hideUploadProgress() {
        setTimeout(() => {
            this.elements.uploadProgress.style.display = 'none';
        }, 500);
    }

    updateMessageWithAttachment(message) {
        const messageEl = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageEl && message.attachment) {
            const bubble = messageEl.querySelector('.message-bubble');
            const fileIcon = this.getFileIcon(message.attachment.type);
            const fileSize = this.formatFileSize(message.attachment.size);
            
            bubble.innerHTML += `
                <div class="file-preview">
                    <i class="${fileIcon}"></i>
                    <div class="file-preview-info">
                        <div class="file-preview-name">${message.attachment.name}</div>
                        <div class="file-preview-size">${fileSize}</div>
                    </div>
                    <button class="file-preview-remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
    }

    getFileIcon(type) {
        if (type.startsWith('image/')) return 'fas fa-image';
        if (type.startsWith('video/')) return 'fas fa-video';
        if (type.includes('pdf')) return 'fas fa-file-pdf';
        if (type.includes('word')) return 'fas fa-file-word';
        return 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    sendTypingIndicator() {
        // Simulate typing indicator to trainer
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        this.typingTimeout = setTimeout(() => {
            // Send "stopped typing" event
        }, 1000);
    }

    showTypingIndicator() {
        this.elements.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.elements.typingIndicator.style.display = 'none';
    }

    simulateTrainerMessages() {
        // Simulate trainer responses
        const responses = [
            { text: "That's great! I'll create a customized workout plan for you.", delay: 3000 },
            { text: "Let's start with 3 days per week and gradually increase intensity.", delay: 8000 },
            { text: "Don't forget to track your progress! 💪", delay: 15000 }
        ];

        responses.forEach(response => {
            setTimeout(() => {
                this.showTypingIndicator();
                
                setTimeout(() => {
                    this.hideTypingIndicator();
                    
                    const message = {
                        id: Date.now(),
                        text: response.text,
                        sender: 'trainer',
                        timestamp: new Date().toISOString(),
                        status: 'delivered'
                    };
                    
                    this.addMessage(message);
                    
                    if (document.hidden) {
                        this.showNotification('New message from Sarah', response.text);
                    }
                }, 2000);
            }, response.delay);
        });
    }

    handleOnlineStatusChange(isOnline) {
        this.isOnline = isOnline;
        
        if (isOnline) {
            this.elements.offlineIndicator.style.display = 'none';
            this.processOfflineQueue();
        } else {
            this.elements.offlineIndicator.style.display = 'flex';
        }
    }

    async processOfflineQueue() {
        while (this.offlineQueue.length > 0) {
            const message = this.offlineQueue.shift();
            
            try {
                if (message.attachment && !message.attachment.url) {
                    // Handle file upload when back online
                    await this.uploadFile(null, message); // Would need actual file data
                } else {
                    await this.syncMessage(message);
                }
                
                message.status = 'sent';
                this.updateMessageStatus(message.id, 'sent');
                
                // Simulate delivery and read
                setTimeout(() => {
                    message.status = 'delivered';
                    this.updateMessageStatus(message.id, 'delivered');
                }, 1000);
                
                setTimeout(() => {
                    message.status = 'read';
                    this.updateMessageStatus(message.id, 'read');
                }, 2000);
                
            } catch (error) {
                console.error('Failed to sync message:', error);
                this.offlineQueue.unshift(message); // Put back at front
                break;
            }
        }
    }

    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    scrollToBottom() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    saveMessages() {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }

    loadStoredMessages() {
        const stored = localStorage.getItem('chatMessages');
        if (stored) {
            try {
                this.messages = JSON.parse(stored);
                this.messages.forEach(message => this.renderMessage(message));
                this.scrollToBottom();
            } catch (error) {
                console.error('Failed to load stored messages:', error);
            }
        }
    }

    insertEmoji(emoji) {
        const input = this.elements.messageInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        
        input.value = text.substring(0, start) + emoji + text.substring(end);
        input.selectionStart = input.selectionEnd = start + emoji.length;
        input.focus();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Service Worker for offline support and background sync
const serviceWorkerCode = `
const CACHE_NAME = 'trainer-chat-v1';
const urlsToCache = [
    '/',
    '/chat.html',
    '/chat.css',
    '/chat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'chat-messages') {
        event.waitUntil(syncChatMessages());
    }
});

async function syncChatMessages() {
    // Handle background sync of queued messages
    console.log('Background sync triggered');
}
`;

// Create service worker file
const swBlob = new Blob([serviceWorkerCode], { type: 'application/javascript' });
const swUrl = URL.createObjectURL(swBlob);

// Register the service worker if we're in the right context
if (typeof window !== 'undefined') {
    navigator.serviceWorker.register(swUrl).catch(() => {
        // Fallback for environments where service worker registration fails
    });
}

// Initialize the chat app
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});