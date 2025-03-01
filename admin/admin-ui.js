/**
 * ไฟล์จัดการ UI สำหรับหน้าจัดการข้อมูล
 */

// DOM Elements
const ADMIN_DOM = {
    // เมนูและหน้า
    menuItems: document.querySelectorAll('.admin-menu-item'),
    adminPages: document.querySelectorAll('.admin-page'),
    
    // การเข้าสู่ระบบ
    loginForm: document.getElementById('loginForm'),
    userInfo: document.getElementById('userInfo'),
    loginButton: document.getElementById('loginButton'),
    logoutButton: document.getElementById('logoutButton'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    
    // แดชบอร์ด
    totalQuestions: document.getElementById('totalQuestions'),
    totalCategories: document.getElementById('totalCategories'),
    lastUpdated: document.getElementById('lastUpdated'),
    apiStatus: document.getElementById('apiStatus'),
    recentQuestions: document.getElementById('recentQuestions'),
    addQuestionBtn: document.getElementById('addQuestionBtn'),
    refreshDataBtn: document.getElementById('refreshDataBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    
    // จัดการคำถาม
    questionSearchInput: document.getElementById('questionSearchInput'),
    questionSearchBtn: document.getElementById('questionSearchBtn'),
    categoryFilter: document.getElementById('categoryFilter'),
    addNewQuestionBtn: document.getElementById('addNewQuestionBtn'),
    questionsTable: document.getElementById('questionsTable'),
    currentPage: document.getElementById('currentPage'),
    totalPages: document.getElementById('totalPages'),
    paginationBtns: document.querySelectorAll('.pagination-btn'),
    
    // จัดการหมวดหมู่
    categoriesList: document.getElementById('categoriesList'),
    addNewCategoryBtn: document.getElementById('addNewCategoryBtn'),
    categoryForm: document.getElementById('categoryForm'),
    categoryFormTitle: document.getElementById('categoryFormTitle'),
    categoryId: document.getElementById('categoryId'),
    categoryName: document.getElementById('categoryName'),
    categoryIcon: document.getElementById('categoryIcon'),
    cancelCategoryBtn: document.getElementById('cancelCategoryBtn'),
    iconItems: document.querySelectorAll('.icon-item'),
    selectedIcon: document.querySelector('.selected-icon'),
    
    // การตั้งค่า
    settingsForm: document.getElementById('settingsForm'),
    supabaseUrl: document.getElementById('supabaseUrl'),
    supabaseKey: document.getElementById('supabaseKey'),
    supabaseTable: document.getElementById('supabaseTable'),
    appTitle: document.getElementById('appTitle'),
    appVersion: document.getElementById('appVersion'),
    cacheEnabled: document.getElementById('cacheEnabled'),
    cacheDuration: document.getElementById('cacheDuration'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn'),
    
    // Modal
    questionModal: document.getElementById('questionModal'),
    modalTitle: document.getElementById('modalTitle'),
    questionForm: document.getElementById('questionForm'),
    questionId: document.getElementById('questionId'),
    questionText: document.getElementById('questionText'),
    questionCategory: document.getElementById('questionCategory'),
    questionAnswer: document.getElementById('questionAnswer'),
    saveQuestionBtn: document.getElementById('saveQuestionBtn'),
    modalCloseBtns: document.querySelectorAll('.modal-close, .modal-close-btn'),
    
    // Confirmation
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmActionBtn: document.getElementById('confirmActionBtn')
};

// State variables
const ADMIN_STATE = {
    questions: [],
    filteredQuestions: [],
    categories: [],
    categoryCount: {},
    currentPage: 1,
    questionsPerPage: 10,
    currentCategory: 'all',
    searchQuery: '',
    isEditing: false,
    editCategoryId: null
};

/**
 * อัปเดตการแสดงผลสถานะ API
 * @param {boolean} isConnected - สถานะการเชื่อมต่อ
 */
function updateApiStatusDisplay(isConnected) {
    if (!ADMIN_DOM.apiStatus) return;
    
    if (isConnected) {
        ADMIN_DOM.apiStatus.textContent = 'เชื่อมต่อได้';
        ADMIN_DOM.apiStatus.style.color = '#48bb78';
    } else {
        ADMIN_DOM.apiStatus.textContent = 'ไม่สามารถเชื่อมต่อได้';
        ADMIN_DOM.apiStatus.style.color = '#e53e3e';
    }
}

/**
 * อัปเดตแดชบอร์ด
 */
async function updateDashboard() {
    if (!ADMIN_DOM.totalQuestions || !ADMIN_DOM.totalCategories || !ADMIN_DOM.lastUpdated) return;
    
    // อัปเดตจำนวนคำถามและหมวดหมู่
    ADMIN_DOM.totalQuestions.textContent = ADMIN_STATE.questions.length;
    ADMIN_DOM.totalCategories.textContent = ADMIN_STATE.categories.length;
    
    // อัปเดตวันที่อัปเดตล่าสุด
    const latestQuestion = getRecentQuestions(ADMIN_STATE.questions, 1)[0];
    if (latestQuestion && latestQuestion.created_at) {
        ADMIN_DOM.lastUpdated.textContent = formatThaiDate(latestQuestion.created_at);
    } else {
        ADMIN_DOM.lastUpdated.textContent = formatThaiDate(new Date().toISOString());
    }
    
    // ตรวจสอบการเชื่อมต่อ API
    const isConnected = await testSupabaseConnection();
    updateApiStatusDisplay(isConnected);
    
    // แสดงคำถามล่าสุด
    renderRecentQuestions();
}

/**
 * แสดงรายการคำถามล่าสุดบนแดชบอร์ด
 */
function renderRecentQuestions() {
    if (!ADMIN_DOM.recentQuestions) return;
    
    const recentQuestions = getRecentQuestions(ADMIN_STATE.questions, 5);
    
    if (recentQuestions.length === 0) {
        ADMIN_DOM.recentQuestions.innerHTML = '<p class="text-center">ไม่มีคำถามล่าสุด</p>';
        return;
    }
    
    let html = '';
    
    recentQuestions.forEach(question => {
        html += `
            <div class="recent-item">
                <div class="recent-item-info">
                    <div class="recent-item-title">${question.question}</div>
                    <div class="recent-item-category">หมวดหมู่: ${question.group || 'ไม่ระบุ'}</div>
                    <div class="recent-item-date">วันที่: ${formatThaiDate(question.created_at)}</div>
                </div>
                <div class="recent-item-actions">
                    <button class="action-btn edit-btn" data-id="${question.id}" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${question.id}" title="ลบ">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    ADMIN_DOM.recentQuestions.innerHTML = html;
    
    // เพิ่ม event listeners สำหรับปุ่มแก้ไขและลบ
    ADMIN_DOM.recentQuestions.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditQuestionModal(btn.dataset.id));
    });
    
    ADMIN_DOM.recentQuestions.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteQuestion(btn.dataset.id));
    });
}

/**
 * อัปเดตรายการคำถามในตาราง
 */
function updateQuestionsTable() {
    if (!ADMIN_DOM.questionsTable) return;
    
    // กรองและเรียงข้อมูล
    let filteredData = ADMIN_STATE.questions;
    
    // กรองตามหมวดหมู่
    if (ADMIN_STATE.currentCategory !== 'all') {
        filteredData = filteredData.filter(q => q.group === ADMIN_STATE.currentCategory);
    }
    
    // กรองตามคำค้นหา
    if (ADMIN_STATE.searchQuery) {
        const query = ADMIN_STATE.searchQuery.toLowerCase().trim();
        filteredData = filteredData.filter(q => 
            q.question.toLowerCase().includes(query) || 
            q.answer.toLowerCase().includes(query)
        );
    }
    
    // เก็บข้อมูลที่กรองแล้ว
    ADMIN_STATE.filteredQuestions = filteredData;
    
    // คำนวณเพจเนชัน
    const totalPages = Math.ceil(filteredData.length / ADMIN_STATE.questionsPerPage);
    const startIndex = (ADMIN_STATE.currentPage - 1) * ADMIN_STATE.questionsPerPage;
    const endIndex = Math.min(startIndex + ADMIN_STATE.questionsPerPage, filteredData.length);
    
    // อัปเดตตัวเลขหน้า
    if (ADMIN_DOM.currentPage) {
        ADMIN_DOM.currentPage.textContent = ADMIN_STATE.currentPage;
    }
    
    if (ADMIN_DOM.totalPages) {
        ADMIN_DOM.totalPages.textContent = totalPages || 1;
    }
    
    // แสดงข้อมูลในหน้าปัจจุบัน
    const currentPageData = filteredData.slice(startIndex, endIndex);
    
    // สร้าง HTML สำหรับตาราง
    let tableBodyHtml = '';
    
    if (currentPageData.length === 0) {
        tableBodyHtml = `<tr><td colspan="5" class="text-center">ไม่พบข้อมูลคำถาม</td></tr>`;
    } else {
        currentPageData.forEach((question, index) => {
            tableBodyHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${question.question}</td>
                    <td>${question.group || 'ไม่ระบุ'}</td>
                    <td>${formatThaiDate(question.created_at)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit-btn" data-id="${question.id}" title="แก้ไข">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" data-id="${question.id}" title="ลบ">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    // อัปเดตเนื้อหาตาราง
    const tableBody = ADMIN_DOM.questionsTable.querySelector('tbody');
    if (tableBody) {
        tableBody.innerHTML = tableBodyHtml;
        
        // เพิ่ม event listeners สำหรับปุ่มแก้ไขและลบ
        tableBody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditQuestionModal(btn.dataset.id));
        });
        
        tableBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteQuestion(btn.dataset.id));
        });
    }
}

/**
 * อัปเดตตัวเลือกหมวดหมู่ในฟอร์ม
 * @param {string} selectElementId - ID ของ select element
 * @param {string} selectedValue - ค่าที่เลือก
 */
function updateCategoryOptions(selectElementId, selectedValue = '') {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;
    
    // ล้างตัวเลือกเดิม
    selectElement.innerHTML = '';
    
    // เพิ่มตัวเลือกเริ่มต้น
    if (selectElementId === 'categoryFilter') {
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'ทั้งหมด';
        selectElement.appendChild(allOption);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'เลือกหมวดหมู่';
        selectElement.appendChild(defaultOption);
    }
    
    // เพิ่มตัวเลือกหมวดหมู่
    ADMIN_STATE.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        
        if (category === selectedValue) {
            option.selected = true;
        }
        
        selectElement.appendChild(option);
    });
}

/**
 * แสดงรายการหมวดหมู่
 */
function renderCategoriesList() {
    if (!ADMIN_DOM.categoriesList) return;
    
    // คำนวณจำนวนคำถามในแต่ละหมวดหมู่
    const categoryCount = countQuestionsPerCategory(ADMIN_STATE.questions);
    
    let html = '';
    
    if (ADMIN_STATE.categories.length === 0) {
        html = '<p class="text-center">ไม่มีหมวดหมู่</p>';
    } else {
        ADMIN_STATE.categories.forEach(category => {
            const count = categoryCount[category] || 0;
            const icon = CONFIG.groupIcons[category] || CONFIG.defaultGroupIcon;
            
            html += `
                <div class="category-item" data-category="${category}">
                    <div class="category-info">
                        <div class="category-icon">
                            <i class="${icon}"></i>
                        </div>
                        <div>
                            <div class="category-name">${category}</div>
                            <div class="category-count">${count} คำถาม</div>
                        </div>
                    </div>
                    <div class="category-actions">
                        <button class="action-btn edit-btn" data-category="${category}" title="แก้ไข">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-category="${category}" title="ลบ">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    }
    
    ADMIN_DOM.categoriesList.innerHTML = html;
    
    // เพิ่ม event listeners สำหรับปุ่มแก้ไขและลบ
    ADMIN_DOM.categoriesList.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editCategory(btn.dataset.category));
    });
    
    ADMIN_DOM.categoriesList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteCategory(btn.dataset.category));
    });
}

