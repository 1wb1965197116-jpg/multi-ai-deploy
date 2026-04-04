#!/bin/bash
# Install dependencies
npm install

# Start backend
echo "Starting backend on port 5000..."
node backend/server.js
