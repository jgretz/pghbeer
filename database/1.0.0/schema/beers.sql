create table beers
(
  id SERIAL PRIMARY KEY,
  name VARCHAR (80) NOT NULL,
  abv FLOAT,
  brewery_id INT NOT NULL,
  style_id INT NOT NULL,

  create_date TIMESTAMP NOT NULL,
  update_date TIMESTAMP NOT NULL
)