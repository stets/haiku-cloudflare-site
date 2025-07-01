#!/usr/bin/env bash

# Installation script for haiku-sender

set -e

echo "🎋 Installing haiku-sender..."

# Check if we have permission to install to /usr/local/bin
INSTALL_DIR="/usr/local/bin"
if [[ ! -w "$INSTALL_DIR" ]]; then
    echo "Need sudo permission to install to $INSTALL_DIR"
    sudo cp haiku-sender "$INSTALL_DIR/haiku-sender"
    sudo chmod +x "$INSTALL_DIR/haiku-sender"
else
    cp haiku-sender "$INSTALL_DIR/haiku-sender"
    chmod +x "$INSTALL_DIR/haiku-sender"
fi

echo "✅ haiku-sender installed to $INSTALL_DIR"

# Create default config file
CONFIG_FILE="$HOME/.haiku-config"
if [[ ! -f "$CONFIG_FILE" ]]; then
    cat > "$CONFIG_FILE" << 'EOF'
# Haiku sender configuration
# Update these values for your deployment

# Local development
ENDPOINT="http://localhost:8787/api/haiku"
API_TOKEN="YOUR_SECURE_API_TOKEN"

# For production, uncomment and update:
# ENDPOINT="https://your-worker.workers.dev/api/haiku"
# API_TOKEN="your-production-token"
EOF
    echo "📁 Created config file: $CONFIG_FILE"
    echo "   Please edit this file to set your endpoint and API token"
else
    echo "📁 Config file already exists: $CONFIG_FILE"
fi

echo ""
echo "🎯 Usage examples:"
echo "  haiku-sender \"Deployment complete\\nServers hum with satisfaction\\nUsers smile with joy\""
echo "  haiku-sender \"Bug found and squashed\\nCode review reveals wisdom\\nTests pass, all is well\" \"git commit\""
echo ""
echo "💡 Edit $CONFIG_FILE to configure your endpoint and API token"