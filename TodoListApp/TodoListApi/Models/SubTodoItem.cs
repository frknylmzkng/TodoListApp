using System.Text.Json.Serialization; // Bu satır önemli!

namespace TodoListApi.Models
{
    public class SubTodoItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }

        // Hangi Ana Göreve ait?
        public int TodoItemId { get; set; }

        // Döngüye girmemesi için JsonIgnore kullanıyoruz
        [JsonIgnore]
        public TodoItem? TodoItem { get; set; }
    }
}