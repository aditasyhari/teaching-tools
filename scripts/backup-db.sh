#!/usr/bin/env bash
# ==============================================================================
# WaliKelas Teaching Tools V1 — Automated PostgreSQL Database Backup Script
#
# Usage:
#   ./scripts/backup-db.sh
#
# Environment variables:
#   DATABASE_URL     PostgreSQL connection string (e.g., postgresql://user:pass@localhost:5432/walikelas)
#   BACKUP_DIR       Target directory for backups (default: /var/backups/walikelas)
#   RETENTION_DAYS   Days to retain backups before pruning (default: 14)
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/walikelas}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
BACKUP_FILE="${BACKUP_DIR}/walikelas_${TIMESTAMP}.sql.gz"

echo "=== Starting WaliKelas Database Backup ==="
echo "Timestamp: ${TIMESTAMP}"
echo "Target: ${BACKUP_FILE}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL environment variable is not set." >&2
  exit 1
fi

# Execute pg_dump and pipe through gzip
echo "Executing pg_dump..."
pg_dump "${DATABASE_URL}" --clean --if-exists --no-owner --no-privileges | gzip -9 > "${BACKUP_FILE}"

# Verify file existence and non-zero size
if [ -s "${BACKUP_FILE}" ]; then
  FILESIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
  echo "Backup completed successfully! Size: ${FILESIZE}"
else
  echo "Error: Backup file is empty or missing!" >&2
  exit 1
fi

# Retention policy: Prune backups older than RETENTION_DAYS
echo "Pruning backups older than ${RETENTION_DAYS} days in ${BACKUP_DIR}..."
find "${BACKUP_DIR}" -name "walikelas_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -print -delete || true

echo "=== Backup Process Completed Successfully ==="
exit 0