/**
 * เปิด Modal สำหรับเพิ่มคำถามใหม่
 */
function openAddQuestionModal() {
    // รีเซ็ตฟอร์ม
    ADMIN_DOM.questionForm.reset();
    ADMIN_DOM.questionId.value = '';
    setTinyMCEContent('questionAnswer', '');
    
    // อัปเดตชื่อ Modal
    ADMIN_DOM.modalTitle.textContent = 'เพิ่มคำถามใหม่';
    
    // อัปเดตตัวเลือกหมวดหมู่
    updateCategoryOptions('questionCategory');
    
    // แสดง Modal
    showModal('questionModal');
}

/**
 * เปิด Modal สำหรับแก้ไขคำถาม
 * @param {number} id - ID ของคำถามที่ต้องการแก้ไข
 */
async function openEditQuestionModal(id) {
    // ดึงข้อมูลคำถาม
    const question = ADMIN_STATE.questions.find(q => q.id == id);
    if (!question) {
        showNotification('ไม่พบข้อมูลคำถาม', 'error');
        return;
    }
    
    // อัปเดตฟอร์ม
    ADMIN_DOM.questionId.value = question.id;
    ADMIN_DOM.questionText.value = question.question;
    
    // อัปเดตเนื้อหา TinyMCE
    setTinyMCEContent('questionAnswer', question.answer || '');
    
    // อัปเดตชื่อ Modal
    ADMIN_DOM.modalTitle.textContent = 'แก้ไขคำถาม';
    
    // อัปเดตตัวเลือกหมวดหมู่
    updateCategoryOptions('questionCategory', question.group);
    
    // แสดง Modal
    showModal('questionModal');
}

