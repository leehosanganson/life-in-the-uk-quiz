#!/bin/sh
set -e

CONTACT_EMAIL="${CONTACT_EMAIL:-}"
OPERATOR_NAME="${OPERATOR_NAME:-}"
POLICY_UPDATE_DATE="${POLICY_UPDATE_DATE:-}"
GITHUB_URL="${GITHUB_URL:-}"
APP_VERSION="${APP_VERSION:-}"

# Escape double-quotes to prevent broken JS output, then emit JS value
_val=$(printf '%s' "${CONTACT_EMAIL}" | sed 's/"/\\"/g')
if [ -n "$_val" ]; then CONTACT_EMAIL_JS="\"${_val}\""; else CONTACT_EMAIL_JS="undefined"; fi

_val=$(printf '%s' "${OPERATOR_NAME}" | sed 's/"/\\"/g')
if [ -n "$_val" ]; then OPERATOR_NAME_JS="\"${_val}\""; else OPERATOR_NAME_JS="undefined"; fi

_val=$(printf '%s' "${POLICY_UPDATE_DATE}" | sed 's/"/\\"/g')
if [ -n "$_val" ]; then POLICY_UPDATE_DATE_JS="\"${_val}\""; else POLICY_UPDATE_DATE_JS="undefined"; fi

_val=$(printf '%s' "${GITHUB_URL}" | sed 's/"/\\"/g')
if [ -n "$_val" ]; then GITHUB_URL_JS="\"${_val}\""; else GITHUB_URL_JS="undefined"; fi

_val=$(printf '%s' "${APP_VERSION}" | sed 's/"/\\"/g')
if [ -n "$_val" ]; then APP_VERSION_JS="\"${_val}\""; else APP_VERSION_JS="undefined"; fi

cat > /usr/share/nginx/html/env-config.js <<ENVEOF
window.__ENV__ = {
  CONTACT_EMAIL: ${CONTACT_EMAIL_JS},
  OPERATOR_NAME: ${OPERATOR_NAME_JS},
  POLICY_UPDATE_DATE: ${POLICY_UPDATE_DATE_JS},
  GITHUB_URL: ${GITHUB_URL_JS},
  APP_VERSION: ${APP_VERSION_JS},
};
ENVEOF

# Bust Cloudflare's extension-based cache for env-config.js.
# Use APP_VERSION if set, otherwise fall back to a Unix timestamp.
if [ -n "$APP_VERSION" ]; then
  CACHE_BUSTER="$APP_VERSION"
else
  CACHE_BUSTER="$(date +%s)"
fi

# Patch index.html in-place. Use a pattern that matches both the plain URL
# (first start) and any previously versioned URL (container restart), so
# the correct cache-buster is always applied regardless of prior state.
sed -i "s|src=\"/env-config\.js[^\"]*\"|src=\"/env-config.js?v=${CACHE_BUSTER}\"|" /usr/share/nginx/html/index.html

exec nginx -g 'daemon off;'
