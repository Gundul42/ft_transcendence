fast:
	docker-compose up

build:
	docker-compose up --build

fclean:
	docker-compose down --rmi all -v