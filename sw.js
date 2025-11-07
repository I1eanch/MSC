const CACHE_NAME = 'trainer-chat-v1';
const urlsToCache = [
    '/',
    '/chat.html',
    '/chat.css',
    '/chat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response for caching
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.log('Service Worker: Fetch failed:', error);
                        
                        // If it's a navigation request, serve the offline page
                        if (event.request.destination === 'document') {
                            return caches.match('/chat.html');
                        }
                    });
            })
    );
});

// Background sync for offline messages
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered:', event.tag);
    
    if (event.tag === 'chat-messages') {
        event.waitUntil(syncChatMessages());
    }
    
    if (event.tag === 'chat-attachments') {
        event.waitUntil(syncAttachments());
    }
});

// Sync queued messages when back online
async function syncChatMessages() {
    try {
        // Get all clients
        const clients = await self.clients.matchAll();
        
        // Notify all clients to sync their offline queue
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_OFFLINE_QUEUE'
            });
        });
        
        console.log('Service Worker: Sync message sent to clients');
    } catch (error) {
        console.error('Service Worker: Sync failed:', error);
        throw error; // This will cause the sync to retry
    }
}

// Sync attachments when back online
async function syncAttachments() {
    try {
        const clients = await self.clients.matchAll();
        
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_ATTACHMENTS'
            });
        });
        
        console.log('Service Worker: Attachment sync message sent');
    } catch (error) {
        console.error('Service Worker: Attachment sync failed:', error);
        throw error;
    }
}

// Push notification handler
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'You have a new message',
        icon: 'https://picsum.photos/seed/trainer/192/192.jpg',
        badge: 'https://picsum.photos/seed/badge/72/72.jpg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open Chat',
                icon: 'https://picsum.photos/seed/checkmark/16/16.jpg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: 'https://picsum.photos/seed/xmark/16/16.jpg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Trainer Chat', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification click received');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open or focus the chat app
        event.waitUntil(
            clients.matchAll().then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/chat.html');
                }
            })
        );
    }
});

// Handle message from client
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received from client:', event.data);
    
    if (event.data && event.data.type === 'REGISTER_SYNC') {
        // Register for background sync
        event.waitUntil(
            self.registration.sync.register(event.data.tag)
                .then(() => {
                    console.log('Service Worker: Background sync registered:', event.data.tag);
                    event.ports[0].postMessage({ success: true });
                })
                .catch((error) => {
                    console.error('Service Worker: Sync registration failed:', error);
                    event.ports[0].postMessage({ success: false, error: error.message });
                })
        );
    }
});

// Periodic background sync for message updates
self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync triggered:', event.tag);
    
    if (event.tag === 'message-updates') {
        event.waitUntil(checkForNewMessages());
    }
});

// Check for new messages periodically
async function checkForNewMessages() {
    try {
        // In a real app, this would poll your server for new messages
        const clients = await self.clients.matchAll();
        
        clients.forEach(client => {
            client.postMessage({
                type: 'CHECK_NEW_MESSAGES'
            });
        });
        
        console.log('Service Worker: Periodic message check completed');
    } catch (error) {
        console.error('Service Worker: Periodic sync failed:', error);
    }
}