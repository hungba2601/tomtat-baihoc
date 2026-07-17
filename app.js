/* SGK Infographic AI – app.js */

const GAS_LOGIN_URL = 'https://script.google.com/macros/s/AKfycbyNX5ucg3DLfXvh05OteD7rgVo6lFtec50BFOBLcoh9n1oPAvi2RUZ3Kpl3lJLEU2U14w/exec';
let deviceFingerprint = '';
// ── DATA: Môn học theo lớp ──────────────────────────────
const SUBJECTS = {
  '1':  ['Toán','Tiếng Việt','Đạo đức','Tự nhiên và Xã hội','Hoạt động trải nghiệm','Tiếng Anh'],
  '2':  ['Toán','Tiếng Việt','Đạo đức','Tự nhiên và Xã hội','Hoạt động trải nghiệm','Tiếng Anh'],
  '3':  ['Toán','Tiếng Việt','Đạo đức','Tự nhiên và Xã hội','Tin học','Công nghệ','Hoạt động trải nghiệm','Tiếng Anh'],
  '4':  ['Toán','Tiếng Việt','Đạo đức','Khoa học','Lịch sử và Địa lí','Tin học','Công nghệ','Hoạt động trải nghiệm','Tiếng Anh'],
  '5':  ['Toán','Tiếng Việt','Đạo đức','Khoa học','Lịch sử và Địa lí','Tin học','Công nghệ','Hoạt động trải nghiệm','Tiếng Anh'],
  '6':  ['Toán','Ngữ văn','Tiếng Anh','KHTN','Lịch sử và Địa lí','GDCD','Tin học','Công nghệ','Âm nhạc','Mĩ thuật','Hoạt động trải nghiệm'],
  '7':  ['Toán','Ngữ văn','Tiếng Anh','KHTN','Lịch sử và Địa lí','GDCD','Tin học','Công nghệ','Âm nhạc','Mĩ thuật','Hoạt động trải nghiệm'],
  '8':  ['Toán','Ngữ văn','Tiếng Anh','KHTN','Lịch sử và Địa lí','GDCD','Tin học','Công nghệ','Âm nhạc','Mĩ thuật','Hoạt động trải nghiệm'],
  '9':  ['Toán','Ngữ văn','Tiếng Anh','KHTN','Lịch sử và Địa lí','GDCD','Tin học','Công nghệ','Âm nhạc','Mĩ thuật','Hoạt động trải nghiệm'],
  '10': ['Toán','Ngữ văn','Tiếng Anh','Vật lí','Hóa học','Sinh học','Lịch sử','Địa lí','GDKT&PL','Tin học','Công nghệ','Hoạt động trải nghiệm'],
  '11': ['Toán','Ngữ văn','Tiếng Anh','Vật lí','Hóa học','Sinh học','Lịch sử','Địa lí','GDKT&PL','Tin học','Công nghệ','Hoạt động trải nghiệm'],
  '12': ['Toán','Ngữ văn','Tiếng Anh','Vật lí','Hóa học','Sinh học','Lịch sử','Địa lí','GDKT&PL','Tin học','Công nghệ','Hoạt động trải nghiệm'],
};

// ── STATE ───────────────────────────────────────────────
const state = {
  apiKey: '', model: 'gemini-2.5-flash',
  grade: '', subject: '', selectedLesson: '', lastInfoHTML: ''
};

// ── DOM ─────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const apiKeyInput   = $('apiKeyInput');
const saveApiBtn    = $('saveApiBtn'),    apiStatus      = $('apiStatus');
const settingsBtn   = $('settingsBtn'),   settingsModal  = $('settingsModal');
const closeModalBtn = $('closeModalBtn');
const gradeSelect   = $('gradeSelect'),   subjectSelect  = $('subjectSelect');
const fetchTocBtn   = $('fetchTocBtn'),   fetchStatus    = $('fetchStatus');
const lessonContainer = $('lessonContainer');
const generateBtn   = $('generateBtn'),   genStatus      = $('genStatus');
const emptyState    = $('emptyState'),    infographicWrapper = $('infographicWrapper');
const infographicOutput = $('infographicOutput');
const previewActions = $('previewActions');
const togglePwd = $('togglePwd');

