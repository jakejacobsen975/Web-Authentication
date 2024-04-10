from flask import Flask, request, g
from database import MysteryDB
from session_store import SessionStore
from passlib.hash import bcrypt

session_store = SessionStore()

class MyFlask(Flask):
    def add_url_rule(self, rule, endpoint=None, view_func=None, **options): 
        return super().add_url_rule (rule, endpoint, view_func, provide_automatic_options=False, **options)

def load_session_data():
    print("the cookies",request.cookies)
    #load the session ID from cookie data
    session_id = request.cookies.get("session_id")
    # if session ID is present:
    if session_id:
        # load the session data using the session ID
        session_data = session_store.getSession(session_id)   
     # if session Id or session data could not be loaded:
    if session_id == None or session_data == None:
         # create a new session with a new session ID
        session_id = session_store.createSession()
        # load the session data using the new session ID
        session_data = session_store.getSession(session_id)
    g.session_id = session_id
    g.session_data = session_data

app = MyFlask(__name__)
@app.before_request
def before_request_func():
    load_session_data()

@app.after_request
def after_request_func(response):
    print("session_id ",g.session_id)
    print("session_data ",g.session_data)

    # send a cookie with the session ID
    response.set_cookie("session_id", g.session_id, samesite="None", secure=True)

    print("response", request.headers.get("Origin"))
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.route("/<path:path>", methods = ["OPTIONS"])
def cors_preflight(path):
    return "", {
        # "Access-Control-Allow-Origin": "*" ,       
        "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
@app.route("/players", methods=["GET"])
def retrieve_player_collection():
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    db = MysteryDB()
    players = db.getPlayers()
    if players or players == []:
        return players,201
    else:
        return "players not found", 404
@app.route("/players/<int:player_id>",methods=["GET"])# <> path primaniter
def retrieve_player(player_id):
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    db = MysteryDB()
    player = db.getPlayer(player_id)
    print("retieve player member with ID:",player_id)
    if player:
        return player
    else:
        return "player with ID {} not found".format(player_id), 404
    
@app.route("/players", methods=["POST"])
def create_player():
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    db = MysteryDB()
    name = request.form['name']
    gender = request.form['gender']
    adventure = request.form['adventure']
    player_health = 10 
    db.createPlayer(name,gender,adventure,player_health)
    return "Created", 201



@app.route("/players/<int:player_id>",methods=["PUT"])
def update_player(player_id):
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    db = MysteryDB()
    player = db.getPlayer(player_id)

    if player:
        new_name = request.json.get("name", None)
        new_gender = request.json.get("gender", None)
        new_player_health = request.json.get("player_health", None)
        new_room_id = request.json.get("room_id", None)
        print("this is the data I got here",player_id, new_name,new_gender,new_player_health,new_room_id)
        if new_name:
            db.updatePlayerinfo(player_id, new_name,new_gender,new_player_health,new_room_id)
            return "Player updated", 200
    else:
        
        return "Player with ID {} not found".format(player_id), 404
    
@app.route("/players/<int:player_id>",methods=["DELETE"])
def delete_player(player_id):
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    db = MysteryDB()
    player = db.getPlayer(player_id)
    if player:
        db.deletePlayer(player_id)
        return "Player Deleted!", 200
    else:
        return "player with ID {} not found".format(player_id), 404
    
@app.route("/current_player", methods=["GET"])
def retrieve_current_player():
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    db = MysteryDB()
    current_player = db.getCurrentPlayer()
    if current_player or current_player == 0:
        return [current_player]
    else:
        return "currentplayer not found", 404
    
@app.route("/current_player/<int:player_id>",methods=["PUT"])
def update_current_player(player_id):
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    db = MysteryDB()
    player = db.getPlayer(player_id)
    if player:
        db.updateCurrentPlayer(player_id)
        return player
    elif player_id == 0:
        db.updateCurrentPlayer(player_id)
        return ''
    else:
        return "player with ID {} not found".format(player_id), 404
    
@app.route("/rooms/<int:room_id>", methods=["GET"])
def retrieve_current_rooms(room_id):
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    db = MysteryDB()
    print("this is what my rooms data looks like",room_id)
    rooms = db.getRoomsData(room_id)
    if rooms:
        return rooms
    else:
        return "player with room_ID {} not found".format(room_id), 404
@app.route("/users", methods=["POST"])
def create_user():
    db = MysteryDB()
    name = request.form['name']
    lastname = request.form['last_name']
    email = request.form['email']
    password = request.form['password']
    if name == '':
        return "Username can not be empty", 400
    if lastname == '':
        return "User lastname can not be empty", 400
    
    if not is_valid_email(email):
        return "Invalid email format", 400
    
    existing_user = db.checkUserEmail(email)
    if existing_user is not None:
        return f"User with email {email} already exists", 401
    
    if 'password' in password:
        return "what are you thinking! Please not have 'password' in your password", 400
    if  password != '':
        password = bcrypt.hash(password)
        db.createUser(name,lastname,email,password)
        return "Created", 201
    return "Invalid input",400
@app.route("/sessions", methods=["POST"])
def login():
    db = MysteryDB()
    email = request.form['email']
    user = db.checkUserEmail(email)
    print("this is the users id",user)
    if user:
        password = request.form['password']
        passwordIsCorrect = bcrypt.verify(password,user['password'])
        print("is password correct",passwordIsCorrect)
        if passwordIsCorrect:
            # userSession = session.createSession() #not use this one?
            g.user_id = user["id"]
            g.session_data = session_store.userlogin(g.session_id,g.user_id)
            return "userSession", 201
    
    return "incorrect email or password",422

@app.route("/sessions", methods=["DELETE"])
def delete_session():
    if "user_id" in g.session_data:
        # session_store.sessionData[g.session_id].pop("user_id")
        del g.session_data["user_id"]
        return "Player Deleted!", 200
    return "Unauthenticated", 401
    
def is_valid_email(email):
    # Simple email format validation without using regular expressions
    if '@' in email and '.' in email:
        return True
    return False
# @app.route("/users", methods=["POST"])
# def create_user():
#     db = MysteryDB()
#     name = request.form['name']
#     lastname = request.form['last_name']
#     email = request.form['email']
#     password = request.form['password']
#     password = bcrypt.hash(password)
#     db.createUser(name,lastname,email,password)
#     return "Created", 201
def run():
    app.run(port=8080)

if __name__ == '__main__':
    run()
