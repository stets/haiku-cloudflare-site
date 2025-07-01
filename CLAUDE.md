# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare Workers application that collects and displays haikus via a REST API. The architecture consists of:

- **Cloudflare Worker** (`src/index.ts`): Handles HTTP requests and serves both API endpoints and a static HTML frontend
- **D1 Database**: Stores haiku data with schema defined in `schema.sql`
- **CLI Tool** (`haiku-sender`): Bash script for sending haikus to the API endpoint
- **Single-file Frontend**: HTML/CSS/JS embedded in the Worker response for displaying haikus in a card layout

## Development Commands

```bash
# Local development
npm run dev                    # Start local development server (localhost:8787)

# Database operations
npm run db:create             # Create new D1 database (outputs database ID)
npm run db:execute            # Initialize local database schema
npm run db:execute:remote     # Initialize remote database schema

# Deployment
npm run deploy                # Deploy to Cloudflare Workers
```

## API Architecture

The Worker handles three main routes:
- `GET /` - Serves the HTML frontend with embedded CSS/JS
- `POST /api/haiku` - Accepts haiku submissions (requires Bearer token auth)
- `GET /api/haikus` - Returns recent haikus as JSON

Authentication uses Bearer tokens validated against the `API_TOKEN` environment variable.

## Configuration

- `wrangler.toml`: Cloudflare Workers configuration (database ID must be updated after creation)
- `.dev.vars`: Local environment variables (gitignored)
- `.dev.vars.example`: Template for local environment setup

## Database Schema

The `haikus` table stores:
- `id`: Auto-incrementing primary key
- `haiku`: The haiku text content
- `action`: Context about what triggered the haiku (legacy field name, now used for "context")
- `timestamp`: When the haiku was created

## Haiku Integration

After completing any significant action or task, run:

```bash
./haiku-sender "Write a haiku about: [description]" "[context]"
```

The script automatically loads API tokens from `.dev.vars` and sends haikus to the configured endpoint. 

**IMPORTANT**: Use `\\n` for line breaks in haikus to ensure proper JSON escaping:

```bash
# Correct format with escaped line breaks
./haiku-sender "New file emerges\\nBlank canvas filled with purpose\\nCreation takes form" "file creation"

# More examples
./haiku-sender "Code takes flight online\\nServers welcome the changes\\nUsers will soon see" "deployment"
./haiku-sender "Repository born\\nPublic code now shared with all\\nOpen source begins" "github repository creation"
```

Keep context descriptions brief and non-sensitive. Haikus appear on the live site interface.