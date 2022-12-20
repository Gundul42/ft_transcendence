FROM ubuntu:latest

RUN apt update\
	&& apt upgrade -y\
	&& apt install -y curl\
	git\
	&& curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
	&& apt-get install -y nodejs

RUN apt install -y nginx\
	&& rm -f /etc/nginx/sites-enabled/*\
	&& mkdir -p /var/www/html\
	&& echo "yes" | npx create-react-app /var/www/html/frontend --template typescript

CMD [ "npm", "--prefix", "/var/www/html/frontend", "start" ]

#CMD ["nginx", "-g", "daemon off;"]