#!/bin/bash

if [ -f "/home/app_backend/backend/prisma/migration/migration_lock.toml" ]; then
	npx prisma migrate deploy
else
	npx prisma migrate dev --name init
fi
exec npm run start