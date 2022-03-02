-- drop table user;
-- drop table loggedInUsers;
-- drop table messages;

create table user(email varchar(100),
                password varchar(100),
                firstname varchar(100),
                familyname varchar(100),
                gender varchar(100),
                city varchar(100),
                country varchar(100),
                primary key(email));

create table loggedInUsers(token varchar(100), email varchar(100) references user(email), primary key(token));

create table messages(fromEmail varchar(100),toEmail varchar(100) references user(email), message varchar(200))
