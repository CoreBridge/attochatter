"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signalR = require("@microsoft/signalr");
var currentChatroom = "";
var canary = document.querySelector(".ts-canary");
var chatrooms = document.querySelector(".chatrooms");
var chatroomInput = document.querySelector(".chatroom");
var addChatroomButton = document.querySelector(".chatroom-join");
var messagesEmpty = true;
canary.innerHTML = "✅";
canary.title = "TS booted";
var connection = new signalR.HubConnectionBuilder()
    .withUrl("https://attochatter.azurewebsites.net/hub")
    .build();
function curryJoinChatroom(button, chatroomName) {
    return function () {
        connection.send("joinChatroom", chatroomName);
        onJoinChatroom(chatroomName);
        button.className = "chatroom-button current";
    };
}
function onJoinChatroom(chatroomName) {
    currentChatroom = chatroomName;
    var lastJoined = document.querySelector(".chatroom-button.current");
    if (lastJoined != null)
        lastJoined.className = "chatroom-button";
    var sysMessageDiv = document.createElement("div");
    sysMessageDiv.textContent = "Joined chatroom \"" + chatroomName + "\"";
    divMessages.appendChild(sysMessageDiv);
}
connection.on("pong", function (response) {
    canary.innerHTML = "🌐";
    canary.title = "TS booted, signalr online";
});
connection.on("listChatrooms", function (response) {
    while (chatrooms.firstChild != null) {
        chatrooms.removeChild(chatrooms.firstChild);
    }
    for (var i = 0; i < response.length; i++) {
        var chatroomName = response[i];
        var chatroomButton = document.createElement("button");
        chatroomButton.className = "chatroom-button";
        if (chatroomName === currentChatroom) {
            chatroomButton.className = chatroomButton.className + " current";
        }
        chatroomButton.textContent = "" + chatroomName;
        chatroomButton.onclick = curryJoinChatroom(chatroomButton, chatroomName);
        chatrooms.appendChild(chatroomButton);
    }
    if (response.length === 0) {
        var emptyMessage = document.createElement("span");
        emptyMessage.textContent = "No chatrooms 😢 Make some ⬇";
        chatrooms.appendChild(emptyMessage);
    }
});
addChatroomButton.onclick = function () {
    currentChatroom = chatroomInput.value;
    connection.send("joinChatroom", currentChatroom);
    connection.send("listChatrooms");
    onJoinChatroom(currentChatroom);
};
var divMessages = document.querySelector(".messages");
connection.on("chat", function (username, message) {
    if (messagesEmpty) {
        divMessages.textContent = "";
        messagesEmpty = false;
    }
    var messageDiv = document.createElement("div");
    messageDiv.className = "message";
    var usernameDiv = document.createElement("strong");
    if (username != null && username.length) {
        usernameDiv.textContent = username + ": ";
    }
    else {
        usernameDiv.textContent = "Unknown User: ";
    }
    messageDiv.appendChild(usernameDiv);
    var textDiv = document.createElement("span");
    textDiv.textContent = message;
    messageDiv.appendChild(textDiv);
    divMessages.appendChild(messageDiv);
    divMessages.scrollTop = divMessages.scrollHeight;
});
var errorBox = document.querySelector(".error-box");
connection.start().catch(function (err) { return errorBox.textContent = err; }).then(function () {
    connection.send("Ping");
    connection.send("joinChatroom", "General");
    onJoinChatroom("General");
    connection.send("listChatrooms");
});
var chat = document.querySelector(".chat");
chat.addEventListener("keyup", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        send();
    }
});
document.querySelector(".send").addEventListener("click", send);
function send() {
    var username = document.querySelector(".username").value;
    connection.send("chat", username, chat.value, currentChatroom).then(function () { return (chat.value = ""); });
}
