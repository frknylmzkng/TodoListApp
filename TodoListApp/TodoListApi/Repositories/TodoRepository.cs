using TodoListApi.Data;
using TodoListApi.Models;

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
                           // --- İŞTE BU SATIR ÇOK ÖNEMLİ ---
                           .Where(x => x.UserId == userId)
                           // --------------------------------
                           .OrderByDescending(x => x.Priority)
                           .ThenByDescending(x => x.Id)
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
    }
}