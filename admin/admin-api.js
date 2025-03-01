/**
 * ไฟล์จัดการการเชื่อมต่อกับ API สำหรับหน้าจัดการข้อมูล
 */

/**
 * รับข้อมูลการตั้งค่า Supabase
 * @returns {Object} - การตั้งค่า Supabase
 */
function getSupabaseConfig() {
    // โหลดการตั้งค่าจาก localStorage ก่อน
    const adminSettings = loadAdminSettings();
    
    if (adminSettings && 
        adminSettings.supabaseUrl && 
        adminSettings.supabaseKey && 
        adminSettings.supabaseTable) {
        return {
            url: adminSettings.supabaseUrl,
            key: adminSettings.supabaseKey,
            table: adminSettings.supabaseTable
        };
    }
    
    // ใช้การตั้งค่าเริ่มต้นจาก config.js
    return {
        url: CONFIG.supabase.url,
        key: CONFIG.supabase.key,
        table: CONFIG.supabase.table
    };
}

/**
 * ทดสอบการเชื่อมต่อกับ Supabase
 * @returns {Promise<boolean>} - สถานะการเชื่อมต่อ
 */
async function testSupabaseConnection() {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?limit=1`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`
            }
        });
        
        return response.ok;
    } catch (error) {
        adminLogError('Error testing Supabase connection:', error);
        return false;
    }
}

/**
 * ดึงข้อมูลคำถามทั้งหมดจาก Supabase
 * @returns {Promise<Array>} - รายการคำถาม
 */
async function fetchAllQuestions() {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?select=*&order=id.desc`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`,
                'Range': '0-999'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        adminLogInfo('Questions fetched:', data.length, 'records');
        return data;
    } catch (error) {
        adminLogError('Error fetching all questions:', error);
        return [];
    }
}

/**
 * ดึงข้อมูลคำถามโดย ID
 * @param {number} id - ID ของคำถาม
 * @returns {Promise<Object>} - ข้อมูลคำถาม
 */
async function fetchQuestionById(id) {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?id=eq.${id}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        adminLogError(`Error fetching question ID ${id}:`, error);
        return null;
    }
}

/**
 * เพิ่มคำถามใหม่
 * @param {Object} questionData - ข้อมูลคำถามที่ต้องการเพิ่ม
 * @returns {Promise<Object>} - ข้อมูลคำถามที่เพิ่มแล้ว
 */
async function createQuestion(questionData) {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}`;
        
        // เพิ่มเวลาปัจจุบัน
        const data = {
            ...questionData,
            created_at: new Date().toISOString()
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        adminLogInfo('Question created:', responseData);
        return responseData[0];
    } catch (error) {
        adminLogError('Error creating question:', error);
        throw error;
    }
}

/**
 * อัปเดตคำถาม
 * @param {number} id - ID ของคำถามที่ต้องการอัปเดต
 * @param {Object} questionData - ข้อมูลคำถามที่อัปเดต
 * @returns {Promise<Object>} - ข้อมูลคำถามที่อัปเดตแล้ว
 */
async function updateQuestion(id, questionData) {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?id=eq.${id}`;
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(questionData)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        adminLogInfo(`Question ID ${id} updated:`, responseData);
        return responseData[0];
    } catch (error) {
        adminLogError(`Error updating question ID ${id}:`, error);
        throw error;
    }
}

/**
 * ลบคำถาม
 * @param {number} id - ID ของคำถามที่ต้องการลบ
 * @returns {Promise<boolean>} - สถานะการลบ
 */
async function deleteQuestion(id) {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?id=eq.${id}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`
            }
        });
        
        if (!response.ok) {
            throw
 /**
 * ไฟล์จัดการการเชื่อมต่อกับ API สำหรับหน้าจัดการข้อมูล
 */

/**
 * รับข้อมูลการตั้งค่า Supabase
 * @returns {Object} - การตั้งค่า Supabase
 */
function getSupabaseConfig() {
    // โหลดการตั้งค่าจาก localStorage ก่อน
    const adminSettings = loadAdminSettings();
    
    if (adminSettings && 
        adminSettings.supabaseUrl && 
        adminSettings.supabaseKey && 
        adminSettings.supabaseTable) {
        return {
            url: adminSettings.supabaseUrl,
            key: adminSettings.supabaseKey,
            table: adminSettings.supabaseTable
        };
    }
    
    // ใช้การตั้งค่าเริ่มต้นจาก config.js
    return {
        url: CONFIG.supabase.url,
        key: CONFIG.supabase.key,
        table: CONFIG.supabase.table
    };
}

/**
 * ทดสอบการเชื่อมต่อกับ Supabase
 * @returns {Promise<boolean>} - สถานะการเชื่อมต่อ
 */
async function testSupabaseConnection() {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?limit=1`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`
            }
        });
        
        return response.ok;
    } catch (error) {
        adminLogError('Error testing Supabase connection:', error);
        return false;
    }
}

/**
 * ดึงข้อมูลคำถามทั้งหมดจาก Supabase
 * @returns {Promise<Array>} - รายการคำถาม
 */
async function fetchAllQuestions() {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?select=*&order=id.desc`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`,
                'Range': '0-999'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        adminLogInfo('Questions fetched:', data.length, 'records');
        return data;
    } catch (error) {
        adminLogError('Error fetching all questions:', error);
        return [];
    }
}

/**
 * ดึงข้อมูลคำถามโดย ID
 * @param {number} id - ID ของคำถาม
 * @returns {Promise<Object>} - ข้อมูลคำถาม
 */
async function fetchQuestionById(id) {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?id=eq.${id}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        adminLogError(`Error fetching question ID ${id}:`, error);
        return null;
    }
}

/**
 * เพิ่มคำถามใหม่
 * @param {Object} questionData - ข้อมูลคำถามที่ต้องการเพิ่ม
 * @returns {Promise<Object>} - ข้อมูลคำถามที่เพิ่มแล้ว
 */
async function createQuestion(questionData) {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}`;
        
        // เพิ่มเวลาปัจจุบัน
        const data = {
            ...questionData,
            created_at: new Date().toISOString()
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        adminLogInfo('Question created:', responseData);
        return responseData[0];
    } catch (error) {
        adminLogError('Error creating question:', error);
        throw error;
    }
}

