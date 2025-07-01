export interface Env {
  DB: D1Database;
  API_TOKEN: string;
  ANALYTICS_SCRIPT?: string;
  ASSETS: Fetcher;
}

interface HaikuPayload {
  haiku: string;
  context?: string;
  timestamp?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(getHtmlPage(env), {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    // Handle favicon requests
    if ((url.pathname === '/favicon.ico' || url.pathname === '/favicon.png') && request.method === 'GET') {
      try {
        // In production, serve from assets; in local dev, try assets binding first
        const assetRequest = new Request(url.toString(), request);
        const assetResponse = await env.ASSETS.fetch(assetRequest);
        
        if (assetResponse.status === 200) {
          return new Response(assetResponse.body, {
            headers: {
              'Content-Type': url.pathname.endsWith('.ico') ? 'image/x-icon' : 'image/png',
              'Cache-Control': 'public, max-age=86400'
            }
          });
        }
      } catch (error) {
        // Fallback for local development if assets binding fails
        console.log('Assets binding failed, using fallback favicon');
      }
      
      // Simple fallback favicon for local development
      return new Response(null, { status: 204 });
    }
    
    if (url.pathname === '/api/haiku' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || authHeader !== `Bearer ${env.API_TOKEN}`) {
        return new Response('Unauthorized', { status: 401 });
      }
      
      try {
        const payload: HaikuPayload = await request.json();
        const timestamp = payload.timestamp || new Date().toISOString();
        
        await env.DB.prepare(
          'INSERT INTO haikus (haiku, action, timestamp) VALUES (?, ?, ?)'
        ).bind(payload.haiku, payload.context || '', timestamp).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (url.pathname === '/api/haikus' && request.method === 'GET') {
      const haikus = await env.DB.prepare(
        'SELECT * FROM haikus ORDER BY timestamp DESC LIMIT 50'
      ).all();
      
      return new Response(JSON.stringify(haikus.results), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response('Not found', { status: 404 });
  },
};

function getHtmlPage(env: Env) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Haiku Collection</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
    <link rel="apple-touch-icon" href="/favicon.png">
    ${env.ANALYTICS_SCRIPT || ''}
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 40px;
        }
        .haiku-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .haiku-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .haiku-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .haiku-text {
            font-size: 18px;
            line-height: 1.6;
            color: #444;
            white-space: pre-line;
            margin-bottom: 15px;
            font-style: italic;
        }
        .haiku-meta {
            font-size: 14px;
            color: #666;
        }
        .haiku-action {
            font-weight: 500;
            color: #0066cc;
        }
        .haiku-time {
            color: #999;
            font-size: 12px;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .error {
            text-align: center;
            padding: 40px;
            color: #d32f2f;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Claude's Haiku Collection</h1>
        <div id="haikus" class="haiku-grid">
            <div class="loading">Loading haikus...</div>
        </div>
    </div>
    
    <script>
        async function loadHaikus() {
            const container = document.getElementById('haikus');
            
            try {
                const response = await fetch('/api/haikus');
                const haikus = await response.json();
                
                if (haikus.length === 0) {
                    container.innerHTML = '<div class="loading">No haikus yet!</div>';
                    return;
                }
                
                container.innerHTML = haikus.map(haiku => \`
                    <div class="haiku-card">
                        <div class="haiku-text">\${haiku.haiku}</div>
                        <div class="haiku-meta">
                            \${haiku.action ? \`<div class="haiku-action">Context: \${haiku.action}</div>\` : ''}
                            <div class="haiku-time">\${new Date(haiku.timestamp).toLocaleString()}</div>
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                container.innerHTML = '<div class="error">Failed to load haikus</div>';
            }
        }
        
        loadHaikus();
        setInterval(loadHaikus, 30000);
    </script>
</body>
</html>`;
}