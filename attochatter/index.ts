import * as signalR from "@microsoft/signalr";

let chatroom = "";
const canary: HTMLDivElement = document.querySelector(".ts-canary");
const chatrooms: HTMLDivElement = document.querySelector(".chatrooms");
const chatroomInput: HTMLInputElement = document.querySelector(".chatroom");
const chatroomButton: HTMLDivElement = document.querySelector(".chatroom-join");
chatroomButton.onclick = () => {
    chatroom = chatroomInput.value;
    connection.send("joinChatroom", chatroom);
    connection.send("listChatrooms");
}

canary.innerHTML = "✅";
canary.title = "TS booted";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://cbchat.duckdns.org/hub")
    .build();


connection.on("pong", (response: string) => {
    canary.innerHTML = "🌐";
    canary.title = "TS booted, signalr online";
});
connection.on("listChatrooms", (response: string[]) => {
    for (var i = 0; i < response.length; i++) {
        const chatroomName = response[i];
        const m = document.createElement("div");
        m.textContent = `${chatroomName}`;
        chatrooms.appendChild(m);
    }
});

const divMessages: HTMLDivElement = document.querySelector(".messages");

connection.on("chat", (username: string, message: string) => {
    const m = document.createElement("div");
    m.textContent = `${username}: ${message}`;

    divMessages.appendChild(m);
    divMessages.scrollTop = divMessages.scrollHeight;
});

const errorBox: HTMLDivElement = document.querySelector(".error-box");
connection.start().catch((err) => errorBox.textContent = err).then(() => {
    connection.send("Ping");
    connection.send("listChatrooms");
});

const chat: HTMLInputElement = document.querySelector(".chat");
chat.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
        send();
    }
});

document.querySelector(".send").addEventListener("click", send);


function send() {
    const username = (document.querySelector(".username") as HTMLInputElement).value;
    connection.send("chat", username, chat.value, chatroom).then(
        () => (chat.value = "")
    );
}