/**
 * ไฟล์ฟังก์ชันช่วยเหลือสำหรับหน้าจัดการข้อมูล
 */

/**
 * บันทึกข้อมูลทั่วไปลงใน Console (สำหรับการพัฒนา)
 * @param {...any} args - ข้อมูลที่ต้องการบันทึก
 */
function adminLogInfo(...args) {
    console.log('[ADMIN INFO]', ...args);
}

/**
 * บันทึกข้อผิดพลาดลงใน Console
 * @param {string} message - ข้อความแสดงข้อผิดพลาด
 * @param {Error} error - ออบเจ็กต์ Error
 */
function adminLogError(message, error) {
    console.error('[ADMIN ERROR]', message, error);
}

/**
 * แสดงข้อความแจ้งเตือน
 * @param {string} message - ข้อความแจ้งเตือน
 * @param {string} type - ประเภทการแจ้งเตือน (success, error, info)
 */
function showNotification(message, type = 'info') {
    // ตรวจสอบว่ามี notification container หรือไม่
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // สร้าง notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // เพิ่มไอคอนตามประเภท
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // เพิ่ม notification ลงใน container
    container.appendChild(notification);
    
    // ลบ notification หลังจากแสดงเป็นเวลา 5 วินาที
    setTimeout(() => {
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

/**
 * แสดง Modal
 * @param {string} modalId - ID ของ Modal ที่ต้องการแสดง
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * ซ่อน Modal
 * @param {string} modalId - ID ของ Modal ที่ต้องการซ่อน
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * แสดงกล่องยืนยันการดำเนินการ
 * @param {string} message - ข้อความยืนยัน
 * @param {Function} confirmCallback - ฟังก์ชันที่จะเรียกเมื่อยืนยัน
 */
function showConfirmation(message, confirmCallback) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    
    if (confirmModal && confirmMessage && confirmActionBtn) {
        confirmMessage.textContent = message;
        
        // ลบ event listener เดิม (ถ้ามี)
        const newConfirmBtn = confirmActionBtn.cloneNode(true);
        confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);
        
        // เพิ่ม event listener ใหม่
        newConfirmBtn.addEventListener('click', () => {
            if (typeof confirmCallback === 'function') {
                confirmCallback();
            }
            hideModal('confirmModal');
        });
        
        showModal('confirmModal');
    }
}

/**
 * ติดตั้ง TinyMCE editor
 * @param {string} selector - CSS selector ของ element ที่จะติดตั้ง editor
 */
function initTinyMCE(selector) {
    if (typeof tinymce !== 'undefined') {
        tinymce.init({
            selector: selector,
            height: 300,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
            content_style: 'body { font-family: Sarabun, sans-serif; font-size: 16px }',
            language: 'th',
            language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/th.js'
        });
    } else {
        adminLogError('TinyMCE not available');
    }
}

/**
 * รับค่าจาก TinyMCE editor
 * @param {string} editorId - ID ของ editor
 * @returns {string} - เนื้อหาของ editor
 */
function getTinyMCEContent(editorId) {
    if (typeof tinymce !== 'undefined' && tinymce.get(editorId)) {
        return tinymce.get(editorId).getContent();
    }
    return document.getElementById(editorId)?.value || '';
}

/**
 * ตั้งค่า TinyMCE editor
 * @param {string} editorId - ID ของ editor
 * @param {string} content - เนื้อหาที่ต้องการตั้งค่า
 */
function setTinyMCEContent(editorId, content) {
    if (typeof tinymce !== 'undefined' && tinymce.get(editorId)) {
        tinymce.get(editorId).setContent(content || '');
    } else {
        const editor = document.getElementById(editorId);
        if (editor) {
            editor.value = content || '';
        }
    }
}

/**
 * สลับระหว่างหน้าต่างๆ ในหน้าจัดการข้อมูล
 * @param {string} pageId - ID ของหน้าที่ต้องการแสดง
 */
function switchAdminPage(pageId) {
    // ซ่อนทุกหน้า
    document.querySelectorAll('.admin-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // แสดงหน้าที่เลือก
    const selectedPage = document.getElementById(`${pageId}Page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // อัปเดตเมนูที่เลือก
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedMenuItem = document.querySelector(`.admin-menu-item[data-page="${pageId}"]`);
    if (selectedMenuItem) {
        selectedMenuItem.classList.add('active');
    }
    
    // บันทึกหน้าปัจจุบันลงใน sessionStorage
    sessionStorage.setItem('currentAdminPage', pageId);
}

/**
 * บันทึกการตั้งค่าลงใน localStorage
 * @param {Object} settings - การตั้งค่าที่ต้องการบันทึก
 */
function saveAdminSettings(settings) {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
}

/**
 * โหลดการตั้งค่าจาก localStorage
 * @returns {Object} - การตั้งค่าที่บันทึกไว้
 */
function loadAdminSettings() {
    const settings = localStorage.getItem('adminSettings');
    return settings ? JSON.parse(settings) : null;
}

/**
 * ตรวจสอบการเข้าสู่ระบบ
 * @returns {boolean} - สถานะการเข้าสู่ระบบ
 */
function isAdminLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

/**
 * บันทึกสถานะการเข้าสู่ระบบ
 * @param {boolean} status - สถานะการเข้าสู่ระบบ
 */
function setAdminLoginStatus(status) {
    localStorage.setItem('adminLoggedIn', status ? 'true' : 'false');
}

/**
 * ส่งออกข้อมูลเป็นไฟล์ JSON
 * @param {Object} data - ข้อมูลที่ต้องการส่งออก
 * @param {string} filename - ชื่อไฟล์
 */
function exportDataToJson(data, filename = 'faq_data.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

// เพิ่มสไตล์ CSS สำหรับการแจ้งเตือน
const notificationStyles = `
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.notification {
    background-color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    min-width: 250px;
    max-width: 350px;
    animation: notification-appear 0.3s ease;
    transition: opacity 0.3s, transform 0.3s;
}

.notification i {
    margin-right: 10px;
    font-size: 1.25rem;
}

.notification-success {
    border-left: 4px solid #48bb78;
}

.notification-success i {
    color: #48bb78;
}

.notification-error {
    border-left: 4px solid #e53e3e;
}

.notification-error i {
    color: #e53e3e;
}

.notification-info {
    border-left: 4px solid #3182ce;
}

.notification-info i {
    color: #3182ce;
}

.notification-hide {
    opacity: 0;
    transform: translateX(50px);
}

@keyframes notification-appear {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
`;

// เพิ่ม CSS style ลงในหน้า
(function() {
    const style = document.createElement('style');
    style.textContent = notificationStyles;
    document.head.appendChild(style);
})();
