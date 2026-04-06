#!/bin/sh
set -e

CONTACT_EMAIL="${CONTACT_EMAIL:-contact@example.com}"
OPERATOR_NAME="${OPERATOR_NAME:-Ho Sang Lee}"
POLICY_UPDATE_DATE="${POLICY_UPDATE_DATE:-5 April 2026}"
GITHUB_URL="${GITHUB_URL:-}"

# Escape double-quotes to prevent broken JS output
CONTACT_EMAIL=$(printf '%s' "$CONTACT_EMAIL" | sed 's/"/\\"/g')
OPERATOR_NAME=$(printf '%s' "$OPERATOR_NAME" | sed 's/"/\\"/g')
POLICY_UPDATE_DATE=$(printf '%s' "$POLICY_UPDATE_DATE" | sed 's/"/\\"/g')
GITHUB_URL=$(printf '%s' "$GITHUB_URL" | sed 's/"/\\"/g')

cat > /usr/share/nginx/html/env-config.js <<ENVEOF
window.__ENV__ = {
  CONTACT_EMAIL: "${CONTACT_EMAIL}",
  OPERATOR_NAME: "${OPERATOR_NAME}",
  POLICY_UPDATE_DATE: "${POLICY_UPDATE_DATE}",
  GITHUB_URL: "${GITHUB_URL}"
};
ENVEOF

exec nginx -g 'daemon off;'
