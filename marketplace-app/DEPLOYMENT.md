# Deployment Guide for Daviz Marketplace App

## Netlify Deployment

This app is configured for easy deployment on Netlify with the following setup:

### Quick Deploy

1. **Connect Repository**: Link your Git repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 (automatically set via netlify.toml)

### Manual Deploy

1. **Build the app locally**:
   ```bash
   npm install
   npm run build
   ```

2. **Deploy the `dist` folder** to Netlify via drag & drop or CLI

### Configuration Files

- **netlify.toml**: Contains Netlify-specific build settings and redirects
- **public/_redirects**: Ensures SPA routing works correctly
- **vite.config.ts**: Optimized for production builds with chunk splitting

### Features Enabled

- ✅ Single Page Application (SPA) routing
- ✅ Security headers
- ✅ Static asset caching
- ✅ Optimized JavaScript bundles
- ✅ Gzip compression
- ✅ Tailwind CSS v4 support

### Environment Variables

If you need to set environment variables for different networks:

```bash
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=B1EzQtkQo1o3dthdo1XHfc3R8qa4zLwxEwp8ATAW2sDS
```

### Build Optimization

The app uses the following optimizations:
- Code splitting for vendor libraries (React, Solana, Anchor)
- Tree shaking for unused code elimination
- Minification and compression
- Chunk size optimization

### Troubleshooting

1. **Build fails**: Check that all TypeScript errors are resolved
2. **Routing issues**: Ensure _redirects file exists in public directory
3. **Wallet not connecting**: Verify HTTPS is enabled (required for wallet adapters)