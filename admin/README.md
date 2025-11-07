# Admin Content Management System

A comprehensive admin interface for managing articles, categories, media, and audit logs with rich text editing capabilities.

## Features

### Article Management
- **CRUD Operations**: Create, read, update, and delete articles
- **Rich Text Editor**: TipTap-based editor with formatting tools
- **Category & Tag Management**: Organize content with categories and tags
- **Publishing Control**: Draft, published, and scheduled status
- **Search & Filtering**: Find articles quickly with advanced filters

### Media Management
- **File Upload**: Drag-and-drop or click-to-upload interface
- **Media Library**: View and manage uploaded images and videos
- **File Deletion**: Remove unused media files

### Category Management
- **Create Categories**: Define content categories with descriptions
- **Slug Generation**: Automatic URL-friendly slug creation
- **Article Counting**: Track articles per category

### Audit Logging
- **Action Tracking**: All CRUD operations are logged
- **User Attribution**: Track which user performed each action
- **Searchable History**: Filter and search through audit logs
- **Timestamp Records**: Complete chronological history

### Dashboard Analytics
- **Content Statistics**: Overview of total, published, draft, and scheduled articles
- **Recent Activity**: Latest actions and changes
- **Quick Access**: Direct links to management sections

## Usage

### Getting Started
1. Open `admin/index.html` in your browser
2. The interface will initialize with sample data
3. All data is stored in browser localStorage

### Creating Articles
1. Click "New Article" button
2. Fill in required fields (title, slug, category)
3. Use the rich text editor for content
4. Add tags and excerpt
5. Set status (draft, published, or scheduled)
6. Click "Save Article"

### Managing Categories
1. Navigate to Categories section
2. Click "New Category"
3. Enter name (slug auto-generates)
4. Add description
5. Save category

### Uploading Media
1. Go to Media section
2. Drag files to upload area or click to browse
3. Supported formats: images and videos
4. Files are stored as base64 in localStorage

### Viewing Audit Log
1. Navigate to Audit Log section
2. View all system actions
3. Filter by action type or search
4. See timestamps, users, and details

## Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with animations and responsive design
- **JavaScript ES6+**: Modern JavaScript with classes and modules
- **TipTap**: Rich text editing framework

### Data Storage
- **LocalStorage**: Client-side persistence
- **JSON Format**: Structured data storage
- **Automatic Saving**: Real-time data persistence

### Key Components
- `AdminCMS` class: Main application controller
- TipTap Editor: Rich text editing
- Modal System: Dialog-based forms
- Grid Layouts: Responsive content organization

## File Structure
```
admin/
├── index.html          # Main admin interface
├── css/
│   └── admin.css       # Complete styling
├── js/
│   └── admin.js        # Core functionality
├── assets/             # Static assets directory
└── README.md           # This documentation
```

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- LocalStorage support required

## Security Notes
- This is a demo implementation
- In production, implement proper authentication
- Use server-side validation and sanitization
- Implement proper file upload security
- Add CSRF protection

## Future Enhancements
- User authentication system
- Server-side API integration
- Advanced media optimization
- Multi-user collaboration
- Version control for articles
- Advanced scheduling features
- SEO optimization tools
- Content preview functionality