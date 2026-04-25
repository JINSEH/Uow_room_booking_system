# Deployment Guide (VPS + SQLite)

This project serves both frontend and backend from one Node.js app (`server.js`).

## 1) Prerequisites

- Ubuntu server (22.04+)
- Node.js 22
- Nginx
- PM2
- Git

Install quickly:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2
```

## 2) Clone and configure

```bash
git clone <your-repo-url> ~/uow_room_booking_system
cd ~/uow_room_booking_system
npm install
cp .env.example .env
```

Edit `.env`:

- `JWT_SECRET` must be a long random string
- `PORT` can stay `3000`

## 3) Start with PM2

```bash
cd ~/uow_room_booking_system
pm2 start server.js --name room-booking
pm2 save
pm2 startup
```

Run the command shown by `pm2 startup`.

## 4) Configure Nginx reverse proxy

Create `/etc/nginx/sites-available/room-booking`:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_SERVER_IP;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/room-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5) Health check

Use:

```bash
curl http://127.0.0.1:3000/health
```

Expected response:

```json
{"ok":true,"service":"uow-room-booking-system"}
```

## 6) One-command redeploy

This repo includes `deploy.sh`.

```bash
chmod +x deploy.sh
./deploy.sh
```

Optional variables:

```bash
APP_DIR=~/uow_room_booking_system BRANCH=main APP_NAME=room-booking ./deploy.sh
```

## 7) Persistence notes

- SQLite data file: `database.db`
- Uploaded room images: `public/images/uploads`

Back up both paths for demo safety.
