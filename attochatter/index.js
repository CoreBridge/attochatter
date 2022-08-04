"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signalR = require("@microsoft/signalr");
var currentChatroom = "";
var canary = document.querySelector(".ts-canary");
var chatrooms = document.querySelector(".chatrooms");
var chatroomInput = document.querySelector(".chatroom");
var addChatroomButton = document.querySelector(".chatroom-join");
var messagesEmpty = true;
var reactionList = [];
canary.innerHTML = "⚠";
canary.title = "TS booted";
var globalConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://attochatter.azurewebsites.net/hub")
    .build();
var localConnection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();
var req = new XMLHttpRequest();
req.addEventListener("load", function () {
    document.querySelector(".username").value = this.responseText;
});
req.open("GET", "/username");
req.send();
function curryJoinChatroom(button, chatroomName) {
    return function () {
        globalConnection.send("joinChatroom", chatroomName);
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
globalConnection.on("pong", function (response) {
    canary.innerHTML = "🌐";
    canary.title = "TS booted, signalr online";
    globalConnection.send("getReactions");
});
globalConnection.on("reactions", function (response) {
    reactionList = response;
});
globalConnection.on("listChatrooms", function (response) {
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
    globalConnection.send("joinChatroom", currentChatroom);
    globalConnection.send("listChatrooms");
    onJoinChatroom(currentChatroom);
};
var divMessages = document.querySelector(".messages");
globalConnection.on("chat", function (username, message, messageID) {
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
    messageDiv.setAttribute('data-id', messageID);
    var currentUser = document.querySelector(".username").value;
    //umcomment to disable users from reacting to their own messages
    // if(username != currentUser) {}
    messageDiv.onmouseenter = function () {
        var reactionPalette = getReactionpalette(username, messageID);
        //conditional reaction palette alignment
        if (messageDiv.getBoundingClientRect().width < 250 && username != currentUser) {
            reactionPalette.style.left = "0px";
            reactionPalette.style.right = "unset";
        }
        reactionPalette.onmouseenter = function () {
            reactionPalette.style.opacity = "1";
        };
        messageDiv.appendChild(reactionPalette);
        reactionPalette.style.opacity = "1";
    };
    messageDiv.onmouseleave = function () {
        var reactionPalette = messageDiv.querySelector("div.reaction-palette");
        if (reactionPalette != null) {
            //timeout allows fade out before removal
            reactionPalette.style.opacity = "0";
            setTimeout(function () {
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
function getReactionpalette(username, messageID) {
    var reactionpalette = document.createElement("div");
    reactionpalette.className = "reaction-palette";
    reactionpalette.textContent = "";
    if (!reactionList || reactionList.length == 0)
        globalConnection.send("getReactions");
    for (var _i = 0, reactionList_1 = reactionList; _i < reactionList_1.length; _i++) {
        var reaction = reactionList_1[_i];
        reactionpalette.appendChild(createReactionButton(reaction, username, messageID));
    }
    // "Add New Reaction" button
    var addNewReaction = document.createElement("span");
    addNewReaction.textContent = "|";
    var addButton = document.createElement("button");
    addButton.className = "reaction-button add-button";
    addButton.textContent = "+";
    addButton.onclick = function () {
        var newReaction = prompt("Enter new reaction");
        var cleanReaction = newReaction && newReaction.trim();
        if (cleanReaction && !reactionList.includes(cleanReaction)) {
            globalConnection.send("addReaction", newReaction);
        }
    };
    addNewReaction.appendChild(addButton);
    reactionpalette.appendChild(addNewReaction);
    return reactionpalette;
}
function createReactionButton(reaction, username, messageID) {
    var reactionButton = document.createElement("button");
    reactionButton.className = "reaction-button";
    reactionButton.textContent = "" + reaction;
    reactionButton.onclick = function () {
        globalConnection.send("react", username, messageID, reactionButton.textContent, currentChatroom);
    };
    return reactionButton;
}
globalConnection.on("react", function (messageID, reaction) {
    var message = document.querySelector("[data-id=\"" + messageID + "\"]");
    if (message == null)
        return;
    var reactionCounter = message.querySelector(".reaction-counter[data-reaction=\"" + reaction + "\"]");
    if (reactionCounter == null) {
        var reactionPair = document.createElement("div");
        var reactionEmoji = document.createElement("span");
        reactionEmoji.className = "reaction-emoji";
        reactionEmoji.textContent = reaction;
        reactionPair.appendChild(reactionEmoji);
        var reactionCounter_1 = document.createElement("span");
        reactionCounter_1.className = "reaction-counter";
        reactionCounter_1.textContent = "1";
        reactionCounter_1.setAttribute('data-reaction', reaction);
        reactionPair.appendChild(reactionCounter_1);
        var reactionDiv = message.querySelector('div.reaction-wrapper');
        if (reactionDiv == null) {
            var reactionDiv_1 = document.createElement("div");
            reactionDiv_1.className = "reaction-wrapper";
            message.appendChild(reactionDiv_1);
            reactionDiv_1.appendChild(reactionPair);
        }
        else
            reactionDiv.appendChild(reactionPair);
    }
    else {
        var count = parseInt(reactionCounter.textContent) + 1;
        reactionCounter.textContent = count.toString();
    }
});
var errorBox = document.querySelector(".error-box");
globalConnection.start().catch(function (err) { return errorBox.textContent = err; }).then(function () {
    globalConnection.send("Ping");
    globalConnection.send("joinChatroom", "General");
    onJoinChatroom("General");
    globalConnection.send("listChatrooms");
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
    globalConnection.send("chat", username, chat.value, currentChatroom).then(function () { return (chat.value = ""); });
}
