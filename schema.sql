DROP TABLE IF EXISTS cityData;
CREATE TABLE IF NOT EXISTS cityData (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    formatted VARCHAR(255),
    latitude numeric(20,14),
    longitude numeric(20,14)
);
