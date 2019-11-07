delete from styles;
alter sequence "styles_id_seq" restart with 1;

delete from breweries;
alter sequence "breweries_id_seq" restart with 1;

delete from events;
alter sequence "events_id_seq" restart with 1;

delete from beers;
alter sequence "beers_id_seq" restart with 1;

delete from users;
alter sequence "users_id_seq" restart with 1;

delete from stats;
alter sequence "stats_id_seq" restart with 1;