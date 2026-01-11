using System.Text.Json.Serialization; // EN ÖNEMLÝ SATIR (En tepede olmalý)
using Microsoft.EntityFrameworkCore;
using TodoListApi.Data;
using TodoListApi.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Veritabaný Servisi
builder.Services.AddDbContext<TodoContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Repository Servisi
builder.Services.AddScoped<ITodoRepository, TodoRepository>();

// 3. CORS Politikasý (React ile iletiþim için)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 4. Controller ve JSON Ayarlarý (DÖNGÜ HATASINI ÇÖZEN KISIM)
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Ýliþkili tablolarda sonsuz döngüyü engeller
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Swagger (API Test Ekraný)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT AYARLARI
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

var app = builder.Build();

// HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(); // CORS'u aktif et
app.UseStaticFiles(); // <--- BU SATIR ÇOK ÖNEMLÝ! Dosyalara eriþimi açar.
app.UseAuthentication(); // <--- Önce kimlik kontrolü
app.UseAuthorization();  // <--- Sonra yetki kontrolü
app.MapControllers();

app.Run();