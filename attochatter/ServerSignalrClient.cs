using Microsoft.AspNetCore.SignalR.Client;

namespace attochatter
{
    public class ServerSignalrClient
    {
        readonly HubConnection connection;
        private readonly SoundEffects _sfx;

        public ServerSignalrClient(SoundEffects sfx)
        {
            _sfx = sfx;
            connection = new HubConnectionBuilder()
                .WithUrl("https://attochatter.corebridge.net/serverhub")
                .Build();

            connection.Closed += async (error) =>
            {
                await Task.Delay(new Random().Next(0, 5) * 1000);
                await connection.StartAsync();
            };

            connection.On("polo", (string response) =>
            {
                Console.WriteLine("From attochatter global: " + response);
            });

            connection.On("mention", (string username, string chatroom) =>
            {
                Console.WriteLine($"From attochatter global: you ({@username}) were @mentioned in chatroom '{chatroom}'");
                sfx.Play(SoundEffect.doorbell);
            });
        }

        public async Task Login(string username)
        {
            if (connection.State != HubConnectionState.Connected)
                await connection.StartAsync();

            await connection.InvokeAsync("login", username);
            await connection.InvokeAsync("marco");
        }
    }
}
