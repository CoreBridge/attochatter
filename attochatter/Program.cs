using Microsoft.AspNetCore.Server.Kestrel.Https;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.Services.AddSignalR().AddJsonProtocol(options => {
    options.PayloadSerializerOptions.PropertyNamingPolicy = null;
});
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddLettuceEncrypt();

builder.WebHost.UseUrls("https://localhost:7104", "http://localhost:5104","https://cbchat.duckdns.org:443/", "http://cbchat.duckdns.org:56776/");
builder.WebHost.ConfigureKestrel(k =>
{
    var appServices = k.ApplicationServices;
    k.ConfigureHttpsDefaults(h =>
    {
        //h.ClientCertificateMode = ClientCertificateMode.RequireCertificate;
        h.UseLettuceEncrypt(appServices);
    });
});

var app = builder.Build();

app.UseCors(builder =>
{
    builder.WithOrigins("localhost:7104", "localhost", "https://localhost:7104", "https://cbchat.duckdns.org")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
});

var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};

webSocketOptions.AllowedOrigins.Add("https://localhost:7104");
webSocketOptions.AllowedOrigins.Add("https://cbchat.duckdns.org");
webSocketOptions.AllowedOrigins.Add("localhost:7104");
webSocketOptions.AllowedOrigins.Add("localhost");

app.UseWebSockets(webSocketOptions);

app.MapHub<attochatter.Hubs.ChatHub>("/hub", o =>
{
    //o.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.WebSockets;
});

app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateTime.Now.AddDays(index),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

internal record WeatherForecast(DateTime Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}