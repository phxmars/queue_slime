document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const userQueueStatus = document.getElementById('user-queue-status');
    const toggleModeBtn = document.getElementById('toggle-mode-btn');
    const userSection = document.getElementById('user-section');
    const adminSection = document.getElementById('admin-section');
    const queueList = document.getElementById('queue-list');
    const userAddonsList = document.getElementById('user-addons-list');
    const addonStockList = document.getElementById('addon-stock-list');

    const adminPasswordInput = document.getElementById('admin-password-input');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const passwordForm = document.getElementById('password-form');
    const adminContent = document.getElementById('admin-content');

    const BASE_PRICE = 20;
    const ADDON_PRICE = 5;
    const ADMIN_PASSWORD = '60168';

    let currentQueue = [];
    const LOCAL_STORAGE_KEY_QUEUE = 'dunkdungQueue';
    const LOCAL_STORAGE_KEY_STOCK = 'dunkdangAddonStock';

    const ALL_ADDONS = ['ผงมุก', 'โฟม', 'มาชเมลโล่', 'ดินเบา'];
    let addonStockStatus = {};

    // --- ฟังก์ชันสำหรับจัดการคิว ---
    const loadQueue = () => {
        const storedQueue = localStorage.getItem(LOCAL_STORAGE_KEY_QUEUE);
        if (storedQueue) {
            currentQueue = JSON.parse(storedQueue);
            renderQueue();
        }
    };
    const saveQueue = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY_QUEUE, JSON.stringify(currentQueue));
    };

    // --- ฟังก์ชันสำหรับจัดการสต็อกสินค้า ---
    const loadAddonStock = () => {
        const storedStock = localStorage.getItem(LOCAL_STORAGE_KEY_STOCK);
        if (storedStock) {
            addonStockStatus = JSON.parse(storedStock);
        } else {
            ALL_ADDONS.forEach(addon => {
                addonStockStatus[addon] = 'in-stock';
            });
            saveAddonStock();
        }
    };
    const saveAddonStock = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY_STOCK, JSON.stringify(addonStockStatus));
    };

    // --- ฟังก์ชันสำหรับแสดงผล ---
    const calculateTotalPrice = (addons) => {
        return BASE_PRICE + (addons.length * ADDON_PRICE);
    };

    const showCuteAlert = (message) => {
        alert('🌈 ' + message + ' 🎉');
    };

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

    const renderUserAddons = () => {
        userAddonsList.innerHTML = '';
        ALL_ADDONS.forEach(addon => {
            const isSoldOut = addonStockStatus[addon] === 'sold-out';
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" name="addons" value="${addon}" ${isSoldOut ? 'disabled' : ''}> ${addon} (+5฿)`;
            if (isSoldOut) {
                label.classList.add('sold-out-label');
            }
            userAddonsList.appendChild(label);
        });
    };

    const renderAddonStock = () => {
        addonStockList.innerHTML = '';
        ALL_ADDONS.forEach(addon => {
            const isSoldOut = addonStockStatus[addon] === 'sold-out';
            const addonDiv = document.createElement('div');
            addonDiv.classList.add('addon-item');
            if (isSoldOut) {
                addonDiv.classList.add('sold-out');
            }
            addonDiv.innerHTML = `
                <span>${addon}</span>
                <button class="stock-btn ${isSoldOut ? 'in-stock' : 'sold-out-btn'}" data-addon="${addon}">
                    ${isSoldOut ? 'เพิ่มของ' : 'ของหมด'}
                </button>
            `;
            addonStockList.appendChild(addonDiv);
        });
    };

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

    // --- จัดการ Event Listeners ---
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
        renderUserAddons();
    });

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

    addonStockList.addEventListener('click', (e) => {
        const addonName = e.target.dataset.addon;
        if (addonName) {
            if (addonStockStatus[addonName] === 'in-stock') {
                addonStockStatus[addonName] = 'sold-out';
                showCuteAlert(`${addonName} หมดแล้วค่ะ!`);
            } else {
                addonStockStatus[addonName] = 'in-stock';
                showCuteAlert(`มี ${addonName} มาเพิ่มแล้วค่ะ!`);
            }
            saveAddonStock();
            renderAddonStock();
            renderUserAddons();
        }
    });

    // --- ส่วนที่แก้ไขสำหรับระบบรหัสผ่านแบบใหม่ ---
    toggleModeBtn.addEventListener('click', () => {
        const isUserMode = !userSection.classList.contains('hidden');
        
        if (isUserMode) {
            userSection.classList.add('hidden');
            adminSection.classList.remove('hidden');
            passwordForm.classList.remove('hidden');
            adminContent.classList.add('hidden');
            toggleModeBtn.textContent = 'สลับเป็นโหมดผู้ใช้งาน';
        } else {
            userSection.classList.remove('hidden');
            adminSection.classList.add('hidden');
            toggleModeBtn.textContent = 'สลับเป็นโหมดผู้ดูแล';
            showCuteAlert('กลับสู่โหมดผู้ใช้งานแล้ว! ✨');
        }
        renderQueue();
    });

    adminLoginBtn.addEventListener('click', () => {
        const enteredPassword = adminPasswordInput.value;
        if (enteredPassword === ADMIN_PASSWORD) {
            passwordForm.classList.add('hidden');
            adminContent.classList.remove('hidden');
            showCuteAlert('ยินดีต้อนรับเข้าสู่โหมดผู้ดูแล! 🗝️');
            renderAddonStock();
        } else {
            showCuteAlert('รหัสผ่านไม่ถูกต้อง! 🚫');
            adminPasswordInput.value = '';
        }
    });

    // --- เริ่มต้นการทำงาน ---
    loadQueue();
    loadAddonStock();
    renderUserAddons();
});