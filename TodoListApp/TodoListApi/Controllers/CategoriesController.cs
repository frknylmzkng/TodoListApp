using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoListApi.Data;
using TodoListApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace TodoListApi.Controllers
{
    [Authorize] // <--- KİLİT
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly TodoContext _context;

        public CategoriesController(TodoContext context)
        {
            _context = context;
        }

        // KULLANICININ KATEGORİLERİNİ GETİR
        [HttpGet]
        public IActionResult GetCategories([FromQuery] int userId)
        {
            var categories = _context.Categories.Where(c => c.UserId == userId).ToList();

            // Eğer kullanıcının hiç kategorisi yoksa, varsayılanları ekle ve gönder
            if (!categories.Any())
            {
                var defaults = new List<Category>
                {
                    new Category { Name = "Genel", Color = "#6c757d", UserId = userId },
                    new Category { Name = "İş", Color = "#0d6efd", UserId = userId },
                    new Category { Name = "Kişisel", Color = "#198754", UserId = userId },
                    new Category { Name = "Okul", Color = "#ffc107", UserId = userId }
                };
                _context.Categories.AddRange(defaults);
                _context.SaveChanges();
                return Ok(defaults);
            }

            return Ok(categories);
        }

        // YENİ KATEGORİ EKLE
        [HttpPost]
        public IActionResult AddCategory([FromBody] Category category)
        {
            _context.Categories.Add(category);
            _context.SaveChanges();
            return Ok(category);
        }

        // KATEGORİ SİL
        [HttpDelete("{id}")]
        public IActionResult DeleteCategory(int id)
        {
            var category = _context.Categories.Find(id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            _context.SaveChanges();
            return Ok();
        }
    }
}