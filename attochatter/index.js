"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signalR = require("@microsoft/signalr");
var canary = document.querySelector(".ts-canary");
canary.innerHTML = "✅";
canary.title = "TS booted";
var connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();
connection.on("pong", function (response) {
    canary.innerHTML = "🌐";
    canary.title = "TS booted, signalr online";
});
var divMessages = document.querySelector(".messages");
//connection.on(??, () => {
//    const m = document.createElement("div");
//    m.innerHTML = `<div><div class="">${?}</div><div class="">${?}</div></div>`;
//    divMessages.appendChild(m);
//    divMessages.scrollTop = divMessages.scrollHeight;
//});
var errorBox = document.querySelector(".error-box");
connection.start().catch(function (err) { return errorBox.textContent = err; });
var chat = document.querySelector(".chat");
chat.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        send();
    }
});
document.querySelector(".send").addEventListener("click", send);
function send() {
    var username = document.querySelector(".username").value;
    //connection.?("chat", username, chat.value).then(
    //    () => (chat.value = "")
    //);
}
connection.send("ping");
