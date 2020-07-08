DROP TABLE IF EXISTS cityData;
CREATE TABLE IF NOT EXISTS cityData (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude numeric,
    longitude numeric
);
