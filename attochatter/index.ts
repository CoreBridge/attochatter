import * as signalR from "@microsoft/signalr";

let currentChatroom = "";
const canary: HTMLDivElement = document.querySelector(".ts-canary");
const chatrooms: HTMLDivElement = document.querySelector(".chatrooms");
const chatroomInput: HTMLInputElement = document.querySelector(".chatroom");
const addChatroomButton: HTMLDivElement = document.querySelector(".chatroom-join");
let messagesEmpty = true;

canary.innerHTML = "⚠";
canary.title = "TS booted";

const globalConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://attochatter.azurewebsites.net/hub")
    .build();
const localConnection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();

const req = new XMLHttpRequest();
req.addEventListener("load", function () {
    (document.querySelector(".username") as HTMLInputElement).value = this.responseText;
});
req.open("GET", "/username");
req.send();


function curryJoinChatroom(button: HTMLButtonElement, chatroomName: string) {
    return function () {
        globalConnection.send("joinChatroom", chatroomName);
        onJoinChatroom(chatroomName);
        button.className = "chatroom-button current";
    }
}
function onJoinChatroom(chatroomName: string) {
    currentChatroom = chatroomName;
    const lastJoined = document.querySelector(".chatroom-button.current");
    if (lastJoined != null)
        lastJoined.className = "chatroom-button";

    const sysMessageDiv = document.createElement("div");
    sysMessageDiv.textContent = `Joined chatroom "${chatroomName}"`;
    divMessages.appendChild(sysMessageDiv);
}

globalConnection.on("pong", (response: string) => {
    canary.innerHTML = "🌐";
    canary.title = "TS booted, signalr online";
});
globalConnection.on("listChatrooms", (response: string[]) => {
    while (chatrooms.firstChild != null) {
        chatrooms.removeChild(chatrooms.firstChild);
    }
    for (var i = 0; i < response.length; i++) {
        const chatroomName = response[i];
        const chatroomButton = document.createElement("button");
        chatroomButton.className = "chatroom-button";
        if (chatroomName === currentChatroom) {
            chatroomButton.className = chatroomButton.className + " current";
        }
        chatroomButton.textContent = `${chatroomName}`;
        chatroomButton.onclick = curryJoinChatroom(chatroomButton, chatroomName);
        chatrooms.appendChild(chatroomButton);
    }
    if (response.length === 0) {
        const emptyMessage = document.createElement("span");
        emptyMessage.textContent = "No chatrooms 😢 Make some ⬇";
        chatrooms.appendChild(emptyMessage);
    }
});
addChatroomButton.onclick = () => {
    currentChatroom = chatroomInput.value;
    globalConnection.send("joinChatroom", currentChatroom);
    globalConnection.send("listChatrooms");
    onJoinChatroom(currentChatroom);
}

const divMessages: HTMLDivElement = document.querySelector(".messages");

globalConnection.on("chat", (username: string, message: string) => {
    if (messagesEmpty) {
        divMessages.textContent = "";
        messagesEmpty = false;
    }
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    const usernameDiv = document.createElement("strong");
    if (username != null && username.length) {
        usernameDiv.textContent = username + ": ";
    } else {
        usernameDiv.textContent = "Unknown User: ";
    }
    messageDiv.appendChild(usernameDiv);
    const textDiv = document.createElement("span");
    textDiv.textContent = message;
    messageDiv.appendChild(textDiv);

    divMessages.appendChild(messageDiv);
    divMessages.scrollTop = divMessages.scrollHeight;
});

const errorBox: HTMLDivElement = document.querySelector(".error-box");
globalConnection.start().catch((err) => errorBox.textContent = err).then(() => {
    globalConnection.send("Ping");
    globalConnection.send("joinChatroom", "General");
    onJoinChatroom("General");
    globalConnection.send("listChatrooms");
});

const chat: HTMLInputElement = document.querySelector(".chat");
chat.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
        send();
    }
});

document.querySelector(".send").addEventListener("click", send);


function send() {
    const username = (document.querySelector(".username") as HTMLInputElement).value;
    globalConnection.send("chat", username, chat.value, currentChatroom).then(
        () => (chat.value = "")
    );
}