FROM ubuntu:latest

RUN apt update\
	&& apt upgrade -y\
	&& apt install -y curl\
	git\
	&& curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
	&& apt-get install -y nodejs

RUN apt install -y postgresql-client\
	&& npm i -g @nestjs/cli\
	&& useradd -m app_backend\
	&& nest new -p npm /home/app_backend/backend\
	&& chown -R app_backend:app_backend /home/app_backend

COPY --chown=app_backend:app_backend "./resources/package.json" "/home/app_backend/backend/"

USER app_backend

WORKDIR /home/app_backend/backend

RUN npm install\
	&& npm install prisma --save-dev\
	&& npx prisma\
	&& npx prisma init

COPY --chown=app_backend:app_backend "./prisma/env" "/home/app_backend/backend/.env"
COPY --chown=app_backend:app_backend "./prisma/schema.prisma" "/home/app_backend/backend/prisma/"

RUN npm install @prisma/client\
	&& npx prisma generate
#RUN npx prisma migrate dev --name init

CMD [ "/bin/bash", "-c", "npx prisma migrate dev --name init & npm run start:dev"]