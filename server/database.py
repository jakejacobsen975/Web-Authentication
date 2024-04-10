import sqlite3


def dict_factory(cursor, row):
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}
class MysteryDB:

    def __init__(self):
        self.conn = sqlite3.connect("database.db")
        self.conn.row_factory = dict_factory
        self.cursor = self.conn.cursor()
    def updateCurrentPlayer(self,currentplayer):
        self.cursor.execute(
            "UPDATE currentPlayer SET current_player = ?",(currentplayer,)
        )
        self.conn.commit()
    def getCurrentPlayer(self):
        self.cursor.execute(
            "select * from currentPlayer"
        )
        currentplayer = self.cursor.fetchone()
        # print("this is the current player",currentplayer["current_player"])
        return currentplayer["current_player"]
    def createPlayer(self,name,gender,adventure_name,player_health):
        if adventure_name == 'haunted mansion':
            room_id = 1
        elif adventure_name == 'lone hiker':
            room_id = 2
        elif adventure_name == 'abandoned town':
            room_id = 3
        data = [name,gender,adventure_name,room_id,player_health ]
        self.cursor.execute("insert into players (name,gender,adventure_name,room_id,player_health) values (?,?,?,?,?)",(data)) # or , data
        self.conn.commit()
        self.cursor.execute("select * from players")
        players = self.cursor.fetchall()
        currentplayer = players[-1]['id']
        self.updateCurrentPlayer(currentplayer)
    def createUser(self,name,lastname,email,password):
        self.cursor.execute("insert into users (name,last_name,email,password) values (?,?,?,?)",(name,lastname,email,password))
        self.conn.commit()
    def checkUserEmail(self,email):
        self.cursor.execute("SELECT * FROM users WHERE email = ?",(email,))
        user = self.cursor.fetchone()
        return user
    def getPlayer(self,player_id):
        data = [player_id]
        self.cursor.execute("SELECT * FROM players WHERE id = ?",data)
        player = self.cursor.fetchone()
        return player
    def getPlayers(self):
        self.cursor.execute(
        "SELECT * FROM players"
        )
        players = self.cursor.fetchall()
        return players
    def deletePlayer(self,player_id):
        self.cursor.execute("DELETE FROM players WHERE id = ?", (player_id,))
        self.conn.commit()
        self.updateCurrentPlayer(0)
    def updatePlayerinfo(self,player_id, new_name, new_gender, new_player_health, new_room_id):
        self.cursor.execute(
            "UPDATE players SET name = ?, gender = ?, player_health = ?, room_id = ? WHERE id = ?",(new_name,new_gender,new_player_health,new_room_id,player_id,)
        )
        self.conn.commit()
    def getRoomsData(self,current_room):
        print("this is the current room_id",current_room)
        self.cursor.execute(
            """
            select rightR.name as right_name, leftR.name as left_name, currentroom.right_room_id as right_id, 
            currentroom.left_room_id as left_id, currentroom.message as message
            from rooms as currentroom
            inner join rooms as rightR on currentroom.right_room_id = rightR.id
            inner join rooms as leftR on currentroom.left_room_id = leftR.id
            where currentroom.id = ?;
            """, (current_room,)
        )
        rooms = self.cursor.fetchall()
        print("this is the rooms",rooms)
        if len(rooms) != 0:
            return rooms[0]
        return rooms
    



# CREATE TABLE restaurants(
#   Name TEXT primary keys
# );





