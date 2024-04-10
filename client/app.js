

var submitButton = document.querySelector("#submit-button");
var createuserbutton = document.querySelector("#new-user");
var createButton = document.querySelector("#create");
var transitionloginButton = document.querySelector("#existing-user");
var loginButton = document.querySelector("#login-button");
var logoutButton = document.querySelector("#logout");

createButton.onclick = function (){
    // playerName.value = "";
    // playerGender.value = "male"; 
    // playerAdventureType.value = "haunted mansion";
    updateCurrentPlayerFromServer(0);
    document.querySelector("#create-player").style.display = "block";
    document.querySelector("#player-list-block").style.display = "block";
}
submitButton.onclick = function () {
    var playerName = document.querySelector("#player-name");
    var playerGender = document.querySelector("#player-gender");
    var playerAdventureType = document.querySelector("#player-adventure-type");
    data = "name=" + encodeURIComponent(playerName.value);
    data += "&gender=" + encodeURIComponent(playerGender.value);
    data += "&adventure=" + encodeURIComponent(playerAdventureType.value);
    playerName.value = '';
    playerGender.value = 'male';
    playerAdventureType.value = "haunted mansion";
    fetch("http://localhost:8080/players", {
        credentials: "include",
        method: "POST",
        body: data,
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(function (response) {
        loadPlayersFromServer();
        loadRoomsFromServer();
    })

};
createuserbutton.onclick = function () {
    var username = document.querySelector("#name");
    var lastname = document.querySelector("#last_name");
    var useremail = document.querySelector("#email");
    var userpassword = document.querySelector("#password");
    data = "name=" + encodeURIComponent(username.value);
    data += "&last_name=" + encodeURIComponent(lastname.value);
    data += "&email=" + encodeURIComponent(useremail.value);
    data += "&password=" + encodeURIComponent(userpassword.value);
    username.value = "";
    lastname.value = "";
    useremail.value = "";
    userpassword.value = "";
    fetch("http://localhost:8080/users", {
        credentials: "include",
        method: "POST",
        body: data,
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(function (response) {
        if (response["status"] === 201){
            document.querySelector("#user-form").style.display = "none";
            document.querySelector("#user-login").style.display = "block";
            var creationmessage = document.querySelector("#signin-message-paragraph")
            creationmessage.textContent = "Congratulations you created an account! Now login ;)"
            setTimeout(function () {
                creationmessage.textContent = "";
            }, 7000);
        }else{
            response.text().then(function(errorMessage) {
                var errorMessageElement = document.querySelector("#error-message-paragraph");
                errorMessageElement.textContent = errorMessage;

                setTimeout(function () {
                    errorMessageElement.textContent = "";
                }, 7000);
            })
        }
    })

};
transitionloginButton.onclick = function () {
    document.querySelector("#user-form").style.display = "none";
    document.querySelector("#user-login").style.display = "block";

};
loginButton.onclick = function () {
    var useremail = document.querySelector("#login-email");
    var userpassword = document.querySelector("#login-password");
    data = "email=" + encodeURIComponent(useremail.value);
    data += "&password=" + encodeURIComponent(userpassword.value);
    useremail.value = "";
    userpassword.value = "";
    fetch("http://localhost:8080/sessions", {
        credentials: "include",
        method: "POST",
        body: data,
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(function (response) {
        if (response["status"] === 201){
        document.querySelector("#user-login").style.display = "none";
        document.querySelector("#create-player").style.display = "block";
        document.querySelector("#player-list-block").style.display = "block";
        var creationmessage = document.querySelector("#signin-message-paragraph")
            creationmessage.textContent = "You are now logged in!"
            setTimeout(function () {
                creationmessage.textContent = "";
            }, 7000);
        loadPlayersFromServer();
        loadRoomsFromServer();
        }else{

            var errorMessageElement = document.querySelector("#error-message-paragraph");
            errorMessageElement.textContent = "incorrect email or password";

            // console.log('Inserting error message:', errorMessageElement);
            setTimeout(function () {
                errorMessageElement.textContent = "";
            }, 7000);
        }
    })

};
logoutButton.onclick = function (){
    
    fetch("http://localhost:8080/sessions", {
        credentials: "include",
        method: "DELETE",
    }).then(function (response) {
        console.log("logged out!");
        if (response["status"] === 200){
            document.querySelector("#user-form").style.display = "block";
            document.querySelector("#create-player").style.display = "none";
            document.querySelector("#game-section").style.display = "none";
            document.querySelector("#player-list-block").style.display = "none";
        }
    });
    

}

function loadPlayersFromServer() {
    fetch("http://localhost:8080/players", {
        credentials: "include",
    }).then(function (response) {
            // console.log("this is the status",response["status"])
            if (response["status"] === 201){
            response.json().then(function (data) {
            
            document.querySelector("#player-list-block").style.display = "block";
            document.querySelector("#user-form").style.display = "none";
            document.querySelector("#create-player").style.display = "block";
            document.querySelector("#game-section").style.display = "none";
            document.querySelector("#user-login").style.display = "none";       

            console.log("Received messages from server:", data);
            mysteryMessages = data;
            var playerList = document.querySelector("#player-list");
            playerList.innerHTML = "";
            
            mysteryMessages.forEach(function (message) {
                var playergender;
                if (message.gender === 'male') {
                    playergender = '\u2642 ';
                }else if (message.gender === 'female'){
                    playergender = '\u2640 ';
                }else {
                    playergender = '\u263F ';
                }
                var newlistItem = document.createElement("li");
                var playerdiv = document.createElement("div");
                
                playerdiv.innerHTML = playergender + message.name +'<br>';
                playerdiv.innerHTML += message.adventure_name + '<br>';
                playerdiv.innerHTML += "HP:" + message.player_health;
                playerdiv.classList.add("playerinside");

                var deletebutton = document.createElement("button");
                deletebutton.innerHTML = "Delete";
                deletebutton.classList.add("deletebutton")
                deletebutton.onclick = function(){
                    var confirmation = confirm(`Are you sure you want to delete ${message.name}?`);
                    if (confirmation) {
                    deletePlayerFromServer(message.id);
                    }
                };

                var loadbutton = document.createElement("button");
                loadbutton.innerHTML = "Load";
                loadbutton.classList.add("loadbutton")
                loadbutton.onclick = function(){
                    updateCurrentPlayerFromServer(message.id);
                };
                
                var editbutton = document.createElement("button");
                editbutton.innerHTML = "Edit";
                editbutton.classList.add("editbutton")
                
                editbutton.onclick = function () {
                    var editForm = document.querySelector("#editForm");
                    var createform = document.querySelector("#create-player");
                    var gamescreen = document.querySelector("#game-section");
                    var currentscreen;
                
                    if (gamescreen.style.display === "block") {
                        gamescreen.style.display = "none";
                        currentscreen = gamescreen;
                    }
                
                    if (createform.style.display === "block") {
                        createform.style.display = "none";
                        currentscreen = createform;
                    }
                
                    editForm.style.display = "block";
                
                    var submitbutton = document.querySelector("#submitchanges");
                    var cancelbutton = document.querySelector("#cancel");
                    var nameInput = document.querySelector("#newName");
                    var genderSelect = document.querySelector("#gender");
                
                    nameInput.value = message.name;
                    genderSelect.value = message.gender;
                
                    submitbutton.onclick = function () {
                        const newName = nameInput.value;
                        const newGender = genderSelect.value;
                
                        if (newName !== "" || newGender !== "") {
                            updatePlayerDataOnServer(message.id, newName, newGender,message.player_health, message.room_id);
                        }
                        editForm.style.display = "none";
                        currentscreen.style.display = "block";
                    };
                
                    cancelbutton.onclick = function () {
                        editForm.style.display = "none";
                        currentscreen.style.display = "block";
                    };
                };
                
                
                

                var buttondiv = document.createElement("div");
                buttondiv.appendChild(loadbutton);
                buttondiv.appendChild(editbutton);
                buttondiv.appendChild(deletebutton);

                playerList.appendChild(playerdiv);
                playerList.appendChild(buttondiv);
                playerList.appendChild(newlistItem);
            })
        })
        }else{
            document.body.className = "default-background";
        }
        });
}
function deletePlayerFromServer (playerId) { 
    fetch("http://localhost:8080/players/" + playerId, {
        credentials: "include",
        method: "DELETE" 
    }).then(function (response) {
         console.log("player deleted!");
        loadPlayersFromServer();
        loadRoomsFromServer();
    });
}
function updateCurrentPlayerFromServer (playerId){
    fetch("http://localhost:8080/current_player/" + playerId, {
        credentials: "include",
        method: "PUT" 
      }).then(function (response) {
           console.log("current player updated to ",playerId);
          loadPlayersFromServer();
          loadRoomsFromServer();
      });
      
}
function updatePlayerDataOnServer(playerId, newName, newGender, new_player_health, new_room_id) {
    const data = {
        name: newName,
        gender: newGender,
        player_health: new_player_health,
        room_id: new_room_id
    };
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (playerId != 0) {
    fetch("http://localhost:8080/players/" + playerId, {
        credentials: "include",
        method: "PUT",
        headers: headers,
        body: JSON.stringify(data)
    }).then(function (response) {
        console.log("Player's updated with", newName, newGender);
        loadPlayersFromServer();
        loadRoomsFromServer();
    });
    }
}
function loadRoomsFromServer(){
    fetch("http://localhost:8080/current_player",{
        credentials: "include",
    }).then(function (response) {
        if (response["status"] === 200){
        response.json().then(function (data) {
        
        // document.querySelector("#player-list-block").style.display = "block";
        // document.querySelector("#user-form").style.display = "none";
        // document.querySelector("#create-player").style.display = "none";
        // document.querySelector("#game-section").style.display = "block";
        // document.querySelector("#user-login").style.display = "none";
                    console.log("the current player is now",data[0])
                    currentPlayer = data[0];
                    if (currentPlayer === 0) {
                        document.body.className = "default-background";
                        document.querySelector("#game-section").style.display = "none";
                    } else {
                        document.querySelector("#create-player").style.display = "none";
                        document.querySelector("#game-section").style.display = "block";
                        document.querySelector("#player-list-block").style.display = "block";
                        fetch("http://localhost:8080/players/" + currentPlayer, {
                            credentials: "include",
                        }).then(function (response) {
                            response.json().then(function (currentPlayerData) {
                                console.log("this is the current player",currentPlayerData);
                          
                        fetch("http://localhost:8080/rooms/" + currentPlayerData.room_id, {
                             credentials: "include",
                        }).then(function (response) {
                            response.json().then(function (currentRooms) {
                                console.log("this is the room",currentRooms);
                                updateUI([currentRooms.left_name,currentRooms.right_name],currentPlayerData.adventure_name,currentRooms.message);
                                var new_room_id;
                                var commandsubmitbutton = document.querySelector("#command-submit-button");
                                var commandInput = document.querySelector("#command-input");
                                commandsubmitbutton.onclick = function (){
                                if (commandInput.value === currentRooms.right_name){
                                    new_room_id = currentRooms.right_id;
                                } else{
                                    new_room_id = currentRooms.left_id;
                                }
                                console.log("this is the bad data",currentPlayerData.id, currentPlayerData.name, currentPlayerData.gender, currentPlayerData.player_health, new_room_id)
                                updatePlayerDataOnServer(currentPlayerData.id, currentPlayerData.name, currentPlayerData.gender, currentPlayerData.player_health, new_room_id);
                            }
                            })
                        })
                            })
                        })
                    }
                    
                })
            }
            })
}

function updateUI(commands,game,message) {

    
    document.body.className = game.replaceAll(' ','');
    
    var messageElement = document.querySelector("#message");
    messageElement.textContent = message;

    var commandInput = document.querySelector("#command-input");
    commandInput.placeholder = "Type your command here"; 
    commandInput.value = ""; 
    commandInput.autocomplete = "off"; 

    var oldDatalist = document.querySelector("#command-list");
    if (oldDatalist) {
        oldDatalist.remove();
    }
    commandInput.setAttribute("list", "command-list");
    var datalist = document.createElement("datalist");
    datalist.id = "command-list";
    
    commands.forEach(function (command) {
        var option = document.createElement("option");
        option.value = command;
        datalist.appendChild(option);
    });
    commandInput.appendChild(datalist);
}



loadPlayersFromServer();
loadRoomsFromServer();