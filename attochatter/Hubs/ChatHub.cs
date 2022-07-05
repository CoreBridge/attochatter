using Microsoft.AspNetCore.SignalR;

namespace attochatter.Hubs;

public class ChatHub : Hub
{
    public async Task Ping() =>
        await Clients.Caller.SendAsync("pong", "🏓");
}