/**
 * บันทึกข้อมูลคำถาม
 */
async function saveQuestion() {
    try {
        // ตรวจสอบการป้อนข้อมูล
        const questionText = ADMIN_DOM.questionText.value.trim();
        const questionCategory = ADMIN_DOM.questionCategory.value;
        const questionAnswer = getTinyMCEContent('questionAnswer');
        const questionId = ADMIN_DOM.questionId.value;
        
        if (!questionText) {
            showNotification('กรุณากรอกคำถาม', 'error');
            return;
        }
        
        if (!questionCategory) {
            showNotification('กรุณาเลือกหมวดหมู่', 'error');
            return;
        }
        
        if (!questionAnswer) {
            showNotification('กรุณากรอกคำตอบ', 'error');
            return;
        }
        
        // สร้างข้อมูลสำหรับการบันทึก
        const questionData = {
            question: questionText,
            group: questionCategory,
            answer: questionAnswer
        };
        
        // เพิ่ม ID ถ้ากำลังแก้ไข
        if (questionId) {
            questionData.id = parseInt(questionId);
        }
        
        // บันทึกข้อมูล
        const result = await saveQuestionData(questionData);
        
        if (result) {
            // ปิด Modal
            hideModal('questionModal');
            
            // แสดงข้อความสำเร็จ
            const actionText = questionId ? 'แก้ไข' : 'เพิ่ม';
            showNotification(`${actionText}คำถามสำเร็จ`, 'success');
            
            // รีโหลดข้อมูล
            await loadQuestionsData();
        } else {
            throw new Error('ไม่สามารถบันทึกข้อมูลได้');
        }
    } catch (error) {
        adminLogError('Error saving question:', error);
        showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message, 'error');
    }
}

