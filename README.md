# Haiku Collector

A Cloudflare Workers application that collects and displays haikus via a REST API. Perfect for capturing creative moments and sharing them with the world.

## Features

- 🎋 **Haiku Collection**: Submit haikus via REST API with Bearer token authentication
- 📱 **Beautiful Display**: Clean, responsive web interface with card-based layout
- 🗄️ **Persistent Storage**: Cloudflare D1 database for reliable data storage
- 🚀 **Edge Performance**: Deployed on Cloudflare Workers for global low-latency access
- 🛠️ **CLI Tool**: Bash script for easy haiku submission from command line

## Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account with Workers enabled
- Wrangler CLI installed globally: `npm install -g wrangler`

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure Cloudflare settings**
   ```bash
   # Copy example configuration
   cp wrangler.toml.example wrangler.toml
   cp .dev.vars.example .dev.vars
   ```

3. **Create and configure database**
   ```bash
   # Create D1 database (note the database ID from output)
   npm run db:create
   
   # Update wrangler.toml with your database ID
   # Replace YOUR_DATABASE_ID_HERE with the actual ID
   ```

4. **Initialize database schema**
   ```bash
   # Local development database
   npm run db:execute
   
   # Remote production database (after deployment)
   npm run db:execute:remote
   ```

5. **Set up authentication**
   ```bash
   # Add API token to .dev.vars for local development
   echo "API_TOKEN=your-secret-token-here" >> .dev.vars
   
   # Set production secret (for deployment)
   wrangler secret put API_TOKEN
   ```

### Development

```bash
# Start local development server
npm run dev

# Visit http://localhost:8787 to see the interface
# API available at http://localhost:8787/api/haikus
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Don't forget to initialize the remote database if first deployment
npm run db:execute:remote
```

## API Usage

### Get Haikus
```bash
GET /api/haikus
```

Returns recent haikus in JSON format.

### Submit Haiku
```bash
POST /api/haiku
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "haiku": "Code flows like water\nFunctions dancing in the dark\nBugs become features",
  "context": "late night coding"
}
```

Example with curl:
```bash
curl -X POST https://your-worker.workers.dev/api/haiku \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "haiku": "Code commits complete\nClaude ponders silicon dreams\nHaiku flows like streams",
    "action": "git commit"
  }'
```

### CLI Tool Usage

The included `haiku-sender` script makes it easy to submit haikus:

```bash
# Make sure it's executable
chmod +x haiku-sender

# Submit a haiku
./haiku-sender "Fresh code deployed\nServers humming with new life\nUsers clicking through" "deployment"
```

The script automatically reads your API token from `.dev.vars`.

## Project Structure

```
├── src/
│   └── index.ts          # Main Cloudflare Worker
├── haiku-sender          # CLI submission tool
├── schema.sql            # Database schema
├── wrangler.toml         # Cloudflare Workers config (gitignored)
├── wrangler.toml.example # Configuration template
├── .dev.vars.example     # Environment variables template
└── CLAUDE.md            # Development notes for Claude Code
```

## Database Schema

The application uses a simple `haikus` table:

- `id`: Auto-incrementing primary key
- `haiku`: The haiku text content
- `action`: Context/description (legacy field name)
- `timestamp`: Creation timestamp

## Configuration Files

- **wrangler.toml**: Contains your specific database ID and deployment settings (gitignored)
- **wrangler.toml.example**: Template with placeholder values
- **.dev.vars**: Local environment variables including API_TOKEN (gitignored)
- **.dev.vars.example**: Template for local development setup

## License

MIT