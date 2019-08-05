create table beer
(
  id int PRIMARY KEY,
  eventId int not null,
  userId varchar(36),
  beerId int not null,
  drankAt datetime not null,

  breweryName varchar(50),
  beerName varchar(50),
)