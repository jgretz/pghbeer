create table eventbeerlist
(
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL,
  beer_id INT NOT NULL,

  create_date TIMESTAMP NOT NULL,
  update_date TIMESTAMP NOT NULL
)