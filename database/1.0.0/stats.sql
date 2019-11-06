create table stats
(
  id SERIAL PRIMARY KEY,
  beer_id INT NOT NULL,
  opinion INT NOT NULL,
  user_id INT NOT NULL,
  event_id INT NOT NULL,

  create_date TIMESTAMP NOT NULL,
  update_date TIMESTAMP NOT NULL
)