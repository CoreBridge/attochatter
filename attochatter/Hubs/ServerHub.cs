namespace attochatter.Hubs;

public class ServerHub : Hub
{
    public async Task Marco() =>
        await Clients.Caller.SendAsync("polo", "🤽‍");

    private static List<string> SeenUsernames = new List<string>() { };
    public async Task login(string username)
    {
        if (username != null && username.Length > 0)
        {
            if (!SeenUsernames.Contains(username))
                SeenUsernames.Add(username);

            await Groups.AddToGroupAsync(Context.ConnectionId, username);
        }
    }

    public async Task getRecentUsernames()
    {
        await Clients.Caller.SendAsync("listUsernames", SeenUsernames);
    }

}