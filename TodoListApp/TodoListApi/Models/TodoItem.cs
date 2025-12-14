namespace TodoListApi.Models
{
    public class TodoItem
    {
        public int Id { get; set; }
        public string Title { get; set; } =string.Empty;
        public bool IsCompleted { get; set; }

        // YENİ EKLENEN ÖZELLİK:
        // 1: Düşük, 2: Orta, 3: Yüksek
        public int Priority { get; set; } = 1; // Varsayılan olarak 1 (Düşük) olsun

        // YENİ EKLENEN: Soru işareti (?) "Boş olabilir" demektir.
        // Yani kullanıcı tarih seçmek zorunda değil.
        public DateTime? DueDate { get; set; }
    }
}