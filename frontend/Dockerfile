FROM ubuntu:latest

RUN apt-get update\
	&& apt-get upgrade -y\
	&& apt-get install -y curl\
	git\
	&& curl -fsSL https://deb.nodesource.com/setup_19.x | bash - \
	&& apt-get install -y nodejs\
	&& npm i -g @nestjs/cli

RUN useradd -m app_frontend\
	&& nest new -p npm /home/app_frontend/frontend\
	&& chown -R app_frontend:app_frontend /home/app_frontend

USER app_frontend
WORKDIR /home/app_frontend/frontend

CMD ["npm", "run", "start:dev"]