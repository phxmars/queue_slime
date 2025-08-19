document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const userQueueStatus = document.getElementById('user-queue-status');
    const toggleModeBtn = document.getElementById('toggle-mode-btn');
    const userSection = document.getElementById('user-section');
    const adminSection = document.getElementById('admin-section');
    const queueList = document.getElementById('queue-list');

    const BASE_PRICE = 20;
    const ADDON_PRICE = 5;
    const ADMIN_PASSWORD = '60168'; // แก้ไขรหัสผ่านตามที่คุณต้องการ

    let currentQueue = [];
    const LOCAL_STORAGE_KEY = 'dunkdungQueue';

    // โหลดคิวจาก Local Storage
    const loadQueue = () => {
        const storedQueue = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedQueue) {
            currentQueue = JSON.parse(storedQueue);
            renderQueue();
        }
    };

    // บันทึกคิวลง Local Storage
    const saveQueue = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentQueue));
    };

    // คำนวณราคารวม
    const calculateTotalPrice = (addons) => {
        return BASE_PRICE + (addons.length * ADDON_PRICE);
    };

    // แสดงข้อความแจ้งเตือน (Alert) แบบน่ารัก
    const showCuteAlert = (message) => {
        alert('🌈 ' + message + ' 🎉');
    };

    // แสดงสถานะคิวของผู้ใช้
    const renderUserStatus = () => {
        if (currentQueue.length > 0) {
            const firstQueue = currentQueue[0];
            userQueueStatus.innerHTML = `
                <p><strong>ตอนนี้เป็นคิวของ:</strong> ${firstQueue.name} (คิวที่ 1)</p>
                <p>มีจำนวนคิวรออยู่: ${currentQueue.length - 1} คิว</p>
                <p>กรุณารอการเรียกคิวจากผู้ดูแลนะคะ!</p>
            `;
        } else {
            userQueueStatus.innerHTML = `<p>ตอนนี้ยังไม่มีคิวเลยค่ะ! มาจองเป็นคนแรกกันเถอะ~</p>`;
        }
    };

    // แสดงรายการคิวทั้งหมดสำหรับผู้ดูแล
    const renderQueue = () => {
        queueList.innerHTML = '';
        if (currentQueue.length === 0) {
            queueList.innerHTML = `<p style="text-align: center;">ไม่มีคิวในระบบเลยค่ะ 💤</p>`;
            renderUserStatus();
            return;
        }

        currentQueue.forEach((queueItem, index) => {
            const totalPrice = calculateTotalPrice(queueItem.addons);
            const queueDiv = document.createElement('div');
            queueDiv.classList.add('queue-item');
            if (index === 0) {
                queueDiv.classList.add('current');
            }

            queueDiv.innerHTML = `
                <div>
                    <strong>${index + 1}. ${queueItem.name}</strong><br>
                    <span><strong>เบอร์:</strong> ${queueItem.phone}</span><br>
                    <span><strong>ของตกแต่ง:</strong> ${queueItem.addons.length > 0 ? queueItem.addons.join(', ') : 'ไม่มี'}</span><br>
                    <span><strong>ราคารวม:</strong> ${totalPrice}฿</span>
                </div>
                <div class="admin-actions">
                    <button class="call-btn" data-index="${index}">เรียกคิว</button>
                    <button class="move-btn" data-index="${index}">ย้ายไปท้ายสุด</button>
                    <button class="cancel-btn" data-index="${index}">ยกเลิก</button>
                </div>
            `;
            queueList.appendChild(queueDiv);
        });
        renderUserStatus();
    };

    // จัดการการส่งฟอร์มการจอง
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const selectedAddons = Array.from(document.querySelectorAll('input[name="addons"]:checked')).map(cb => cb.value);

        if (!username || !phone) {
            showCuteAlert('โปรดกรอกชื่อเล่นและเบอร์โทรศัพท์ให้ครบถ้วนก่อนนะคะ! 😥');
            return;
        }

        const newQueueItem = {
            name: username,
            phone: phone,
            addons: selectedAddons,
            timestamp: new Date().toISOString()
        };

        currentQueue.push(newQueueItem);
        saveQueue();
        renderQueue();
        showCuteAlert(`คุณ ${username} จองคิวเรียบร้อยแล้ว! คิวของคุณคือคิวที่ ${currentQueue.length} ค่ะ! ✨`);
        bookingForm.reset();
    });

    // จัดการการคลิกปุ่มสำหรับผู้ดูแล
    queueList.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        
        if (e.target.classList.contains('call-btn')) {
            const calledQueue = currentQueue[index];
            showCuteAlert(`🎉 เรียกคิวคุณ ${calledQueue.name} (คิวที่ ${index + 1}) แล้วค่ะ!`);
            currentQueue.splice(index, 1);
        } else if (e.target.classList.contains('move-btn')) {
            if (index !== currentQueue.length - 1) {
                const movedQueue = currentQueue.splice(index, 1)[0];
                currentQueue.push(movedQueue);
                showCuteAlert(`คิวของคุณ ${movedQueue.name} ถูกย้ายไปท้ายสุดแล้วค่ะ!`);
            } else {
                showCuteAlert('คิวนี้อยู่ท้ายสุดอยู่แล้วค่ะ 😅');
            }
        } else if (e.target.classList.contains('cancel-btn')) {
            const cancelledQueue = currentQueue.splice(index, 1)[0];
            showCuteAlert(`คิวของคุณ ${cancelledQueue.name} ถูกยกเลิกแล้วค่ะ! 😢`);
        }

        saveQueue();
        renderQueue();
    });

    // สลับโหมดผู้ใช้งาน/ผู้ดูแล พร้อมระบบรหัสผ่าน
    toggleModeBtn.addEventListener('click', () => {
        const isUserMode = !userSection.classList.contains('hidden');
        
        if (isUserMode) {
            const enteredPassword = prompt('ใส่รหัสผ่านผู้ดูแลระบบ:');
            
            if (enteredPassword === ADMIN_PASSWORD) {
                userSection.classList.add('hidden');
                adminSection.classList.remove('hidden');
                toggleModeBtn.textContent = 'สลับเป็นโหมดผู้ใช้งาน';
                showCuteAlert('ยินดีต้อนรับเข้าสู่โหมดผู้ดูแล! 🗝️');
            } else {
                showCuteAlert('รหัสผ่านไม่ถูกต้อง! 🚫');
            }
        } else {
            userSection.classList.remove('hidden');
            adminSection.classList.add('hidden');
            toggleModeBtn.textContent = 'สลับเป็นโหมดผู้ดูแล';
            showCuteAlert('กลับสู่โหมดผู้ใช้งานแล้ว! ✨');
        }
        renderQueue();
    });

    // โหลดคิวเมื่อหน้าเว็บเปิดครั้งแรก
    loadQueue();
});