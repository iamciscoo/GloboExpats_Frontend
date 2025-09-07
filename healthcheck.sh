#!/bin/sh

# Health check script for Docker container
# This script is used by Docker HEALTHCHECK

# Check if the application is responding
if command -v curl >/dev/null 2>&1; then
    # Use curl if available
    curl -f http://localhost:3000/api/health >/dev/null 2>&1
    exit $?
elif command -v wget >/dev/null 2>&1; then
    # Use wget as fallback
    wget --quiet --tries=1 --spider http://localhost:3000/api/health >/dev/null 2>&1
    exit $?
else
    # Simple TCP check as last resort
    nc -z localhost 3000 >/dev/null 2>&1
    exit $?
fi
