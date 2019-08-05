create table beer
(
  id int PRIMARY KEY,
  breweryId int not null,
  name varchar(50) not null,
  active bit not null,
)