const loginOverlay = $('loginOverlay');
const loginTk = $('loginTk'), loginMk = $('loginMk');
const loginBtn = $('loginBtn'), loginStatus = $('loginStatus');
const loginTogglePwd = $('loginTogglePwd');
const userInfo = $('userInfo'), loggedInUser = $('loggedInUser'), logoutBtn = $('logoutBtn');

const changePwdBtn = $('changePwdBtn'), changePwdModal = $('changePwdModal');
const closeChangePwdBtn = $('closeChangePwdBtn'), submitChangePwdBtn = $('submitChangePwdBtn');
const oldPwdInput = $('oldPwdInput'), newPwdInput = $('newPwdInput'), confirmPwdInput = $('confirmPwdInput');
const changePwdStatus = $('changePwdStatus');

// ── INIT ────────────────────────────────────────────────
(function init() {
  spawnParticles();
  const savedKey   = localStorage.getItem('sgk_api_key');
  if (savedKey)   { apiKeyInput.value = savedKey; state.apiKey = savedKey; }

  togglePwd.addEventListener('click', () => {
    const show = apiKeyInput.type === 'password';
    apiKeyInput.type = show ? 'text' : 'password';
    togglePwd.querySelector('svg').innerHTML = show
      ? '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
      : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  });

  saveApiBtn.addEventListener('click', saveApi);
  settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
  
  gradeSelect.addEventListener('change', onGradeChange);
  subjectSelect.addEventListener('change', onSubjectChange);
  fetchTocBtn.addEventListener('click', fetchTableOfContents);
  generateBtn.addEventListener('click', generateInfographic);
  $('regenerateBtn').addEventListener('click', generateInfographic);
  $('downloadPng').addEventListener('click', exportPNG);
  $('downloadHtml').addEventListener('click', exportHTML);
  $('downloadPdf').addEventListener('click', exportPDF);

  // ── INIT CHANGE PASSWORD ───────────────────────────────
  changePwdBtn.addEventListener('click', () => {
    if (!localStorage.getItem('sgk_user_logged')) {
      toast('⚠️ Vui lòng đăng nhập trước!', 'error'); return;
    }
    oldPwdInput.value = ''; newPwdInput.value = ''; confirmPwdInput.value = '';
    changePwdStatus.classList.add('hidden');
    changePwdModal.classList.remove('hidden');
  });
  closeChangePwdBtn.addEventListener('click', () => changePwdModal.classList.add('hidden'));
  submitChangePwdBtn.addEventListener('click', handleChangePassword);

  // ── INIT LOGIN ──────────────────────────────────────────
  checkLoginState();
  if (window.FingerprintJS) {
    FingerprintJS.load().then(fp => fp.get()).then(result => {
      deviceFingerprint = 'HWID-' + result.visitorId.toUpperCase();
    }).catch(() => {});
  }

  function checkLoginState() {
    // [TẠM ẨN ĐĂNG NHẬP] - Mọi người có thể vào dùng ngay
    loginOverlay.classList.add('hidden');
    userInfo.classList.remove('hidden');
    loggedInUser.textContent = 'Khách (Bypass Login)';

    /* Code cũ để khôi phục:
    const loggedUser = localStorage.getItem('sgk_user_logged');
    if (loggedUser) {
      loginOverlay.classList.add('hidden');
      userInfo.classList.remove('hidden');
      loggedInUser.textContent = loggedUser;
    } else {
      loginOverlay.classList.remove('hidden');
      userInfo.classList.add('hidden');
    }
    */
  }

  loginBtn.addEventListener('click', async () => {
    const tk = loginTk.value.trim().toLowerCase(); // Tự động chuyển thành chữ thường ngay từ Frontend
    const mk = loginMk.value.trim();
    
    if (!tk || !mk) {
      showStatus(loginStatus, 'Vui lòng nhập tài khoản và mật khẩu', 'error');
      return;
    }
    
    if (!deviceFingerprint) {
      showStatus(loginStatus, 'Đang tải thông tin thiết bị, vui lòng thử lại sau...', 'error');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.querySelector('.btn-text').classList.add('hidden');
    loginBtn.querySelector('.btn-loader').classList.remove('hidden');
    loginStatus.classList.add('hidden');

    if (GAS_LOGIN_URL === 'THAY_URL_WEB_APP_CUA_GOOGLE_APPS_SCRIPT_VAO_DAY') {
      // Bỏ qua đăng nhập nếu chưa thiết lập GAS URL (để test giao diện)
      setTimeout(() => {
        localStorage.setItem('sgk_user_logged', tk);
        checkLoginState();
        toast('Chưa có Link GAS! (Đã Bypass)', 'success');
        resetLoginBtn();
      }, 1000);
      return;
    }

    try {
      const res = await fetch(GAS_LOGIN_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'login', tk, mk, deviceId: deviceFingerprint }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' } // Tránh CORS preflight
      });
      const result = await res.json();
      
      if (result.success) {
        localStorage.setItem('sgk_user_logged', tk);
        checkLoginState();
        toast(result.message, 'success');
      } else {
        showStatus(loginStatus, result.message, 'error');
      }
    } catch (err) {
      showStatus(loginStatus, 'Lỗi kết nối máy chủ! Có thể sai URL GAS.', 'error');
    } finally {
      resetLoginBtn();
    }
  });

  function resetLoginBtn() {
    loginBtn.disabled = false;
    loginBtn.querySelector('.btn-text').classList.remove('hidden');
    loginBtn.querySelector('.btn-loader').classList.add('hidden');
  }

  loginTogglePwd.addEventListener('click', () => {
    const isPwd = loginMk.type === 'password';
    loginMk.type = isPwd ? 'text' : 'password';
    loginTogglePwd.querySelector('svg').innerHTML = isPwd
      ? '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
      : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('sgk_user_logged');
    loginTk.value = '';
    loginMk.value = '';
    checkLoginState();
    toast('Đã đăng xuất', 'success');
  });

})();

