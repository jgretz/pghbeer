create table stats
(
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  opinion INT NOT NULL,
  beer_id INT NOT NULL,
  user_id INT NOT NULL,
  event_id INT NOT NULL,

  create_date TIMESTAMP NOT NULL,
  update_date TIMESTAMP NOT NULL
);

create index stats_user on stats (user_id);