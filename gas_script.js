/**
 * HƯỚNG DẪN CÀI ĐẶT SERVER ĐĂNG NHẬP (GOOGLE APPS SCRIPT)
 * 
 * 1. Vào Google Drive, tạo một Google Sheets mới (hoặc dùng file cũ).
 * 2. Đổi tên sheet đầu tiên (tab dưới cùng) thành "Sheet1" (nếu chưa phải).
 * 3. Tạo tiêu đề cột ở dòng 1: Cột A là "Tài khoản", Cột B là "Mật khẩu", Cột C là "Device ID".
 * 4. Trên menu Google Sheets, chọn Tiện ích mở rộng -> Apps Script.
 * 5. Xóa hết code cũ trong đó, dán TOÀN BỘ đoạn code bên dưới vào.
 * 6. Sửa SPREADSHEET_ID thành ID của bảng tính của bạn (lấy từ URL bảng tính).
 * 7. Bấm nút Lưu (Save).
 * 8. Chọn nút Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment).
 * 9. Chọn loại là "Ứng dụng web" (Web app).
 * 10. Ở phần "Quyền truy cập" (Who has access), chọn "Bất kỳ ai" (Anyone).
 * 11. Bấm Triển khai.
 * 12. Copy cái "Web app URL" (Bắt đầu bằng https://script.google.com/macros/s/...)
 * 13. Dán URL đó vào biến GAS_LOGIN_URL trong file app.js của dự án web.
 */

const SPREADSHEET_ID = 'THAY_ID_BANG_TINH_CUA_BAN_VAO_DAY';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'login') {
      return handleLogin(data.tk, data.mk, data.deviceId);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Hành động không hợp lệ'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Lỗi server: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleLogin(tk, mk, deviceId) {
  if (!tk || !mk || !deviceId) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Thiếu thông tin đăng nhập'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  // Dòng đầu tiên (index 0) là header, nên duyệt từ i = 1
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const sheetTk = row[0] ? row[0].toString().trim() : '';
    const sheetMk = row[1] ? row[1].toString().trim() : '';
    const sheetDeviceId = row[2] ? row[2].toString().trim() : '';
    
    // So sánh tài khoản không phân biệt hoa thường, mật khẩu phân biệt hoa thường
    if (sheetTk.toLowerCase() === tk.toLowerCase() && sheetMk === mk) {
      if (sheetDeviceId === '') {
        // Tài khoản đúng, chưa có DeviceID -> Ghi DeviceID vào cột C
        // getRange(row, col) - row bắt đầu từ 1, nên index i tương ứng với row i+1
        sheet.getRange(i + 1, 3).setValue(deviceId);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Đăng nhập lần đầu thành công. Đã khóa thiết bị!'
        })).setMimeType(ContentService.MimeType.JSON);
      } else if (sheetDeviceId === deviceId) {
        // Tài khoản đúng, DeviceID khớp
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Đăng nhập thành công!'
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        // Tài khoản đúng nhưng khác DeviceID
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Tài khoản này đã được sử dụng trên một thiết bị khác!'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  
  // Duyệt hết không thấy khớp tk và mk
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Tài khoản hoặc mật khẩu không chính xác!'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Hàm này giúp test URL xem có hoạt động không
function doGet(e) {
  return ContentService.createTextOutput("Hệ thống đăng nhập SGK Infographic đang chạy.");
}
