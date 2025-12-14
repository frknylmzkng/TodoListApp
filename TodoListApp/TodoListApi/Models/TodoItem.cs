namespace TodoListApi.Models
{
    public class TodoItem
    {
        // Görevin benzersiz numarası
        public int Id { get; set; }

        // Görevin adı (Örn: "Ekmek al")
        // string.Empty diyerek başlangıçta boş bir yazı atıyoruz ki hata vermesin.
        public string Title { get; set; } = string.Empty;

        // Görev yapıldı mı? (True = Yapıldı, False = Yapılmadı)
        public bool IsCompleted { get; set; }
    }
}
