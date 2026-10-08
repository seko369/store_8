#!/bin/sh
set -eu

mkdir -p /app/uploads/products
alembic upgrade head

exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --proxy-headers \
    --forwarded-allow-ips=172.30.0.2
