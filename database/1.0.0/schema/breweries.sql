create table breweries
(
  id SERIAL PRIMARY KEY,
  name VARCHAR (80) NOT NULL,

  create_date TIMESTAMP NOT NULL,
  update_date TIMESTAMP NOT NULL
)