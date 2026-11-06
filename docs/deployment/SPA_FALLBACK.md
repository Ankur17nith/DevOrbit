# DevOrbit SPA Fallback & Routing Guide

DevOrbit Web uses client-side routing powered by `react-router-dom` with deep paths (`/app`, `/app/dsa`, `/app/fix`, `/login`, `/documentation`, etc.).

When deploying the production build (`apps/web/dist`) to static web servers or CDNs, requests for non-asset URIs must be rewritten to serve `/index.html` (HTTP 200) so that React Router can handle routing on the client.

---

## 1. Nginx

Configure `try_files` inside the server or location block:

```nginx
server {
    listen 80;
    server_name devorbit.local;
    root /var/www/devorbit/dist;
    index index.html;

    # Static assets with cache headers
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 2. Netlify

Place a `_redirects` file in `apps/web/public/_redirects`:

```text
/api/*  http://localhost:3001/api/:splat  200
/*      /index.html                       200
```

Or configure in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 3. Vercel

Configure `vercel.json` in the web root or repository root:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "http://localhost:3001/api/$1"
    },
    {
      "source": "/((?!assets/.*|favicon.ico).*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. Cloudflare Pages

Place a `_routes.json` or `_redirects` file in the build output directory:

```text
/*  /index.html  200
```

---

## 5. Apache (.htaccess)

Ensure `mod_rewrite` is enabled and place in `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 6. Caddy

```caddy
devorbit.local {
    root * /var/www/devorbit/dist
    encode gzip
    try_files {path} /index.html
    file_server
}
```

---

## 7. Vite Development Server (Built-in)

During local development with `npm run dev:web`, Vite automatically falls back to `index.html` for unknown paths and proxies `/api` to the backend server as configured in `apps/web/vite.config.ts`.
