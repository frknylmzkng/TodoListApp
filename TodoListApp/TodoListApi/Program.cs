using Microsoft.EntityFrameworkCore;
using TodoListApi.Data;
using TodoListApi.Repositories;

namespace TodoListApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Veritabaný servisini ekliyoruz:
            builder.Services.AddDbContext<TodoContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Aþçýyý (Repository) sisteme tanýtýyoruz:
            builder.Services.AddScoped<ITodoRepository, TodoRepository>();

            // CORS politikasýný ekliyoruz: Her yerden gelen isteklere izin ver (Geliþtirme aþamasý için)
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.AllowAnyOrigin()   // Hangi adresten gelirse gelsin kabul et
                          .AllowAnyHeader()   // Her türlü baþlýða izin ver
                          .AllowAnyMethod();  // GET, POST, PUT, DELETE hepsine izin ver
                });
            });

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            // Eklediðimiz CORS politikasýný aktif et
            app.UseCors();


            app.MapControllers();

            app.Run();
        }
    }
}