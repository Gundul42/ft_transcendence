FROM ubuntu:latest

RUN apt update\
	&& apt upgrade -y\
	&& apt install -y curl\
	git\
	apt-utils\
	&& curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
	&& apt-get install -y nodejs

RUN apt install -y postgresql-client\
	&& npm install -g npm@latest\
	&& npm i -g @nestjs/cli\
	&& mkdir -p /home/app_backend\
	&& nest new -p npm /home/app_backend/backend

COPY "./resources/package.json" "/home/app_backend/backend/"

WORKDIR /home/app_backend/backend

RUN npm install\
	&& npm install prisma --save-dev\
	&& npx prisma\
	&& npx prisma init

COPY "./prisma/schema.prisma" "/home/app_backend/backend/prisma/"
COPY "./resources/content" "/home/app_backend/content"
COPY "./resources/init.sh" "/"
COPY "./src" "/home/app_backend/backend/src"

RUN npm install @prisma/client\
	&& npx prisma generate

CMD [ "/bin/bash", "/init.sh"]