function spawnParticles() {
  const c = $('bgParticles');
  const colors = ['#0ea5e9','#38bdf8','#7dd3fc','#0284c7','#bae6fd'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div'); p.className = 'particle';
    const s = Math.random() * 6 + 3;
    p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*5)]};animation-duration:${Math.random()*18+14}s;animation-delay:${Math.random()*8}s;`;
    c.appendChild(p);
  }
}

// ── API KEY ─────────────────────────────────────────────
function saveApi() {
  const key = apiKeyInput.value.trim();
  if (!key) { showStatus(apiStatus,'Vui lòng nhập API Key!','error'); return; }
  state.apiKey = key; 
  // Hardcode model to gemini-2.5-flash
  state.model = 'gemini-2.5-flash';
  localStorage.setItem('sgk_api_key', key);
  showStatus(apiStatus,'✓ Đã lưu cài đặt!','success');
  setTimeout(() => {
    apiStatus.classList.add('hidden');
    settingsModal.classList.add('hidden');
  }, 1000);
}

// ── GRADE / SUBJECT CHANGE ──────────────────────────────
function onGradeChange() {
  const g = gradeSelect.value;
  state.grade = g;
  subjectSelect.disabled = !g;
  subjectSelect.innerHTML = '<option value="">-- Chọn môn --</option>';
  if (g && SUBJECTS[g]) {
    SUBJECTS[g].forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      subjectSelect.appendChild(opt);
    });
  }
  fetchTocBtn.disabled = true;
  resetLessons();
}

function onSubjectChange() {
  state.subject = subjectSelect.value;
  fetchTocBtn.disabled = !state.subject;
  resetLessons();
}

function resetLessons() {
  state.selectedLesson = '';
  generateBtn.disabled = true;
  lessonContainer.className = 'topic-placeholder';
  lessonContainer.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><span>Hãy chọn môn và lấy danh sách bài trước</span>`;
}

