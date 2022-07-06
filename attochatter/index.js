"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signalR = require("@microsoft/signalr");
var canary = document.querySelector(".ts-canary");
canary.innerHTML = "✅";
canary.title = "TS booted";
var connection = new signalR.HubConnectionBuilder()
    .withUrl("https://cbchat.duckdns.org/hub")
    .build();
var chatroom = "";
connection.on("pong", function (response) {
    canary.innerHTML = "🌐";
    canary.title = "TS booted, signalr online";
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
