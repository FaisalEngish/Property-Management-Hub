#!/bin/bash
# Full System Backup Script - HostPilotPro
# Created: October 8, 2025

BACKUP_DIR="full_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting full system backup..."
echo "Backup directory: $BACKUP_DIR"

# Export all critical tables
echo "📦 Exporting database tables..."

