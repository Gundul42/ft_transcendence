all:
	docker-compose up --remove-orphans

clean:
	docker-compose down

re: clean all