// ── FETCH TABLE OF CONTENTS (từ dữ liệu có sẵn) ────────
function fetchTableOfContents() {
  if (!state.grade || !state.subject) { toast('⚠️ Chọn Lớp và Môn!','error'); return; }

  const lessons = LESSONS_DB[state.grade]?.[state.subject];

  if (lessons && lessons.length) {
    renderLessons(lessons);
    const bookName = state.subject === 'Tiếng Anh' ? 'Global Success' : 'SGK KNTT';
    showStatus(fetchStatus, `✓ Tìm thấy ${lessons.length} bài học trong ${bookName}!`, 'success');
    fetchStatus.classList.remove('hidden');
    setTimeout(() => fetchStatus.classList.add('hidden'), 2500);
  } else {
    // Môn chưa có trong database → cho nhập tay
    lessonContainer.className = 'topic-placeholder';
    lessonContainer.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Môn này chưa có dữ liệu sẵn.<br/>Hãy nhập tên bài ở ô bên dưới!</span>`;
    showStatus(fetchStatus, '⚠️ Vui lòng nhập tên bài tùy chỉnh bên dưới', 'info');
    fetchStatus.classList.remove('hidden');
    generateBtn.disabled = false;
  }
}

function renderLessons(lessons) {
  lessonContainer.className = '';
  lessonContainer.innerHTML = `<div class="topic-list">${
    lessons.map((l,i) => `<div class="topic-item" data-index="${i}" onclick="selectLesson(${i},'${l.replace(/'/g,"\\'")}')">
      <span class="topic-num">${String(i+1).padStart(2,'0')}</span>
      <span class="topic-name">${l}</span>
    </div>`).join('')
  }</div>`;
}

window.selectLesson = function(i, name) {
  state.selectedLesson = name;
  document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('selected'));
  const el = document.querySelector(`.topic-item[data-index="${i}"]`);
  if (el) el.classList.add('selected');
  generateBtn.disabled = false;
};

// ── GENERATE INFOGRAPHIC ────────────────────────────────
async function generateInfographic() {
  const lesson = state.selectedLesson;
  if (!state.apiKey) { toast('⚠️ Nhập API Key trước!','error'); return; }
  if (!lesson) { toast('⚠️ Vui lòng chọn bài học!','error'); return; }
  if (!state.grade || !state.subject) { toast('⚠️ Chọn Lớp và Môn học!','error'); return; }

  generateBtn.querySelector('.btn-text').classList.add('hidden');
  generateBtn.querySelector('.btn-loader').classList.remove('hidden');
  generateBtn.disabled = true;
  showStatus(genStatus, '🤖 AI đang tạo infographic từ kiến thức SGK...', 'info');
  genStatus.classList.remove('hidden');
  emptyState.classList.add('hidden');
  infographicWrapper.classList.add('hidden');
  previewActions.style.display = 'none';

  // Hiện màn hình loading overlay
  const loadingOverlay = document.getElementById('loadingOverlay');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  loadingOverlay.classList.remove('hidden');
  
  let progress = 0;
  progressBar.style.width = '0%';
  progressText.textContent = '0%';

  // Tiến trình giả (Fake progress) tăng từ 0 đến 95%
  const progressInterval = setInterval(() => {
    if (progress < 95) {
      // Tăng ngẫu nhiên từ 1% đến 5%
      progress += Math.floor(Math.random() * 5) + 1;
      if (progress > 95) progress = 95;
      progressBar.style.width = progress + '%';
      progressText.textContent = progress + '%';
    }
  }, 400);

  try {
    const prompt = buildPrompt(lesson, state.subject, state.grade);
    const responseText = await callGemini([{ text: prompt }], false);
    
    // Khi AI trả về xong -> Nhảy lên 100%
    progress = 100;
    progressBar.style.width = '100%';
    progressText.textContent = '100%';

    const data = extractJSON(responseText);
    if (!data || !data.sections) throw new Error('AI không trả về dữ liệu cấu trúc bài học hợp lệ. Vui lòng thử lại.');

    const finalHtml = buildInfographicHTML(data, state.subject, state.grade);
    
    state.lastInfoHTML = finalHtml;
    infographicOutput.innerHTML = finalHtml;
    
    // Chờ một chút để user thấy số 100% rồi mới tắt overlay
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      infographicWrapper.classList.remove('hidden');
      previewActions.style.display = 'flex';
      genStatus.classList.add('hidden');
      toast('✨ Infographic đã được tạo!', 'success');
    }, 500);

  } catch (err) {
    loadingOverlay.classList.add('hidden');
    emptyState.classList.remove('hidden');
    showStatus(genStatus, `❌ Lỗi: ${err.message}`, 'error');
  } finally {
    clearInterval(progressInterval);
    generateBtn.querySelector('.btn-text').classList.remove('hidden');
    generateBtn.querySelector('.btn-loader').classList.add('hidden');
    generateBtn.disabled = false;
  }
}

// ── PROMPT & HTML BUILDER ──────────────────────────────────────────────
function buildPrompt(lesson, subject, grade) {
  return `Bạn là chuyên gia giáo dục. Hãy tóm tắt SÂU, CHI TIẾT và BAO QUÁT toàn bộ nội dung bài học: "${lesson}" môn ${subject} lớp ${grade}.
TRẢ VỀ DUY NHẤT MỘT CHUỖI JSON HỢP LỆ THEO ĐÚNG CẤU TRÚC SAU (không giải thích, không dùng markdown code block, chỉ xuất JSON thuần):
{
  "title": "Tên bài học đầy đủ",
  "mainEmoji": "1 Emoji lớn minh họa chính cho bài",
  "sections": [
    {
      "title": "Tên phần nội dung (ngắn gọn)",
      "icon": "1 Emoji minh họa phần này",
      "bullets": ["Ý chi tiết 1 (1-2 câu)", "Ý chi tiết 2", "Ý chi tiết 3", "Ý chi tiết 4"],
      "example": "1 ví dụ thực tế cực kỳ súc tích (có thể để rỗng nếu không cần)"
    }
  ],
  "reminders": ["Điểm cốt lõi 1", "Điểm cốt lõi 2", "Điểm cốt lõi 3"]
}
YÊU CẦU QUAN TRỌNG:
- Phân tích và tóm tắt TOÀN BỘ nội dung bài học, không được bỏ sót kiến thức quan trọng nào.
- Bắt buộc chia thành TỪ 4 ĐẾN 6 PHẦN (sections) để phủ kín bài. Mỗi phần phải có đủ 3-4 ý (bullets).
- Nội dung dài, đầy đủ ý nhưng câu chữ súc tích.
- TUYỆT ĐỐI CHỈ XUẤT RA JSON.`;
}

function buildInfographicHTML(data, subject, grade) {
  const bookTag = subject === 'Tiếng Anh' ? 'Global Success 🌍' : 'SGK KNTT 📚';
  const gradients = [
    { bg: 'linear-gradient(90deg,#f093fb,#f5576c)', clr: '#e91e8c', light: '#fff0f7' },
    { bg: 'linear-gradient(90deg,#4facfe,#00f2fe)', clr: '#0288d1', light: '#e1f5fe' },
    { bg: 'linear-gradient(90deg,#43e97b,#38f9d7)', clr: '#00897b', light: '#e0f2f1' },
    { bg: 'linear-gradient(90deg,#fa709a,#fee140)', clr: '#e65100', light: '#fff8e1' },
    { bg: 'linear-gradient(90deg,#a18cd1,#fbc2eb)', clr: '#7b1fa2', light: '#f3e5f5' },
    { bg: 'linear-gradient(90deg,#f6d365,#fda085)', clr: '#f57c00', light: '#fff3e0' }
  ];

  let sectionsHTML = '';
  if (data.sections && Array.isArray(data.sections)) {
    data.sections.forEach((sec, i) => {
      const style = gradients[i % gradients.length];
      let bulletsHTML = '';
      if (sec.bullets && Array.isArray(sec.bullets)) {
        sec.bullets.forEach(b => {
          bulletsHTML += `<div style="display:flex;gap:9px;align-items:flex-start;">
            <span style="min-width:22px;height:22px;background:${style.clr};border-radius:50%;color:white;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px;">✦</span>
            <span style="font-size:13px;color:#2d2d2d;line-height:1.6;">${b}</span>
          </div>`;
        });
      }

      sectionsHTML += `
<div style="margin:14px 18px 0;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.07);">
  <div style="background:${style.bg};padding:11px 16px;display:flex;align-items:center;gap:10px;">
    <span style="font-size:24px;">${sec.icon || '📌'}</span>
    <span style="color:white;font-weight:800;font-size:15px;">${sec.title}</span>
  </div>
  <div style="padding:12px 16px;">
    <div style="display:flex;flex-direction:column;gap:7px;">
      ${bulletsHTML}
    </div>
    ${sec.example ? `
    <div style="margin-top:10px;background:${style.light};border-left:4px solid ${style.clr};border-radius:0 10px 10px 0;padding:8px 12px;">
      <span style="font-weight:800;color:${style.clr};font-size:12px;">💡 Ví dụ: </span>
      <span style="font-size:12.5px;color:#444;">${sec.example}</span>
    </div>` : ''}
  </div>
</div>`;
    });
  }

  let remindersHTML = '';
  if (data.reminders && Array.isArray(data.reminders) && data.reminders.length > 0) {
    let badges = '';
    data.reminders.forEach((r, i) => {
      if (i === data.reminders.length - 1) {
        badges += `<span style="background:#1a1a2e;color:#FFD700;font-size:12.5px;font-weight:800;padding:5px 14px;border-radius:20px;">🏆 ${r}</span>`;
      } else {
        badges += `<span style="background:rgba(255,255,255,0.85);color:#1a1a2e;font-size:12.5px;font-weight:700;padding:5px 14px;border-radius:20px;">✅ ${r}</span>`;
      }
    });
    remindersHTML = `
<div style="margin:14px 18px 18px;background:linear-gradient(135deg,#f7971e,#ffd200);border-radius:16px;padding:16px 18px;position:relative;overflow:hidden;">
  <div style="position:absolute;right:-10px;top:-10px;font-size:80px;opacity:0.15;">⭐</div>
  <div style="text-align:center;font-size:16px;font-weight:900;color:#1a1a2e;margin-bottom:11px;">⚡ Ghi nhớ nhanh</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
    ${badges}
  </div>
</div>`;
  }

  return `
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<div style="width:100%;max-width:700px;background:linear-gradient(160deg,#FFF8EC 0%,#FEF0F8 50%,#EEF4FF 100%);border:3px solid #E8C87A;border-radius:24px;padding:0;font-family:'Be Vietnam Pro',sans-serif;box-sizing:border-box;overflow:hidden;position:relative;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:22px 26px 18px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;background:rgba(255,255,255,0.08);border-radius:50%;"></div>
    <div style="position:absolute;bottom:-30px;left:30px;width:80px;height:80px;background:rgba(255,255,255,0.06);border-radius:50%;"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span style="background:#FFD700;color:#1a1a2e;font-size:12px;font-weight:900;padding:5px 14px;border-radius:20px;letter-spacing:0.5px;">${subject.toUpperCase()} • Lớp ${grade}</span>
      <span style="background:rgba(255,255,255,0.2);color:white;font-size:11px;padding:4px 12px;border-radius:20px;">${bookTag}</span>
    </div>
    <div style="text-align:center;color:white;font-size:22px;font-weight:900;line-height:1.3;text-shadow:0 2px 8px rgba(0,0,0,0.2);">${data.title}</div>
    <div style="text-align:center;margin-top:14px;font-size:70px;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.2));">
      ${data.mainEmoji || '📚'}
    </div>
  </div>
  ${sectionsHTML}
  ${remindersHTML}
</div>`;
}

// ── GEMINI API ───────────────────────────────────────────
async function callGemini(parts, useSearch = false) {
  const model = state.model;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`;
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: "application/json" }
  };
  if (useSearch) body.tools = [{ googleSearch: {} }];

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Không nhận được phản hồi từ Gemini');
  return text;
}

