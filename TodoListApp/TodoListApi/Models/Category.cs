using System.Text.Json.Serialization;

namespace TodoListApi.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Kategori Adı (Örn: Projeler)
        public string Color { get; set; } = "#0d6efd";   // Renk Kodu (Örn: Mavi)
        public int UserId { get; set; }                  // Hangi kullanıcıya ait?
    }
}