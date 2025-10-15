# Assets Organization

This directory contains all static assets for the ExpatFrontend application, organized for maintainability and API readiness.

## Directory Structure

```
assets/
├── data/           # JSON data files for API fallbacks
│   ├── api-config.json    # API endpoint configuration
│   ├── users.json         # User/seller mock data
│   ├── products.json      # Product listings mock data
│   └── categories.json    # Category definitions
├── images/         # All image assets
│   ├── products/          # Product photos
│   ├── avatars/           # User profile images
│   ├── heroes/            # Hero/banner images
│   └── placeholders/      # Stock photos for listings
└── icons/          # Icon files (future use)
```

## Usage Guidelines

### Images

- **Products**: Real product photos, optimized for web
- **Avatars**: User profile pictures, standardized sizes
- **Heroes**: Large banner images for homepage/categories
- **Placeholders**: Generic stock photos for demo listings

### Data Files

- **api-config.json**: Central configuration for API endpoints and fallbacks
- **users.json**: Mock user data with proper avatar paths
- **products.json**: Sample product listings with metadata
- **categories.json**: Category definitions with counts

## API Integration

The structure supports seamless transition from mock data to live APIs:

1. **Development**: Uses local JSON files as data source
2. **Production**: Switches to API endpoints defined in `api-config.json`
3. **Fallback**: Gracefully degrades to local data if APIs unavailable

## File Naming Conventions

- Use kebab-case for directories: `hero-images/`
- Use descriptive names: `macbook-pro.jpg` not `img1.jpg`
- Include size indicators when relevant: `avatar-large.png`
- Use consistent extensions: `.jpg` for photos, `.png` for graphics

## Optimization

All images should be:

- Compressed for web delivery
- Properly sized for their use case
- Include alt text in implementation
- Consider lazy loading for performance