// ── HELPERS ──────────────────────────────────────────────
function extractJSON(text) {
  try { const m = text.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; }
  catch { return null; }
}

function extractHTML(text) {
  let m = text.match(/```html\s*([\s\S]*?)```/i);
  if (m) return m[1].trim();
  m = text.match(/```\s*([\s\S]*?)```/i);
  if (m) return m[1].trim();
  const t = text.trim();
  if (t.startsWith('<link') || t.startsWith('<div') || t.startsWith('<style')) return t;
  m = t.match(/(<link[\s\S]*|<div[\s\S]*)/i);
  return m ? m[1].trim() : t;
}

function showStatus(el, msg, type) {
  el.textContent = msg; el.className = `status-msg ${type}`; el.classList.remove('hidden');
}

function toast(msg, type = 'info') {
  const t = $('toast'); t.textContent = msg; t.className = `toast ${type}`;
  t.classList.remove('hidden'); clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.add('hidden'), 3500);
}

// ── EXPORT PNG ────────────────────────────────────────────
async function exportPNG() {
  if (!state.lastInfoHTML) return;
  if (window.html2canvas) {
    toast('⏳ Đang tạo ảnh PNG...', 'info');
    try {
      // Tạm thời mở rộng container để chụp toàn bộ nội dung (fix mobile bị cắt)
      const wrapper = document.getElementById('infographicWrapper');
      const output = infographicOutput;
      const innerDiv = output.querySelector(':scope > div');
      
      // Lưu style gốc
      const origWrapperOverflow = wrapper.style.overflow;
      const origOutputWidth = output.style.width;
      const origOutputMaxWidth = output.style.maxWidth;
      const origOutputOverflow = output.style.overflow;
      const origInnerWidth = innerDiv ? innerDiv.style.width : '';
      const origInnerMaxWidth = innerDiv ? innerDiv.style.maxWidth : '';
      
      // Tạm set style để chụp đầy đủ
      wrapper.style.overflow = 'visible';
      output.style.width = '700px';
      output.style.maxWidth = 'none';
      output.style.overflow = 'visible';
      if (innerDiv) {
        innerDiv.style.width = '700px';
        innerDiv.style.maxWidth = 'none';
      }
      
      // Chờ reflow
      await new Promise(r => setTimeout(r, 100));
      
      const canvas = await html2canvas(output, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        width: 700,
        windowWidth: 750,
        scrollX: 0,
        scrollY: 0
      });
      
      // Khôi phục style gốc
      wrapper.style.overflow = origWrapperOverflow;
      output.style.width = origOutputWidth;
      output.style.maxWidth = origOutputMaxWidth;
      output.style.overflow = origOutputOverflow;
      if (innerDiv) {
        innerDiv.style.width = origInnerWidth;
        innerDiv.style.maxWidth = origInnerMaxWidth;
      }
      
      const a = document.createElement('a'); a.href = canvas.toDataURL('image/png');
      a.download = `infographic_${Date.now()}.png`; a.click();
      toast('✅ Đã tải PNG!', 'success');
    } catch(e) { toast('❌ Lỗi: ' + e.message, 'error'); }
  } else {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = exportPNG; document.head.appendChild(s);
    toast('⏳ Đang tải thư viện xuất ảnh...', 'info');
  }
}

