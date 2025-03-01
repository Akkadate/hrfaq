/**
 * ไฟล์หลักสำหรับหน้าจัดการข้อมูล
 */

/**
 * โหลดข้อมูลคำถามและหมวดหมู่
 */
async function loadQuestionsData() {
    try {
        // ดึงข้อมูลคำถาม
        const questions = await getQuestionsWithFallback();
        ADMIN_STATE.questions = questions;
        
        // ดึงหมวดหมู่
        const categories = extractCategories(questions);
        ADMIN_STATE.categories = categories;
        
        // อัปเดตแดชบอร์ด
        updateDashboard();
        
        // อัปเดตตารางคำถาม
        updateQuestionsTable();
        
        // อัปเดตตัวเลือกหมวดหมู่
        updateCategoryOptions('categoryFilter', ADMIN_STATE.currentCategory);
        
        // อัปเดตรายการหมวดหมู่
        renderCategoriesList();
        
        return true;
    } catch (error) {
        adminLogError('Error loading questions data:', error);
        showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message, 'error');
        return false;
    }
}

/**
 * ติดตั้ง Event Listeners
 */
function setupEventListeners() {
    // เมนูแอดมิน
    ADMIN_DOM.menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) {
                switchAdminPage(page);
            }
        });
    });
    
    // ปุ่มเข้าสู่ระบบและออกจากระบบ
    if (ADMIN_DOM.loginButton) {
        ADMIN_DOM.loginButton.addEventListener('click', adminLogin);
    }
    
    if (ADMIN_DOM.logoutButton) {
        ADMIN_DOM.logoutButton.addEventListener('click', adminLogout);
    }
    
    // ปุ่มแดชบอร์ด
    if (ADMIN_DOM.addQuestionBtn) {
        ADMIN_DOM.addQuestionBtn.addEventListener('click', openAddQuestionModal);
    }
    
    if (ADMIN_DOM.refreshDataBtn) {
        ADMIN_DOM.refreshDataBtn.addEventListener('click', refreshData);
    }
    
    if (ADMIN_DOM.exportDataBtn) {
        ADMIN_DOM.exportDataBtn.addEventListener('click', exportQuestions);
    }
    
    // ปุ่มในหน้าคำถาม
    if (ADMIN_DOM.addNewQuestionBtn) {
        ADMIN_DOM.addNewQuestionBtn.addEventListener('click', openAddQuestionModal);
    }
    
    if (ADMIN_DOM.questionSearchBtn) {
        ADMIN_DOM.questionSearchBtn.addEventListener('click', searchQuestions);
    }
    
    if (ADMIN_DOM.questionSearchInput) {
        ADMIN_DOM.questionSearchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                searchQuestions();
            }
        });
    }
    
    if (ADMIN_DOM.categoryFilter) {
        ADMIN_DOM.categoryFilter.addEventListener('change', filterByCategory);
    }
    
    // ปุ่มเพจเนชัน
    ADMIN_DOM.paginationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const direction = btn.dataset.page;
            if (direction) {
                changePage(direction);
            }
        });
    });
    
    // ปุ่มในหน้าหมวดหมู่
    if (ADMIN_DOM.addNewCategoryBtn) {
        ADMIN_DOM.addNewCategoryBtn.addEventListener('click', () => {
            cancelCategoryEdit(); // รีเซ็ตฟอร์ม
        });
    }
    
    if (ADMIN_DOM.categoryForm) {
        ADMIN_DOM.categoryForm.addEventListener('submit', saveCategory);
    }
    
    if (ADMIN_DOM.cancelCategoryBtn) {
        ADMIN_DOM.cancelCategoryBtn.addEventListener('click', cancelCategoryEdit);
    }
    
    // ตัวเลือกไอคอน
    ADMIN_DOM.iconItems.forEach(item => {
        item.addEventListener('click', () => {
            const icon = item.dataset.icon;
            if (icon) {
                selectCategoryIcon(icon);
            }
        });
    });
    
    // ปุ่มในฟอร์มการตั้งค่า
    if (ADMIN_DOM.settingsForm) {
        ADMIN_DOM.settingsForm.addEventListener('submit', saveSettings);
    }
    
    if (ADMIN_DOM.resetSettingsBtn) {
        ADMIN_DOM.resetSettingsBtn.addEventListener('click', resetSettings);
    }
    
    // ปุ่มใน Modal
    ADMIN_DOM.modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });
    
    if (ADMIN_DOM.saveQuestionBtn) {
        ADMIN_DOM.saveQuestionBtn.addEventListener('click', saveQuestion);
    }
}

/**
 * ตรวจสอบการเข้าสู่ระบบแอดมิน
 */
function checkAdminLogin() {
    const isLoggedIn = isAdminLoggedIn();
    
    if (ADMIN_DOM.loginForm && ADMIN_DOM.userInfo) {
        if (isLoggedIn) {
            ADMIN_DOM.loginForm.style.display = 'none';
            ADMIN_DOM.userInfo.style.display = 'flex';
        } else {
            ADMIN_DOM.loginForm.style.display = 'block';
            ADMIN_DOM.userInfo.style.display = 'none';
        }
    }
    
    return isLoggedIn;
}

/**
 * เข้าสู่ระบบแอดมิน
 */
function adminLogin() {
    const username = ADMIN_DOM.username.value.trim();
    const password = ADMIN_DOM.password.value.trim();
    
    // ในตัวอย่างนี้ใช้การตรวจสอบอย่างง่าย (ในระบบจริงควรใช้การตรวจสอบที่ปลอดภัยกว่านี้)
    if (username === 'admin' && password === 'admin123') {
        setAdminLoginStatus(true);
        checkAdminLogin();
        showNotification('เข้าสู่ระบบสำเร็จ', 'success');
    } else {
        showNotification('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
    }
}

/**
 * ออกจากระบบแอดมิน
 */
function adminLogout() {
    setAdminLoginStatus(false);
    checkAdminLogin();
    showNotification('ออกจากระบบสำเร็จ', 'info');
}

/**
 * เริ่มต้นหน้าจัดการข้อมูล
 */
async function initAdminPage() {
    try {
        // ติดตั้ง TinyMCE
