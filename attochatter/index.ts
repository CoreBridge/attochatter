import * as signalR from "@microsoft/signalr";

const canary: HTMLDivElement = document.querySelector(".ts-canary");
canary.innerHTML = "✅";
canary.title = "TS booted";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();

connection.on("pong", (response: string) => {
    canary.innerHTML = "🌐";
    canary.title = "TS booted, signalr online";
});

const divMessages: HTMLDivElement = document.querySelector(".messages");
//connection.on(??, () => {
//    const m = document.createElement("div");
//    m.innerHTML = `<div><div class="">${?}</div><div class="">${?}</div></div>`;

//    divMessages.appendChild(m);
//    divMessages.scrollTop = divMessages.scrollHeight;
//});

const errorBox: HTMLDivElement = document.querySelector(".error-box");
connection.start().catch((err) => errorBox.textContent = err).then(() => {
    connection.send("Ping");
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
    //connection.?("chat", username, chat.value).then(
    //    () => (chat.value = "")
    //);
}