// ── EXPORT HTML ───────────────────────────────────────────
function exportHTML() {
  if (!state.lastInfoHTML) return;
  // Khi xuất HTML, đảm bảo nội dung có width cố định 700px để hiển thị đúng
  const exportHTML = state.lastInfoHTML.replace(
    /width:\s*100%;\s*max-width:\s*700px/g,
    'width:700px;max-width:700px'
  );
  const full = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/><title>Infographic SGK</title><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&display=swap" rel="stylesheet"/><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#f0f1ff;display:flex;justify-content:center;padding:40px 20px;font-family:'Be Vietnam Pro',sans-serif}</style></head><body>${exportHTML}</body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([full], { type: 'text/html;charset=utf-8' }));
  a.download = `infographic_${Date.now()}.html`; a.click();
  toast('✅ Đã xuất HTML!', 'success');
}

// ── EXPORT PDF ────────────────────────────────────────────
async function exportPDF() {
  if (!state.lastInfoHTML) return;
  if (window.html2canvas && window.jspdf) {
    toast('⏳ Đang tạo PDF...', 'info');
    try {
      // Tạm thời mở rộng container để chụp toàn bộ nội dung (fix mobile bị cắt)
      const wrapper = document.getElementById('infographicWrapper');
      const output = infographicOutput;
      const innerDiv = output.querySelector(':scope > div');
      
      // Lưu style gốc
      const origWrapperOverflow = wrapper.style.overflow;
      const origOutputWidth = output.style.width;
      const origOutputMaxWidth = output.style.maxWidth;
      const origOutputOverflow = output.style.overflow;
      const origInnerWidth = innerDiv ? innerDiv.style.width : '';
      const origInnerMaxWidth = innerDiv ? innerDiv.style.maxWidth : '';
      
      // Tạm set style để chụp đầy đủ
      wrapper.style.overflow = 'visible';
      output.style.width = '700px';
      output.style.maxWidth = 'none';
      output.style.overflow = 'visible';
      if (innerDiv) {
        innerDiv.style.width = '700px';
        innerDiv.style.maxWidth = 'none';
      }
      
      // Chờ reflow
      await new Promise(r => setTimeout(r, 100));
      
      const canvas = await html2canvas(output, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        width: 700,
        windowWidth: 750,
        scrollX: 0,
        scrollY: 0
      });
      
      // Khôi phục style gốc
      wrapper.style.overflow = origWrapperOverflow;
      output.style.width = origOutputWidth;
      output.style.maxWidth = origOutputMaxWidth;
      output.style.overflow = origOutputOverflow;
      if (innerDiv) {
        innerDiv.style.width = origInnerWidth;
        innerDiv.style.maxWidth = origInnerMaxWidth;
      }
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Lề 10mm mỗi bên
      const margin = 10;
      const usableWidth = pdfWidth - margin * 2;
      const usableHeight = pdfHeight - margin * 2;
      
      // Tính kích thước ảnh trên PDF, giữ nguyên tỉ lệ theo chiều rộng
      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;
      
      // Nếu ảnh vừa 1 trang → đặt vào 1 trang, căn giữa
      if (imgHeight <= usableHeight) {
        const x = margin;
        const y = (pdfHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      } else {
        // Ảnh dài hơn 1 trang → chia thành nhiều trang
        let yOffset = 0; // vị trí cắt trên ảnh gốc (tính theo mm trên PDF)
        let pageIndex = 0;
        
        while (yOffset < imgHeight) {
          if (pageIndex > 0) pdf.addPage();
          
          // Tính phần ảnh cần hiển thị trên trang này
          const sliceHeight = Math.min(usableHeight, imgHeight - yOffset);
          
          // Dùng canvas con để cắt phần ảnh tương ứng
          const sourceY = (yOffset / imgHeight) * canvas.height;
          const sourceH = (sliceHeight / imgHeight) * canvas.height;
          
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.round(sourceH);
          const ctx = sliceCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, Math.round(sourceY), canvas.width, Math.round(sourceH), 0, 0, canvas.width, Math.round(sourceH));
          
          const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(sliceData, 'JPEG', margin, margin, imgWidth, sliceHeight);
          
          yOffset += usableHeight;
          pageIndex++;
        }
      }
      
      pdf.save(`infographic_${Date.now()}.pdf`);
      toast('✅ Đã tải PDF!', 'success');
    } catch (e) {
      toast('❌ Lỗi: ' + e.message, 'error');
    }
  } else {
    toast('⏳ Đang tải thư viện xuất PDF...', 'info');
    let loaded = 0;
    const checkLoad = () => { loaded++; if (loaded === 2) exportPDF(); };
    
    if (!window.html2canvas) {
      const s1 = document.createElement('script');
      s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s1.onload = checkLoad; document.head.appendChild(s1);
    } else {
      loaded++;
    }
    
    if (!window.jspdf) {
      const s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s2.onload = checkLoad; document.head.appendChild(s2);
    } else {
      loaded++;
    }
  }
}

