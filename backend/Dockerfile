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
	&& groupadd -g 4200 app_backend\
	&& useradd app_backend -u 4200 -g 4200 -m -s /bin/bash\
	&& nest new -p npm /home/app_backend/backend\
	&& chown -R app_backend:app_backend /home/app_backend

COPY --chown=app_backend:app_backend "./resources/package.json" "/home/app_backend/backend/"

USER app_backend

WORKDIR /home/app_backend/backend

RUN npm install\
	&& npm install prisma --save-dev\
	&& npx prisma\
	&& npx prisma init

COPY --chown=app_backend:app_backend "./prisma/schema.prisma" "/home/app_backend/backend/prisma/"
COPY --chown=app_backend:app_backend "./resources/init.sh" "/"
COPY --chown=app_backend:app_backend "./src" "/home/app_backend/backend/src"

RUN npm install @prisma/client\
	&& npx prisma generate

CMD [ "/bin/bash", "/init.sh"]