/**
 * แสดงกล่องยืนยันการลบคำถาม
 * @param {number} id - ID ของคำถามที่ต้องการลบ
 */
function confirmDeleteQuestion(id) {
    const question = ADMIN_STATE.questions.find(q => q.id == id);
    if (!question) {
        showNotification('ไม่พบข้อมูลคำถาม', 'error');
        return;
    }
    
    showConfirmation(
        `คุณแน่ใจหรือไม่ที่จะลบคำถาม "${question.question}"?`,
        () => deleteQuestionById(id)
    );
}

/**
 * ลบคำถามตาม ID
 * @param {number} id - ID ของคำถามที่ต้องการลบ
 */
async function deleteQuestionById(id) {
    try {
        const result = await deleteQuestion(id);
        
        if (result) {
            showNotification('ลบคำถามสำเร็จ', 'success');
            await loadQuestionsData();
        } else {
            throw new Error('ไม่สามารถลบคำถามได้');
        }
    } catch (error) {
        adminLogError('Error deleting question:', error);
        showNotification('เกิดข้อผิดพลาดในการลบคำถาม: ' + error.message, 'error');
    }
}

/**
 * แก้ไขหมวดหมู่
 * @param {string} category - ชื่อหมวดหมู่ที่ต้องการแก้ไข
 */
function editCategory(category) {
    if (!category) return;
    
    // ตั้งค่าโหมดการแก้ไข
    ADMIN_STATE.isEditing = true;
    ADMIN_STATE.editCategoryId = category;
    
    // อัปเดตชื่อฟอร์ม
    ADMIN_DOM.categoryFormTitle.textContent = 'แก้ไขหมวดหมู่';
    
    // ตั้งค่าข้อมูลฟอร์ม
    ADMIN_DOM.categoryName.value = category;
    
    // ตั้งค่าไอคอน
    const icon = CONFIG.groupIcons[category] || CONFIG.defaultGroupIcon;
    ADMIN_DOM.categoryIcon.value = icon;
    ADMIN_DOM.selectedIcon.innerHTML = `<i class="${icon}"></i>`;
    
    // ไฮไลท์ไอคอนที่เลือก
    ADMIN_DOM.iconItems.forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.icon === icon) {
            item.classList.add('selected');
        }
    });
}

