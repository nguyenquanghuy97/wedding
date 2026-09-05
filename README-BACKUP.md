# Backup trước đợt tối ưu lần 2

Thư mục này chứa mã nguồn, cấu hình, lockfile và toàn bộ public của website trước khi tối ưu ngày 05/09/2026.

- Giữ nguyên thiết kế đã chốt và toàn bộ ảnh, font, nhạc tại thời điểm backup.
- Không sao chép node_modules, cache, lịch sử Git hoặc thư mục build; các phần này có thể tạo lại từ mã nguồn và package-lock.json.
- Đặt backup ngoài wedding-site để không được đóng gói hoặc tải xuống cùng website.
- Các file TTF và ảnh arch.webp, curtain.webp, wreath.webp đã được bỏ khỏi public hiện tại; bản cũ vẫn nằm trong public của backup này.
- Bản ảnh trước cả hai đợt nén vẫn có tại thư mục wedding-asset-originals nằm cạnh wedding-site.

Để phục hồi, sao chép mã nguồn và public từ đây sang một thư mục mới, cài dependencies từ lockfile rồi build. Không cần ghi đè bản đang dùng.
