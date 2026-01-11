using Microsoft.EntityFrameworkCore;
using TodoListApi.Models; // Modelimizin nerede olduğunu gösteriyoruz

namespace TodoListApi.Data
{
    // DbContext: Entity Framework'ün ana sınıfıdır, veritabanı işlemlerini yönetir.
    public class TodoContext : DbContext
    {
        // Yapıcı Metot (Constructor): Ayarları dışarıdan (Program.cs'ten) almamızı sağlar.
        public TodoContext(DbContextOptions<TodoContext> options) : base(options)
        {
        }

        // Bu satır, "TodoItem" modelinin veritabanında bir TABLO olacağını söyler.
        // Tablonun adı "TodoItems" olacak.
        public DbSet<TodoItem> TodoItems { get; set; }
        public DbSet<Category> Categories { get; set; }

        public DbSet<User> Users { get; set; }
    }
}