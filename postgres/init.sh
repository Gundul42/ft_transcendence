psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
"CREATE TABLE IF NOT EXISTS sessions (
	sessionid VARCHAR(20) PRIMARY KEY,
	ip_address VARCHAR(15),
	userid serial,
	created_on TIMESTAMP NOT NULL,
	state VARCHAR(20)
	);
CREATE TABLE IF NOT EXISTS users (
	userid INT PRIMARY KEY,
	email VARCHAR(50),
	full_name VARCHAR(100),
	access_token VARCHAR(64),
	token_type VARCHAR(50),
	expires_in INT,
	refresh_token VARCHAR(64),
	scope VARCHAR(50),
	created_at INT
	);"