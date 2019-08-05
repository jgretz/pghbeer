create table beer
(
  id int PRIMARY KEY,
  breweryId int not null,
  name varchar(50) not null,
  description varchar(255),
  style varchar(50),
  abv decimal,

  active bit not null,
)