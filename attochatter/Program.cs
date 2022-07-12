global using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Server.Kestrel.Https;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.Services.AddSignalR().AddJsonProtocol(options => {
    options.PayloadSerializerOptions.PropertyNamingPolicy = null;
});
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.Services.AddLettuceEncrypt();

builder.WebHost.UseUrls("https://localhost:7104", "http://localhost:5104","https://attochatter.corebridge.net:443/");
builder.WebHost.ConfigureKestrel(k =>
{
    var appServices = k.ApplicationServices;
    k.ConfigureHttpsDefaults(h =>
    {
        //h.ClientCertificateMode = ClientCertificateMode.RequireCertificate;
        h.ClientCertificateMode = ClientCertificateMode.NoCertificate;
        //h.UseLettuceEncrypt(appServices);
    });
});

var app = builder.Build();

app.UseCors(builder =>
{
    builder.WithOrigins("localhost:7104", "localhost", "https://localhost:7104", "https://attochatter.corebridge.net","https://attochatter.azurewebsites.net")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
});

var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};

webSocketOptions.AllowedOrigins.Add("https://localhost:7104");
webSocketOptions.AllowedOrigins.Add("https://attochatter.corebridge.net");
webSocketOptions.AllowedOrigins.Add("localhost:7104");
webSocketOptions.AllowedOrigins.Add("localhost");
webSocketOptions.AllowedOrigins.Add("attochatter.azurewebsites.net");
webSocketOptions.AllowedOrigins.Add("https://attochatter.azurewebsites.net");

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

app.MapGet("/username", () =>
{
    string usernameOverride = builder.Configuration["UsernameOV"];
    if (String.IsNullOrEmpty(usernameOverride))
        return Environment.UserName;
    else
        return usernameOverride;
})
.WithName("GetUsername");

app.Run();