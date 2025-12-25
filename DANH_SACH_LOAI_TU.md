# Danh Sách Loại Từ (Part of Speech)

## Cách Hoạt Động
- **Lưu trong database**: Tiếng Anh đầy đủ (noun, verb, adjective...)
- **Hiển thị trong admin**: Viết tắt (n, v, adj, adv...)

## Danh Sách Đầy Đủ

| Tiếng Anh (Lưu DB) | Viết Tắt (Hiển Thị) | Tiếng Việt Đầy Đủ |
|-------------------|---------------------|-------------------|
| noun | n | Danh từ |
| verb | v | Động từ |
| adjective | adj | Tính từ |
| adverb | adv | Trạng từ |
| preposition | prep | Giới từ |
| pronoun | pron | Đại từ |
| conjunction | conj | Liên từ |
| determiner | det | Hạn định từ |
| interjection | int | Thán từ |
| article | art | Mạo từ |
| auxiliary | aux | Trợ động từ |
| modal | modal | Động từ khuyết thiếu |
| idiom | idiom | Thành ngữ |
| phrase | phrase | Cụm từ |
| numeral | num | Số từ |
| exclamation | excl | Cảm thán từ |

## Ví Dụ Sử Dụng

### Trong Script Thêm Từ Vựng
```javascript
{
  word: 'beautiful',
  type: 'adjective',  // Lưu bằng tiếng Anh
  meaning: 'đẹp',
  level: 'A1'
}
```

### Hiển Thị Trong Admin
- **Dropdown**: Sẽ hiển thị `adj` thay vì `adjective`
- **Badge trong bảng**: Sẽ hiển thị `adj` bên cạnh từ vựng
- **Filter**: Dropdown filter cũng hiển thị `adj`

## Mở Rộng

Nếu cần thêm loại từ mới, chỉ cần:
1. Thêm từ vào database với giá trị tiếng Anh
2. Thêm mapping vào `typeAbbreviations` trong `Vocabulary.jsx`:
   ```javascript
   const typeAbbreviations = {
     ...
     'new_type': 'viết_tắt',
   };
   ```

## Lợi Ích
✅ Gọn gàng, dễ nhìn trong giao diện admin
✅ Chuẩn hóa dữ liệu (lưu tiếng Anh)
✅ Linh hoạt mở rộng
✅ Tự động load từ database
