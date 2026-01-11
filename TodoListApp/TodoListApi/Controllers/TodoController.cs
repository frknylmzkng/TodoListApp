using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoListApi.Models;
using TodoListApi.Repositories;
using TodoListApi.Data;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

namespace TodoListApi.Controllers
{
    [Authorize] // <--- KİLİT BURASI!
    [Route("api/[controller]")]
    [ApiController]
    public class TodoController : ControllerBase
    {
        // 1. DEĞİŞKENLERİ TANIMLIYORUZ (Sadece birer kez!)
        private readonly ITodoRepository _repository;
        private readonly TodoContext _context;

        // 2. KURUCU METOT (CONSTRUCTOR)
        // Hem Repository'yi hem Context'i içeri alıyoruz.
        public TodoController(ITodoRepository repository, TodoContext context)
        {
            _repository = repository;
            _context = context;
        }

        // --- BURADAN SONRA METOTLAR GELİYOR ---

        [HttpGet]
        public IActionResult GetAll([FromQuery] int userId)
        {
            var todos = _repository.GetAll(userId);
            return Ok(todos);
        }

        [HttpPost]
        public IActionResult Post([FromBody] TodoItem newItem)
        {
            _repository.Add(newItem);
            return Ok(newItem);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] TodoItem updatedItem)
        {
            updatedItem.Id = id;
            _repository.Update(updatedItem);
            return Ok(updatedItem);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _repository.Delete(id);
            return Ok();
        }

        [HttpPut("reorder")]
        public IActionResult UpdateOrder([FromQuery] int userId, [FromBody] List<int> sortedIds)
        {
            _repository.UpdateOrder(userId, sortedIds);
            return Ok();
        }

        // --- YENİ EKLENEN ALT GÖREV (SUBTASK) METOTLARI ---

        [HttpPost("subtask")]
        public IActionResult AddSubTask([FromBody] SubTodoItem subTask)
        {
            // Burada doğrudan Context kullanıyoruz çünkü Repository'de buna özel metod yazmadık (Pratik çözüm)
            var todo = _context.TodoItems.Find(subTask.TodoItemId);
            if (todo == null) return NotFound("Ana görev bulunamadı");

            _context.Set<SubTodoItem>().Add(subTask);
            _context.SaveChanges();
            return Ok(subTask);
        }

        [HttpPut("subtask/{id}")]
        public IActionResult ToggleSubTask(int id)
        {
            var subTask = _context.Set<SubTodoItem>().Find(id);
            if (subTask == null) return NotFound();

            subTask.IsCompleted = !subTask.IsCompleted;
            _context.SaveChanges();
            return Ok();
        }

        [HttpDelete("subtask/{id}")]
        public IActionResult DeleteSubTask(int id)
        {
            var subTask = _context.Set<SubTodoItem>().Find(id);
            if (subTask == null) return NotFound();

            _context.Remove(subTask);
            _context.SaveChanges();
            return Ok();
        }

        // DOSYA YÜKLEME METODU
        [HttpPost("upload/{id}")]
        public async Task<IActionResult> UploadFile(int id, IFormFile file)
        {
            // 1. Dosya var mı kontrol et
            if (file == null || file.Length == 0)
                return BadRequest("Dosya seçilmedi.");

            // 2. İlgili görevi bul
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null)
                return NotFound("Görev bulunamadı.");

            // 3. Dosya adını güvenli hale getir (Guid ekle ki isimler çakışmasın)
            // Örnek: "ödev.pdf" -> "b12a-345c-ödev.pdf"
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);

            // 4. Kaydedilecek klasörü belirle (wwwroot/uploads)
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            // Klasör yoksa oluştur
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var filePath = Path.Combine(uploadPath, fileName);

            // 5. Dosyayı diske kaydet
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 6. Veritabanına yolunu yaz (Örn: "uploads/b12a...pdf")
            todoItem.AttachmentPath = "uploads/" + fileName;
            await _context.SaveChangesAsync();

            return Ok(new { path = todoItem.AttachmentPath });
        }
    }
}