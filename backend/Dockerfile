FROM ubuntu:latest

RUN apt-get update\
	&& apt-get upgrade -y\
	&& apt-get install -y curl\
	git\
	&& curl -fsSL https://deb.nodesource.com/setup_19.x | bash - \
	&& apt-get install -y nodejs

RUN npm i -g @nestjs/cli\
	&& useradd -m app_backend\
	&& nest new -p npm /home/app_backend/backend\
	&& chown -R app_backend:app_backend /home/app_backend

USER app_backend
WORKDIR /home/app_backend/backend

CMD ["npm", "run", "start:dev"]