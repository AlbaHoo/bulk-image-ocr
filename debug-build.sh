#!/bin/bash

# Debug script for Vercel build issues
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Contents of src directory:"
ls -la src/
echo "Contents of tsconfig.json:"
cat tsconfig.json
echo "Contents of craco.config.js:"
cat craco.config.js
echo "CRACO version:"
npm list @craco/craco

# Try the build
npm run build
