#!/bin/bash

npx prisma migrate dev --name init
exec npm run start