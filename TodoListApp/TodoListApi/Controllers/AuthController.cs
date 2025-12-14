using Microsoft.AspNetCore.Mvc;
using TodoListApi.Data;
using TodoListApi.Models;
using System.Security.Cryptography;
using System.Text;

namespace TodoListApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TodoContext _context;

        public AuthController(TodoContext context)
        {
            _context = context;
        }

        // 1. KAYIT OL (REGISTER)
        [HttpPost("register")]
        public IActionResult Register(UserDto request)
        {
            // Kullanıcı zaten var mı?
            if (_context.Users.Any(u => u.Username == request.Username))
            {
                return BadRequest("Bu kullanıcı adı zaten alınmış.");
            }

            // Yeni kullanıcı oluştur ve şifreyi hashle
            var user = new User
            {
                Username = request.Username,
                PasswordHash = HashPassword(request.Password)
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        }

        // 2. GİRİŞ YAP (LOGIN)
        [HttpPost("login")]
        public IActionResult Login(UserDto request)
        {
            // Kullanıcıyı bul
            var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);

            if (user == null)
            {
                return BadRequest("Kullanıcı bulunamadı.");
            }

            // Şifreyi kontrol et (Gelen şifreyi hashleyip veritabanındakiyle kıyasla)
            if (user.PasswordHash != HashPassword(request.Password))
            {
                return BadRequest("Yanlış şifre!");
            }

            // Başarılı! Kullanıcının ID'sini dönelim (Frontend bunu kullanacak)
            return Ok(user.Id);
        }

        // --- YARDIMCI METOT: ŞİFREYİ HASHLEME ---
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                var builder = new StringBuilder();
                foreach (var b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
}