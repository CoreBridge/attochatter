namespace attochatter.Hubs;

public class ChatHub : Hub
{
    public async Task Ping() =>
        await Clients.Caller.SendAsync("pong", "🏓");

    public async Task chat(string username, string message, string chatroom)
    {
        if (chatroom == null || chatroom.Length == 0)
        {
            await Clients.All.SendAsync("chat", username, message);
        } 
        else
        {
            await Clients.Group(chatroom).SendAsync("chat", username, message);
        }
    }

    private static List<string> CurrentGroups = new List<string>();
    public async Task joinChatroom(string chatroom)
    {
        if (!CurrentGroups.Contains(chatroom))
            CurrentGroups.Add(chatroom);

        await Groups.AddToGroupAsync(Context.ConnectionId, chatroom);
    }

    public async Task listChatrooms()
    {
        await Clients.Caller.SendAsync("listChatrooms", CurrentGroups);
    }

}