using Microsoft.AspNetCore.Mvc;
using TodoListApi.Models;
using TodoListApi.Repositories; // Artık veritabanını değil, Repository'i çağırıyoruz

namespace TodoListApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoController : ControllerBase
    {
        // ARTIK Context YOK, Repository VAR
        private readonly ITodoRepository _repository;

        // Yapıcı metodda Repository istiyoruz
        public TodoController(ITodoRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] int userId)
        {
            // Repository'ye ID'yi gönderiyor muyuz?
            var todos = _repository.GetAll(userId);
            return Ok(todos);
        }

        [HttpPost]
        public IActionResult Post([FromBody] TodoItem newItem)
        {
            _repository.Add(newItem); // Ekleme işini repository halleder
            return Ok(newItem);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] TodoItem updatedItem)
        {
            // Güncelleme için ID'yi de nesneye verelim ki karışıklık olmasın
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
    }
}