/**
 * บันทึกหมวดหมู่
 * @param {Event} event - เหตุการณ์การส่งฟอร์ม
 */
async function saveCategory(event) {
    event.preventDefault();
    
    try {
        const newCategoryName = ADMIN_DOM.categoryName.value.trim();
        const iconValue = ADMIN_DOM.categoryIcon.value.trim();
        
        if (!newCategoryName) {
            showNotification('กรุณากรอกชื่อหมวดหมู่', 'error');
            return;
        }
        
        // ตรวจสอบหมวดหมู่ซ้ำ (กรณีเพิ่มใหม่)
        if (!ADMIN_STATE.isEditing && ADMIN_STATE.categories.includes(newCategoryName)) {
            showNotification('หมวดหมู่นี้มีอยู่แล้ว', 'error');
            return;
        }
        
        // อัปเดตไอคอนในการตั้งค่า
        const oldConfigGroupIcons = { ...CONFIG.groupIcons };
        
        if (ADMIN_STATE.isEditing) {
            // ถ้ามีการเปลี่ยนชื่อหมวดหมู่
            if (newCategoryName !== ADMIN_STATE.editCategoryId) {
                // อัปเดตชื่อหมวดหมู่ในคำถามทั้งหมด
                for (const question of ADMIN_STATE.questions) {
                    if (question.group === ADMIN_STATE.editCategoryId) {
                        await updateQuestion(question.id, { 
                            ...question, 
                            group: newCategoryName 
                        });
                    }
                }
                
                // อัปเดตไอคอน
                delete oldConfigGroupIcons[ADMIN_STATE.editCategoryId];
            }
        }
        
        // บันทึกไอคอนสำหรับหมวดหมู่
        CONFIG.groupIcons = {
            ...oldConfigGroupIcons,
            [newCategoryName]: iconValue
        };
        
        // บันทึกการตั้งค่าลงใน localStorage
        const settings = loadAdminSettings() || {};
        settings.groupIcons = CONFIG.groupIcons;
        saveAdminSettings(settings);
        
        // รีเซ็ตฟอร์ม
        ADMIN_DOM.categoryForm.reset();
        ADMIN_DOM.selectedIcon.innerHTML = `<i class="${CONFIG.defaultGroupIcon}"></i>`;
        ADMIN_STATE.isEditing = false;
        ADMIN_STATE.editCategoryId = null;
        ADMIN_DOM.categoryFormTitle.textContent = 'เพิ่มหมวดหมู่ใหม่';
        
        // รีโหลดข้อมูล
        await loadQuestionsData();
        
        showNotification('บันทึกหมวดหมู่สำเร็จ', 'success');
    } catch (error) {
        adminLogError('Error saving category:', error);
        showNotification('เกิดข้อผิดพลาดในการบันทึกหมวดหมู่: ' + error.message, 'error');
    }
}

/**
 * ยกเลิกการแก้ไขหมวดหมู่
 */
function cancelCategoryEdit() {
    ADMIN_DOM.categoryForm.reset();
    ADMIN_DOM.selectedIcon.innerHTML = `<i class="${CONFIG.defaultGroupIcon}"></i>`;
    ADMIN_STATE.isEditing = false;
    ADMIN_STATE.editCategoryId = null;
    ADMIN_DOM.categoryFormTitle.textContent = 'เพิ่มหมวดหมู่ใหม่';
}

/**
 * แสดงกล่องยืนยันการลบหมวดหมู่
 * @param {string} category - ชื่อหมวดหมู่ที่ต้องการลบ
 */
function confirmDeleteCategory(category) {
    const count = countQuestionsPerCategory(ADMIN_STATE.questions)[category] || 0;
    
    let message = `คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "${category}"?`;
    
    if (count > 0) {
        message += ` มีคำถามในหมวดหมู่นี้ ${count} คำถาม ซึ่งจะถูกย้ายไปยังหมวดหมู่ "ไม่ระบุ"`;
    }
    
    showConfirmation(message, () => deleteCategory(category));
}

