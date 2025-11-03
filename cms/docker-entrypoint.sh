#!/bin/sh
set -e

APP_DIR=${APP_DIR:-/srv/app}
export STRAPI_TELEMETRY_DISABLED=${STRAPI_TELEMETRY_DISABLED:-1}

if [ ! -f "$APP_DIR/package.json" ]; then
  echo "[strapi] No project found. Creating Strapi app in $APP_DIR..."
  # Responder 'N' a prompts (p. ej. plantilla de ejemplo)
  yes n | npx create-strapi-app@latest "$APP_DIR" \
    --no-run \
    --skip-cloud \
    --ts \
    --dbclient=postgres \
    --dbhost="${DATABASE_HOST:-db}" \
    --dbport="${DATABASE_PORT:-5432}" \
    --dbname="${DATABASE_NAME:-strapi}" \
    --dbusername="${DATABASE_USERNAME:-strapi}" \
    --dbpassword="${DATABASE_PASSWORD:-strapi}" \
    --dbssl=false
fi

cd "$APP_DIR"
install_deps() {
  if [ -f package-lock.json ]; then
    npm ci || npm install
  else
    npm install
  fi
}

if [ "$1" = "start" ]; then
  echo "[strapi] Building for production..."
  install_deps
  npm run build
  echo "[strapi] Starting..."
  exec npm run start
else
  # default: develop
  echo "[strapi] Installing dependencies and starting in develop mode..."
  install_deps
  exec npm run develop
fi


