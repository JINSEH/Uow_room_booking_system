#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/uow_room_booking_system}"
BRANCH="${BRANCH:-main}"
APP_NAME="${APP_NAME:-room-booking}"

echo "Deploying ${APP_NAME} from branch ${BRANCH}..."
cd "${APP_DIR}"

git fetch origin
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

npm install

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}"
else
  pm2 start server.js --name "${APP_NAME}"
fi

pm2 save
echo "Deployment complete."
