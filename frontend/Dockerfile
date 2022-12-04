FROM ubuntu:latest

RUN apt-get update\
	&& apt-get upgrade -y\
	&& apt-get install -y curl\
	git\
	&& curl -fsSL https://deb.nodesource.com/setup_19.x | bash - \
	&& apt-get install -y nodejs

RUN apt-get install -y nginx\
	&& rm -f /etc/nginx/sites-enabled/*\
	&& useradd -u 1000 app_frontend\
	&& usermod -aG app_frontend www-data\
	&& chown -R app_frontend:app_frontend /var/www\
	&& npm install -g client-oauth2

CMD ["nginx", "-g", "daemon off;"]