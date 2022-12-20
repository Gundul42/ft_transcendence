psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
"CREATE TABLE IF NOT EXISTS sessions (
	sessionid VARCHAR(20) PRIMARY KEY,
	ip_address VARCHAR(15),
	userid serial
	created_on TIMESTAMP NOT NULL,
	state VARCHAR(20)
	);