/**
 * ลบหมวดหมู่
 * @param {string} category - ชื่อหมวดหมู่ที่ต้องการลบ
 */
async function deleteCategory(category) {
    try {
        // อัปเดตคำถามทั้งหมดในหมวดหมู่นี้
        for (const question of ADMIN_STATE.questions) {
            if (question.group === category) {
                await updateQuestion(question.id, { 
                    ...question, 
                    group: 'ไม่ระบุ' 
                });
            }
        }
        
        // ลบไอคอนของหมวดหมู่
        const oldConfigGroupIcons = { ...CONFIG.groupIcons };
        delete oldConfigGroupIcons[category];
        CONFIG.groupIcons = oldConfigGroupIcons;
        
        // บันทึกการตั้งค่าลงใน localStorage
        const settings = loadAdminSettings() || {};
        settings.groupIcons = CONFIG.groupIcons;
        saveAdminSettings(settings);
        
        // รีโหลดข้อมูล
        await loadQuestionsData();
        
        showNotification('ลบหมวดหมู่สำเร็จ', 'success');
    } catch (error) {
        adminLogError('Error deleting category:', error);
        showNotification('เกิดข้อผิดพลาดในการลบหมวดหมู่: ' + error.message, 'error');
    }
}

/**
 * เลือกไอคอนสำหรับหมวดหมู่
 * @param {string} iconClass - คลาสของไอคอน
 */
function selectCategoryIcon(iconClass) {
    ADMIN_DOM.categoryIcon.value = iconClass;
    ADMIN_DOM.selectedIcon.innerHTML = `<i class="${iconClass}"></i>`;
    
    // ไฮไลท์ไอคอนที่เลือก
    ADMIN_DOM.iconItems.forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.icon === iconClass) {
            item.classList.add('selected');
        }
    });
}

/**
 * โหลดการตั้งค่าไปยังฟอร์ม
 */
function loadSettingsToForm() {
    const settings = loadAdminSettings() || {};
    const supabaseConfig = getSupabaseConfig();
    
    // ตั้งค่า Supabase
    if (ADMIN_DOM.supabaseUrl) {
        ADMIN_DOM.supabaseUrl.value = settings.supabaseUrl || supabaseConfig.url || '';
    }
    
    if (ADMIN_DOM.supabaseKey) {
        ADMIN_DOM.supabaseKey.value = settings.supabaseKey || supabaseConfig.key || '';
    }
    
    if (ADMIN_DOM.supabaseTable) {
        ADMIN_DOM.supabaseTable.value = settings.supabaseTable || supabaseConfig.table || '';
    }
    
    // ตั้งค่าทั่วไป
    if (ADMIN_DOM.appTitle) {
        ADMIN_DOM.appTitle.value = settings.appTitle || 'ระบบคำถามที่พบบ่อย - ระบบบริหารงานบุคคล';
    }
    
    if (ADMIN_DOM.appVersion) {
        ADMIN_DOM.appVersion.value = settings.appVersion || CONFIG.version;
    }
    
    if (ADMIN_DOM.cacheEnabled) {
        ADMIN_DOM.cacheEnabled.checked = settings.cacheEnabled !== undefined ? settings.cacheEnabled : CONFIG.cache.enabled;
    }
    
    if (ADMIN_DOM.cacheDuration) {
        ADMIN_DOM.cacheDuration.value = settings.cacheDuration !== undefined ? 
            settings.cacheDuration : 
            (CONFIG.cache.duration / 3600000); // แปลงจากมิลลิวินาทีเป็นชั่วโมง
    }
}

/**
 * บันทึกการตั้งค่าจากฟอร์ม
 */
