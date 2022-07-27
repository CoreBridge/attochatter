import * as signalR from "@microsoft/signalr";

let currentChatroom = "";
const canary: HTMLDivElement = document.querySelector(".ts-canary");
const chatrooms: HTMLDivElement = document.querySelector(".chatrooms");
const chatroomInput: HTMLInputElement = document.querySelector(".chatroom");
const addChatroomButton: HTMLDivElement = document.querySelector(".chatroom-join");
let messagesEmpty = true;
let reactionList = [];

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
    globalConnection.send("getReactions");
});

globalConnection.on("reactions", (response: string[]) => {
    reactionList = response;
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

globalConnection.on("chat", (username: string, message: string, messageID: string) => {
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

    messageDiv.setAttribute('data-id', messageID);

    let currentUser = (document.querySelector(".username") as HTMLInputElement).value;
    //umcomment to disable users from reacting to their own messages
    // if(username != currentUser) {}
        messageDiv.onmouseenter = () => {
            const reactionPalette = getReactionpalette(username, messageID);
            //conditional reaction palette alignment
            if(messageDiv.getBoundingClientRect().width < 250 && username != currentUser) {
                reactionPalette.style.left = "0px";
                reactionPalette.style.right = "unset";
            }
            reactionPalette.onmouseenter = () => {
                reactionPalette.style.opacity = "1";
            };
            messageDiv.appendChild(reactionPalette);
            reactionPalette.style.opacity = "1";
        };
        messageDiv.onmouseleave = () => {
            const reactionPalette = messageDiv.querySelector("div.reaction-palette") as HTMLDivElement;
            if (reactionPalette != null) {
                //timeout allows fade out before removal
                reactionPalette.style.opacity = "0";
                setTimeout(() => {
                    messageDiv.removeChild(reactionPalette);
                }, 200);
            }
        }; 
    // }
    if (username == currentUser)
        messageDiv.classList.add("self");
    divMessages.appendChild(messageDiv);
    divMessages.scrollTop = divMessages.scrollHeight;
});

function getReactionpalette(username: string, messageID: string) {
    const reactionpalette = document.createElement("div");
    reactionpalette.className = "reaction-palette";
    reactionpalette.textContent = "";
    if(!reactionList || reactionList.length == 0)
        globalConnection.send("getReactions");
    for(let reaction of reactionList) {
        reactionpalette.appendChild(createReactionButton(reaction, username, messageID));
    }
    // "Add New Reaction" button
    const addNewReaction = document.createElement("span");
    addNewReaction.textContent = "|";
    const addButton = document.createElement("button");
    addButton.className = "reaction-button add-button";
    addButton.textContent = "+";
    addButton.onclick = () => {
        const newReaction = prompt("Enter new reaction");
        let cleanReaction = newReaction && newReaction.trim();
        if (cleanReaction && !reactionList.includes(cleanReaction)) {
            globalConnection.send("addReaction", newReaction);
        }
    }
    addNewReaction.appendChild(addButton);
    reactionpalette.appendChild(addNewReaction);
    return reactionpalette;
}

function createReactionButton(reaction: string, username: string, messageID: string) {
    const reactionButton = document.createElement("button");
    reactionButton.className = "reaction-button";
    reactionButton.textContent = `${reaction}`;
    reactionButton.onclick = () => {
        globalConnection.send("react", username, messageID, reactionButton.textContent, currentChatroom);
    };  
    return reactionButton;
}

globalConnection.on("react", (messageID: string, reaction: string) => {
    const message = document.querySelector(`[data-id="${messageID}"]`);
    if(message == null)
        return;
    const reactionCounter = message.querySelector(`.reaction-counter[data-reaction="${reaction}"]`);
    if(reactionCounter == null) {
            const reactionPair = document.createElement("div");
                const reactionEmoji = document.createElement("span");
                reactionEmoji.className = "reaction-emoji";
                reactionEmoji.textContent = reaction;
            reactionPair.appendChild(reactionEmoji);
                const reactionCounter = document.createElement("span");
                reactionCounter.className = "reaction-counter";
                reactionCounter.textContent = "1";
                reactionCounter.setAttribute('data-reaction', reaction);
            reactionPair.appendChild(reactionCounter);
        const reactionDiv = message.querySelector('div.reaction-wrapper');
        if(reactionDiv == null) {
            const reactionDiv = document.createElement("div");
            reactionDiv.className = "reaction-wrapper";
            message.appendChild(reactionDiv);
            reactionDiv.appendChild(reactionPair);
        } else
            reactionDiv.appendChild(reactionPair);
    } else {
        const count = parseInt(reactionCounter.textContent) + 1;
        reactionCounter.textContent = count.toString();
    }
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