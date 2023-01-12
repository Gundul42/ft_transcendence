FROM ubuntu:latest

RUN apt update\
	&& apt upgrade -y\
	&& apt install -y curl\
	git\
	&& curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
	&& apt-get install -y nodejs

RUN npm i -g @nestjs/cli\
	&& useradd -m app_backend\
	&& nest new -p npm /home/app_backend/backend\
	&& chown -R app_backend:app_backend /home/app_backend

COPY "./resources/package.json" "/home/app_backend/backend/"

USER app_backend

WORKDIR /home/app_backend/backend

RUN npm install

CMD ["npm", "run", "start:dev"]