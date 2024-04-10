# The Mysteries of Forgotten Paths

## Resources

### Users

**Attributes:**

  1. name -> string
  1. last_name -> string
  1. email -> string
  1. password -> string

### Players

**Attributes:**

  1. name -> string
  1. gender -> string
  1. adventure name -> string
  1. room -> integer
  1. player health -> integer

### current_player

  **Attributes:**

  1. current_player -> integer

### rooms

  **Attributes:**

  1. name -> string
  1. message -> string
  1. right room -> string
  1. left room -> string

## Schema

``` sql
CREATE TABLE currentPlayer (
    current_player INTEGER
)
```

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL
  )
```

```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK(gender IN ('male','female','other')),
  adventure_name INTEGER,
  room_id INTEGER,
  player_health INTEGER,

  FOREIGN KEY(room_id) REFERENCES rooms(id)
  )
```

```sql
CREATE TABLE rooms (
  id INTEGER PRIMARY KEY, 
  name INTEGER NOT NULL,
  message TEXT NOT NULL,
  right_room_id INTEGER,
  left_room_id INTEGER,
          
  FOREIGN KEY(right_room_id) REFERENCES rooms(id)
  FOREIGN KEY(left_room_id) REFERENCES rooms(id)
  )
```

## REST Endpoints

Name                       | Method | Path
---------------------------|--------|-------------------------
Retrieve player collection | GET    | /players
Retrieve player            | GET    | /players/*\<id\>*
Create player              | POST   | /players
Update player              | PUT    | /players/*\<id\>*
Delete player              | DELETE | /players/*\<id\>*
Retrieve current player    | GET    | /current_player
Update current player      | PUT    | /current_player/*\<id\>*
Retrieve current rooms     | GET    | /rooms/*\<id\>*
Create user                | POST   | /users
Create session             | POST   | /sessions
Delete session             | DELETE | /sessions

## Password hashing method

The bcrypt library was used to hash the password when the user first signs up with the ```.hash()``` method. Then the ```.verify()``` method was used to verify the user information when logging in. documentation can be found [here](https://passlib.readthedocs.io/en/stable/lib/passlib.hash.bcrypt.html)

## Creating database

To create the database if if gets deleted run the following commands ```./make_tables``` ```./insert_data```
these two commands will create the database.db file and then populate it with the game data
if either of these files get corrupted or need to be changed they can be recompiled with the command ```chmod +x <filename>```
