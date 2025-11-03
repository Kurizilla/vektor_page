#!/bin/sh
set -e

APP_DIR=${APP_DIR:-/srv/app}
export STRAPI_TELEMETRY_DISABLED=${STRAPI_TELEMETRY_DISABLED:-1}
export CI=${CI:-1}

if [ ! -f "$APP_DIR/package.json" ]; then
  echo "[strapi] First run: seeding app into $APP_DIR from baked template..."
  mkdir -p "$APP_DIR"
  if [ -d /opt/strapi-template ]; then
    cp -a /opt/strapi-template/. "$APP_DIR"/
  elif [ -f /opt/strapi-template.tgz ]; then
    echo "[strapi] Extracting baked template archive..."
    tar -C "$APP_DIR" -xzf /opt/strapi-template.tgz
  else
    echo "[strapi] Template not found. Creating quickstart app..."
    yes n | npx create-strapi-app@5.28.0 "$APP_DIR" \
      --skip-cloud \
      --typescript \
      --quickstart \
      --no-run
  fi
  # Ensure package.json exists before continuing
  if [ ! -f "$APP_DIR/package.json" ]; then
    echo "[strapi] ERROR: package.json not found after creation. Aborting." >&2
    ls -la "$APP_DIR" || true
    exit 1
  fi
fi

cd "$APP_DIR"

install_deps() {
  if [ -f package-lock.json ]; then
    npm ci || npm install
  else
    npm install
  fi
}

ensure_pg_client() {
  if [ "${DATABASE_CLIENT}" = "postgres" ]; then
    if node -e "require.resolve('pg')" >/dev/null 2>&1; then
      echo "[strapi] pg client already present"
    else
      echo "[strapi] Installing pg client for Postgres..."
      npm install --no-save pg@^8 || npm install --no-save pg
    fi
  fi
}

if [ "$1" = "start" ]; then
  echo "[strapi] Building for production..."
  install_deps
  ensure_pg_client
  npm run build
  echo "[strapi] Starting..."
  exec npm run start
else
  echo "[strapi] Installing dependencies and starting in develop mode..."
  install_deps
  ensure_pg_client
  exec npm run develop
fi
