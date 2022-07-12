using Microsoft.AspNetCore.SignalR.Client;

namespace attochatter
{
    public class ServerSignalrClient
    {
        //readonly HubConnection connection;
        private readonly SoundEffects _sfx;

        public ServerSignalrClient(SoundEffects sfx)
        {
            _sfx = sfx;
            //connection = new HubConnectionBuilder()
            //    //.WithUrl(??)
            //    .Build();

            //connection.Closed += async (error) =>
            //{
            //    await Task.Delay(new Random().Next(0, 5) * 1000);
            //    await connection.StartAsync();
            //};

            //connection.On(??, () =>
            //{
            //    ??
            //});
        }

        public async Task Login(string username)
        {
            //if (connection.State == ??)
            //connection.??
            //connection.??
            await Task.CompletedTask;
        }
    }
}