async function saveSettings(event) {
    event.preventDefault();
    
    try {
        const settings = {
            supabaseUrl: ADMIN_DOM.supabaseUrl.value.trim(),
            supabaseKey: ADMIN_DOM.supabaseKey.value.trim(),
            supabaseTable: ADMIN_DOM.supabaseTable.value.trim(),
            appTitle: ADMIN_DOM.appTitle.value.trim(),
            appVersion: ADMIN_DOM.appVersion.value.trim(),
            cacheEnabled: ADMIN_DOM.cacheEnabled.checked,
            cacheDuration: parseInt(ADMIN_DOM.cacheDuration.value) || 24,
            groupIcons: CONFIG.groupIcons // เก็บไอคอนของหมวดหมู่
        };
        
        // บันทึกการตั้งค่า
        saveAdminSettings(settings);
        
        // อัปเดตการตั้งค่าปัจจุบัน
        CONFIG.supabase.url = settings.supabaseUrl;
        CONFIG.supabase.key = settings.supabaseKey;
        CONFIG.supabase.table = settings.supabaseTable;
        CONFIG.version = settings.appVersion;
        CONFIG.cache.enabled = settings.cacheEnabled;
        CONFIG.cache.duration = settings.cacheDuration * 3600000; // แปลงจากชั่วโมงเป็นมิลลิวินาที
        
        // ตรวจสอบการเชื่อมต่อกับ Supabase
        const isConnected = await testSupabaseConnection();
        updateApiStatusDisplay(isConnected);
        
        showNotification('บันทึกการตั้งค่าสำเร็จ', 'success');
        
        // ถ้าเชื่อมต่อ Supabase ได้ ให้โหลดข้อมูลใหม่
        if (isConnected) {
            await loadQuestionsData();
        }
    } catch (error) {
        adminLogError('Error saving settings:', error);
        showNotification('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า: ' + error.message, 'error');
    }
}

/**
 * รีเซ็ตการตั้งค่า
 */
function resetSettings() {
    showConfirmation(
        'คุณแน่ใจหรือไม่ที่จะรีเซ็ตการตั้งค่าทั้งหมด?',
        () => {
            // ลบการตั้งค่าจาก localStorage
            localStorage.removeItem('adminSettings');
            
            // โหลดการตั้งค่าเริ่มต้น
            loadSettingsToForm();
            
            showNotification('รีเซ็ตการตั้งค่าสำเร็จ', 'success');
        }
    );
}

/**
 * เปลี่ยนหน้า
 * @param {string} direction - ทิศทาง (prev/next)
 */
function changePage(direction) {
    let newPage = ADMIN_STATE.currentPage;
    
    if (direction === 'prev' && newPage > 1) {
        newPage -= 1;
    } else if (direction === 'next') {
        const totalPages = Math.ceil(ADMIN_STATE.filteredQuestions.length / ADMIN_STATE.questionsPerPage);
        if (newPage < totalPages) {
            newPage += 1;
        }
    }
    
    if (newPage !== ADMIN_STATE.currentPage) {
        ADMIN_STATE.currentPage = newPage;
        updateQuestionsTable();
    }
}

/**
 * ส่งออกข้อมูลคำถามเป็นไฟล์ JSON
 */
function exportQuestions() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    exportDataToJson(ADMIN_STATE.questions, `faq_data_${timestamp}.json`);
    showNotification('ส่งออกข้อมูลสำเร็จ', 'success');
}

/**
 * ค้นหาคำถาม
 */
function searchQuestions() {
    if (!ADMIN_DOM.questionSearchInput) return;
    
    const query = ADMIN_DOM.questionSearchInput.value.trim();
    ADMIN_STATE.searchQuery = query;
    ADMIN_STATE.currentPage = 1; // รีเซ็ตหน้าปัจจุบัน
    
    updateQuestionsTable();
}

/**
 * กรองตามหมวดหมู่
 */
function filterByCategory() {
    if (!ADMIN_DOM.categoryFilter) return;
    
    const category = ADMIN_DOM.categoryFilter.value;
    ADMIN_STATE.currentCategory = category;
    ADMIN_STATE.currentPage = 1; // รีเซ็ตหน้าปัจจุบัน
    
    updateQuestionsTable();
}

/**
 * รีเฟรชข้อมูลจาก API
 */
async function refreshData() {
    try {
        // ล้างแคช
        localStorage.removeItem(CONFIG.cache.storageKeys.faqData);
        localStorage.removeItem(CONFIG.cache.storageKeys.faqDataTime);
        
        // แสดงข้อความกำลังโหลด
        ADMIN_DOM.recentQuestions.innerHTML = '<div class="loading-spinner"></div>';
        
        // โหลดข้อมูลใหม่
        await loadQuestionsData();
        
        showNotification('รีเฟรชข้อมูลสำเร็จ', 'success');
    } catch (error) {
        adminLogError('Error refreshing data:', error);
        showNotification('เกิดข้อผิดพลาดในการรีเฟรชข้อมูล: ' + error.message, 'error');
    }
}