/**
 * อัปเดตคำถาม
 * @param {number} id - ID ของคำถามที่ต้องการอัปเดต
 * @param {Object} questionData - ข้อมูลคำถามที่อัปเดต
 * @returns {Promise<Object>} - ข้อมูลคำถามที่อัปเดตแล้ว
 */
async function updateQuestion(id, questionData) {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?id=eq.${id}`;
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(questionData)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        adminLogInfo(`Question ID ${id} updated:`, responseData);
        return responseData[0];
    } catch (error) {
        adminLogError(`Error updating question ID ${id}:`, error);
        throw error;
    }
}

/**
 * ลบคำถาม
 * @param {number} id - ID ของคำถามที่ต้องการลบ
 * @returns {Promise<boolean>} - สถานะการลบ
 */
async function deleteQuestion(id) {
    try {
        const config = getSupabaseConfig();
        const url = `${config.url}/rest/v1/${config.table}?id=eq.${id}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'apikey': config.key,
                'Authorization': `Bearer ${config.key}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        adminLogInfo(`Question ID ${id} deleted successfully`);
        return true;
    } catch (error) {
        adminLogError(`Error deleting question ID ${id}:`, error);
        throw error;
    }
}

/**
 * ดึงข้อมูลหมวดหมู่ที่ไม่ซ้ำกันจากข้อมูลคำถาม
 * @param {Array} questions - ข้อมูลคำถามทั้งหมด
 * @returns {Array} - รายชื่อหมวดหมู่
 */
function extractCategories(questions) {
    const categoriesSet = new Set();
    
    questions.forEach(question => {
        if (question.group) {
            categoriesSet.add(question.group);
        }
    });
    
    return Array.from(categoriesSet).sort();
}

/**
 * นับจำนวนคำถามในแต่ละหมวดหมู่
 * @param {Array} questions - ข้อมูลคำถามทั้งหมด
 * @returns {Object} - จำนวนคำถามในแต่ละหมวดหมู่
 */
function countQuestionsPerCategory(questions) {
    const categoryCount = {};
    
    questions.forEach(question => {
        if (question.group) {
            if (!categoryCount[question.group]) {
                categoryCount[question.group] = 0;
            }
            categoryCount[question.group]++;
        }
    });
    
    return categoryCount;
}

/**
 * ดึงข้อมูลคำถามล่าสุด
 * @param {Array} questions - ข้อมูลคำถามทั้งหมด
 * @param {number} limit - จำนวนคำถามที่ต้องการ
 * @returns {Array} - รายการคำถามล่าสุด
 */
function getRecentQuestions(questions, limit = 5) {
    // เรียงตามวันที่สร้าง (จากใหม่ไปเก่า)
    const sorted = [...questions].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
    });
    
    // ส่งคืนจำนวนที่ต้องการ
    return sorted.slice(0, limit);
}

/**
 * รับข้อมูลโดยใช้ข้อมูลตัวอย่างเมื่อไม่สามารถเชื่อมต่อกับ API ได้
 * @returns {Promise<Array>} - ข้อมูลคำถาม
 */
async function getQuestionsWithFallback() {
    try {
        // ตรวจสอบการเชื่อมต่อ
        const isConnected = await testSupabaseConnection();
        
        if (isConnected) {
            // ดึงข้อมูลจาก API
            const data = await fetchAllQuestions();
            
            if (data.length > 0) {
                return data;
            }
        }
        
        // ใช้ข้อมูลตัวอย่างถ้าไม่สามารถเชื่อมต่อหรือไม่มีข้อมูล
        adminLogInfo('Using demo data');
        return DEMO_DATA;
    } catch (error) {
        adminLogError('Error getting questions with fallback:', error);
        return DEMO_DATA;
    }
}

/**
 * บันทึกข้อมูลคำถามใหม่หรืออัปเดตคำถามที่มีอยู่
 * @param {Object} formData - ข้อมูลคำถามจากฟอร์ม
 * @returns {Promise<Object>} - ข้อมูลคำถามที่บันทึกแล้ว
 */
async function saveQuestionData(formData) {
    try {
        if (formData.id) {
            // อัปเดตคำถามที่มีอยู่
            return await updateQuestion(formData.id, formData);
        } else {
            // เพิ่มคำถามใหม่
            return await createQuestion(formData);
        }
    } catch (error) {
        adminLogError('Error saving question data:', error);
        throw error;
    }
}
