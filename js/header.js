/* ==========================================================================
   LEVYTHOS DYNAMIC COMPONENT LOADER - FIXED VERSION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 💡 1. 自动校准全站根路径
    const pathName = window.location.pathname;
    let REPO_BASE = "/";
    if (pathName.includes('/levythos/')) {
        REPO_BASE = "/levythos/";
    }

    const placeholder = document.getElementById('header-placeholder');
    
    // 基础全局函数定义：提至最顶层，确保页面任何卡片或按钮调用 openLoginModal() 时绝不抛出 undefined
    window.openLoginModal = function() {
        const modal = document.getElementById('lv-login-modal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => { modal.classList.add('active'); }, 10);
        } else {
            console.error("【星门核心】未在当前页面找到 id 为 'lv-login-modal' 的弹窗容器。");
        }
    };

    window.closeLoginModal = function() {
        const modal = document.getElementById('lv-login-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        }
    };

    // 用户成功确权（登录）的核心路由状态保持
    window.simulateLoginSuccess = function(userName, avatarPath) {
        localStorage.setItem("lv_user_logged_in", "true");
        localStorage.setItem("lv_user_name", userName);
        localStorage.setItem("lv_user_avatar", avatarPath || "");
        
        console.log(`[TERMINAL AUTH] 成功确权。观测员代号: ${userName}`);
        window.location.href = REPO_BASE + "philosophy/passport.html"; 
    };

    // ⚡ 2. 执行异步骨架调取
    if (placeholder) {
        fetch(REPO_BASE + 'header.html')
            .then(response => {
                if (!response.ok) throw new Error('控制台提示：骨架调取阻断。');
                return response.text();
            })
            .then(htmlSkeleton => {
                placeholder.innerHTML = htmlSkeleton;
                
                fixHeaderAbsolutePaths();
                synchronizeUserTerminalStatus();
                // 核心修复点：外壳渲染完毕后，越过 placeholder 限制，面向全域重塑弹窗绑定
                bindGlobalLoginModalEvents();
            })
            .catch(err => console.error("星门组件重构失败:", err));
    } else {
        // 如果是在子页面中没有 header-placeholder 但有常驻弹窗，同样执行全域绑定
        bindGlobalLoginModalEvents();
    }

    function fixHeaderAbsolutePaths() {
        const logoLink = document.getElementById('headerLogoLink');
        const logoImg = document.getElementById('headerLogoImg');
        if (logoLink) logoLink.href = REPO_BASE + "index.html";
        if (logoImg) logoImg.src = REPO_BASE + "assets/images/logo.png";

        const navLinks = document.querySelectorAll('#headerSiteNav a');
        navLinks.forEach(link => {
            const currentHref = link.getAttribute('href');
            if (currentHref && currentHref.startsWith('/')) {
                link.href = REPO_BASE + currentHref.substring(1);
            }
        });
    }

    function synchronizeUserTerminalStatus() {
        const isUserLoggedIn = localStorage.getItem("lv_user_logged_in") === "true";
        const savedUserName = localStorage.getItem("lv_user_name") || "星河灯塔";
        const savedAvatar = localStorage.getItem("lv_user_avatar") || (REPO_BASE + "assets/images/archetype_narrative.jpg");

        const targetChamber = document.getElementById('headerActionsChamber');
        if (!targetChamber) return;

        if (isUserLoggedIn) {
            targetChamber.innerHTML = `
                <div class="user-terminal-dropdown" id="userTerminalDropdown" style="position: relative; cursor: pointer;">
                    <a href="#" class="nav-item-dual" style="border: 1px solid var(--accent); background: rgba(0,229,255,0.05); padding: 4px 12px; border-radius: 4px; display: flex; flex-direction: row; align-items: center; gap: 8px; text-decoration: none;">
                        <img src="${savedAvatar}" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--accent-gold);" onerror="this.src='${REPO_BASE}assets/images/logo.png'" />
                        <strong style="color: #ffffff;">观测员：${savedUserName} ▽</strong>
                    </a>
                    
                    <div id="userDropdownMenuDrawer" style="display: none; position: absolute; top: 50px; right: 0; width: 180px; background: #040914; border: 1px solid var(--accent-gold); border-radius: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); padding: 10px 0; z-index: 15000;">
                        <a href="${REPO_BASE}philosophy/passport.html" style="display: block; padding: 10px 20px; color: #fff; font-size: 13.5px; font-family: 'Noto Serif SC', serif; text-decoration: none;">🗺️ 我的通行证</a>
                        <a href="#" onclick="alert('确权收藏库正在盘点中...')" style="display: block; padding: 10px 20px; color: #fff; font-size: 13.5px; font-family: 'Noto Serif SC', serif; text-decoration: none;">📜 我的确权收藏</a>
                        <a href="#" id="terminalLogoutBtn" style="display: block; padding: 10px 20px; color: var(--accent-gold); font-size: 13.5px; font-weight: bold; font-family: 'Noto Serif SC', serif; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 5px; text-decoration: none;">⏳ 退出接入</a>
                    </div>
                </div>
            `;
            
            const dropdownTrigger = document.getElementById('userTerminalDropdown');
            if (dropdownTrigger) {
                dropdownTrigger.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const drawer = document.getElementById('userDropdownMenuDrawer');
                    if (drawer) drawer.style.display = (drawer.style.display === 'block') ? 'none' : 'block';
                });
            }

            const logoutBtn = document.getElementById('terminalLogoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    localStorage.removeItem("lv_user_logged_in");
                    localStorage.removeItem("lv_user_name");
                    window.location.reload();
                });
            }

        } else {
            targetChamber.innerHTML = `
                <a href="#" id="terminalLoginTriggerBtn" class="nav-item-dual" style="text-decoration: none;"><strong>接入终端</strong><span>(获取敕令)</span></a>
            `;

            const loginTrigger = document.getElementById('terminalLoginTriggerBtn');
            if (loginTrigger) {
                loginTrigger.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    window.openLoginModal();
                });
            }
        }
    }

    // 🛠️ 核心修复函数：面向全域精确解耦并绑定建立锚点事件
    function bindGlobalLoginModalEvents() {
        const modalContainer = document.getElementById('lv-login-modal');
        if (!modalContainer) return;

        // 精准给代号输入框打上新 ID 标记，防止抓取空值
        const civInput = modalContainer.querySelector('input[placeholder*="文明代号"]');
        if (civInput) {
            civInput.id = "terminalCivCodeInput";
        }

        // 强行纠正“建立锚点”按钮的指向
        const submitBtn = document.getElementById('indexRealitySubmitBtn') || modalContainer.querySelector('.lv-btn-primary');
        if (submitBtn) {
            submitBtn.removeAttribute('onclick'); // 清理行内硬编码残留
            
            // 重新绑定清洁、可靠的点击流
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const inputEl = document.getElementById('terminalCivCodeInput');
                const finalName = (inputEl && inputEl.value.trim()) ? inputEl.value.trim() : "未名观测员";
                
                // 激活确权闭环
                window.simulateLoginSuccess(finalName, REPO_BASE + "assets/images/archetype_narrative.jpg");
            });
        }
    }

    // 全局防死锁监听
    document.addEventListener('click', () => {
        const drawer = document.getElementById('userDropdownMenuDrawer');
        if(drawer) drawer.style.display = 'none';
    });
});
