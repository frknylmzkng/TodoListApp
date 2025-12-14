using TodoListApi.Models;

namespace TodoListApi.Repositories
{
    // Bu bir "Sözleşme"dir. Aşçının hangi yemekleri yapabileceğini listeler.
    public interface ITodoRepository
    {
        List<TodoItem> GetAll(int userId); // Artık userId istiyoruz
        void Add(TodoItem item);          // Ekle
        void Update(TodoItem item);       // Güncelle
        void Delete(int id);              // Sil
        TodoItem GetById(int id);         // Tek bir tane bul (Detay için)
    }
}