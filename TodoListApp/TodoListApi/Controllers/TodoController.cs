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
            // ... (Önceki User kontrol kodları buradaysa kalsın) ...

            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null) return NotFound("Görev bulunamadı.");

            if (file == null || file.Length == 0)
                return BadRequest("Dosya seçilmedi.");

            // --- YENİ GÜVENLİK KONTROLÜ BAŞLANGICI ---
            if (!IsValidFileSignature(file))
            {
                return BadRequest("UYARI: Dosya içeriği, uzantısıyla uyuşmuyor! Bu dosya sahte olabilir.");
            }
            // --- GÜVENLİK KONTROLÜ BİTİŞİ ---

            // ... (Buradan sonrası eski kodunla aynı kalacak: Klasör oluşturma, kaydetme vs.) ...
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            todoItem.AttachmentPath = "uploads/" + uniqueFileName;
            await _context.SaveChangesAsync();

            return Ok(new { path = todoItem.AttachmentPath });
        }

        // Dosyanın gerçekten o uzantıda olup olmadığının kontrolü
        private bool IsValidFileSignature(IFormFile file)
        {
            using (var reader = new BinaryReader(file.OpenReadStream()))
            {
                var signatures = new Dictionary<string, List<byte[]>>
        {
            { ".png", new List<byte[]> { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
            { ".jpeg", new List<byte[]> { new byte[] { 0xFF, 0xD8, 0xFF } } },
            { ".jpg", new List<byte[]> { new byte[] { 0xFF, 0xD8, 0xFF } } },
            { ".pdf", new List<byte[]> { new byte[] { 0x25, 0x50, 0x44, 0x46 } } }
        };

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!signatures.ContainsKey(ext)) return true; // Tanımadığımız dosyaları (txt vs) şimdilik kabul edelim.

                var headerBytes = reader.ReadBytes(signatures[ext].Max(m => m.Length));

                return signatures[ext].Any(signature =>
                    headerBytes.Take(signature.Length).SequenceEqual(signature)
                );
            }
        }
    }
}