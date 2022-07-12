"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signalR = require("@microsoft/signalr");
var chatroom = "";
var canary = document.querySelector(".ts-canary");
var chatrooms = document.querySelector(".chatrooms");
var chatroomInput = document.querySelector(".chatroom");
var chatroomButton = document.querySelector(".chatroom-join");
chatroomButton.onclick = function () {
    chatroom = chatroomInput.value;
    connection.send("joinChatroom", chatroom);
    connection.send("listChatrooms");
};
canary.innerHTML = "✅";
canary.title = "TS booted";
var connection = new signalR.HubConnectionBuilder()
    //.withUrl("https://cbchat.duckdns.org/hub")
    .withUrl("/hub")
    .build();
connection.on("pong", function (response) {
    canary.innerHTML = "🌐";
    canary.title = "TS booted, signalr online";
});
connection.on("listChatrooms", function (response) {
    for (var i = 0; i < response.length; i++) {
        var chatroomName = response[i];
        var m = document.createElement("div");
        m.textContent = "" + chatroomName;
        chatrooms.appendChild(m);
    }
});
var divMessages = document.querySelector(".messages");
connection.on("chat", function (username, message) {
    var m = document.createElement("div");
    m.textContent = username + ": " + message;
    divMessages.appendChild(m);
    divMessages.scrollTop = divMessages.scrollHeight;
});
var errorBox = document.querySelector(".error-box");
connection.start().catch(function (err) { return errorBox.textContent = err; }).then(function () {
    connection.send("Ping");
    connection.send("listChatrooms");
});
var chat = document.querySelector(".chat");
chat.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        send();
    }
});
document.querySelector(".send").addEventListener("click", send);
function send() {
    var username = document.querySelector(".username").value;
    connection.send("chat", username, chat.value, chatroom).then(function () { return (chat.value = ""); });
}