// ── CHANGE PASSWORD ──────────────────────────────────────
async function handleChangePassword() {
  const tk = localStorage.getItem('sgk_user_logged');
  const oldPwd = oldPwdInput.value.trim();
  const newPwd = newPwdInput.value.trim();
  const confirmPwd = confirmPwdInput.value.trim();

  if (!tk) { toast('⚠️ Vui lòng đăng nhập trước!', 'error'); return; }
  if (!oldPwd || !newPwd || !confirmPwd) {
    showStatus(changePwdStatus, 'Vui lòng nhập đầy đủ các trường!', 'error'); return;
  }
  if (newPwd !== confirmPwd) {
    showStatus(changePwdStatus, 'Mật khẩu mới và xác nhận không khớp!', 'error'); return;
  }
  if (newPwd.length < 4) {
    showStatus(changePwdStatus, 'Mật khẩu mới phải có ít nhất 4 ký tự!', 'error'); return;
  }
  if (oldPwd === newPwd) {
    showStatus(changePwdStatus, 'Mật khẩu mới phải khác mật khẩu cũ!', 'error'); return;
  }

  // Disable button + show loader
  submitChangePwdBtn.disabled = true;
  submitChangePwdBtn.querySelector('.btn-text').classList.add('hidden');
  submitChangePwdBtn.querySelector('.btn-loader').classList.remove('hidden');
  changePwdStatus.classList.add('hidden');

  try {
    const res = await fetch(GAS_LOGIN_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'changePassword', tk: tk.toLowerCase(), oldPwd, newPwd, deviceId: deviceFingerprint }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    const result = await res.json();

    if (result.success) {
      showStatus(changePwdStatus, '✅ ' + result.message, 'success');
      toast('✅ Đổi mật khẩu thành công!', 'success');
      setTimeout(() => {
        changePwdModal.classList.add('hidden');
      }, 1500);
    } else {
      showStatus(changePwdStatus, result.message, 'error');
    }
  } catch (err) {
    showStatus(changePwdStatus, 'Lỗi kết nối máy chủ!', 'error');
  } finally {
    submitChangePwdBtn.disabled = false;
    submitChangePwdBtn.querySelector('.btn-text').classList.remove('hidden');
    submitChangePwdBtn.querySelector('.btn-loader').classList.add('hidden');
  }
}
