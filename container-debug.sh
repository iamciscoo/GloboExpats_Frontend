#!/bin/bash

# Docker Container Diagnostic Script
# Run inside the container to check file structure and permissions

echo "=== Docker Container Diagnostics ==="
echo ""

echo "Current directory:"
pwd
echo ""

echo "Directory contents:"
ls -la
echo ""

echo "Next.js build files:"
ls -la .next/ 2>/dev/null || echo "No .next directory found"
echo ""

echo "Static files:"
ls -la .next/static/ 2>/dev/null || echo "No static directory found"
echo ""

echo "Public files:"
ls -la public/ 2>/dev/null || echo "No public directory found"
echo ""

echo "Environment variables:"
env | grep -E "(NODE_ENV|PORT|HOSTNAME|NEXT_)" | sort
echo ""

echo "Process information:"
ps aux
echo ""

echo "Network information:"
netstat -tlnp 2>/dev/null || ss -tlnp 2>/dev/null || echo "No network info available"
echo ""
