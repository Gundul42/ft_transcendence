FROM ubuntu:latest

RUN apt update\
	&& apt upgrade -y\
	&& apt install -y curl\
	git\
	apt-utils\
	&& curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
	&& apt-get install -y nodejs

RUN mkdir -p /var/www/html\
	&& echo "yes" | npx create-react-app /var/www/html/frontend --template typescript

WORKDIR /var/www/html/frontend

COPY ./resources/package.json .
COPY ./src /var/www/html/frontend/src

RUN npm install -g npm@latest\
	&& npm install\
	&& npm install --global serve\
	&& npm --prefix /var/www/html/frontend run build

CMD [ "serve", "-s", "build" ]