using TodoListApi.Data;
using TodoListApi.Models;
using Microsoft.EntityFrameworkCore; //Alt görevler için ekledik

namespace TodoListApi.Repositories
{
    // Bu sınıf, sözleşmedeki maddeleri (ITodoRepository) GERÇEKLEŞTİREN sınıftır.
    public class TodoRepository : ITodoRepository
    {
        private readonly TodoContext _context;

        public TodoRepository(TodoContext context)
        {
            _context = context;
        }

        public void Add(TodoItem item)
        {
            _context.TodoItems.Add(item);
            _context.SaveChanges(); // Kaydetme işi artık burada
        }

        public void Delete(int id)
        {
            var item = _context.TodoItems.Find(id);
            if (item != null)
            {
                _context.TodoItems.Remove(item);
                _context.SaveChanges();
            }
        }

        // Parametre olarak int userId alıyoruz
        public List<TodoItem> GetAll(int userId)
        {
            return _context.TodoItems
                           .Include(x => x.SubItems) // <--- KRİTİK SATIR: Alt görevleri de doldur!
                           .Where(x => x.UserId == userId)
                           .OrderBy(x => x.OrderIndex)
                           .ToList();
        }

        public TodoItem GetById(int id)
        {
            return _context.TodoItems.Find(id);
        }

        public void Update(TodoItem item)
        {
            var existing = _context.TodoItems.Find(item.Id);
            if (existing != null)
            {
                existing.Title = item.Title;
                existing.IsCompleted = item.IsCompleted;
                existing.Priority = item.Priority;
                existing.DueDate = item.DueDate;

                // --- EKSİK OLAN SATIR BU ---
                existing.Category = item.Category;
                // ---------------------------

                _context.SaveChanges();
            }
        }
        // Toplu Güncelleme Metodu
        public void UpdateOrder(int userId, List<int> sortedIds)
        {
            // Bu kullanıcının tüm görevlerini çek
            var userTodos = _context.TodoItems.Where(x => x.UserId == userId).ToList();

            // Döngü ile her görevin OrderIndex'ini güncelle
            for (int i = 0; i < sortedIds.Count; i++)
            {
                // Listeden o ID'ye sahip görevi bul
                var item = userTodos.FirstOrDefault(x => x.Id == sortedIds[i]);
                if (item != null)
                {
                    item.OrderIndex = i; // Yeni sırasını ata (0, 1, 2...)
                }
            }

            _context.SaveChanges(); // Hepsini tek seferde kaydet
        }
    }
}