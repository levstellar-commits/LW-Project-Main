/* ==========================================================================
   LEVYTHOS DYNAMIC COMPONENT LOADER (立维宇宙：工程级统一动态注入与状态总线)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 💡 1. 自动校准全站根路径（彻底堵死 GitHub Pages 二级项目目录 404 的致命硬伤）
    const pathName = window.location.pathname;
    let REPO_BASE = "/";
    
    // 如果当前处于 GitHub Pages 的特定仓库子目录下，全自动补全绝对前缀路径
    if (pathName.includes('/levythos/')) {
        REPO_BASE = "/levythos/";
    }

    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;

    // ⚡ 2. 动态组件结构注入
    fetch(REPO_BASE + 'header.html')
        .then(response => {
            if (!response.ok) throw new Error('控制台提示：骨架调取阻断。');
            return response.text();
        })
        .then(htmlSkeleton => {
            placeholder.innerHTML = htmlSkeleton;
            
            // 3. 自动修正骨架中的所有链接，确保无论在几级目录下点击都绝不404
            fixHeaderAbsolutePaths();
            
            // 4. 调取核心状态鉴权流，决定右上角怎么显示
            synchronizeUserTerminalStatus();
        })
        .catch(err => console.error("星门组件重构失败:", err));

    // 自动补全外壳链接路径的防御机制
    function fixHeaderAbsolutePaths() {
        const logoLink = document.getElementById('headerLogoLink');
        const logoImg = document.getElementById('headerLogoImg');
        if (logoLink) logoLink.href = REPO_BASE + "index.html";
        if (logoImg) logoImg.src = REPO_BASE + "assets/images/logo.png";

        const navLinks = document.querySelectorAll('#headerSiteNav a');
        navLinks.forEach(link => {
            const currentHref = link.getAttribute('href');
            if (currentHref && currentHref.startsWith('/')) {
                // 去掉开头的 '/'，补上动态感知的真实根路径
                link.href = REPO_BASE + currentHref.substring(1);
            }
        });
    }

    // 5. 【核心鉴权控制】未来切 Supabase 时，只需要把本函数内部读取 localStorage 换成真数据库读取即可！
    function synchronizeUserTerminalStatus() {
        const isUserLoggedIn = localStorage.getItem("lv_user_logged_in") === "true";
        const savedUserName = localStorage.getItem("lv_user_name") || "星河灯塔";
        const savedAvatar = localStorage.getItem("lv_user_avatar") || (REPO_BASE + "assets/images/archetype_narrative.jpg");

        const targetChamber = document.getElementById('headerActionsChamber');
        if (!targetChamber) return;

        if (isUserLoggedIn) {
            // 🟢 已接入（登录）状态：渲染下拉控制台
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
            
            // 🔒 移除内联 onclick（解决硬伤三），改用稳固的 addEventListener 绑定事件
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
                    console.log("[TERMINAL] SESSION TERMINATED.");
                    window.location.reload();
                });
            }

        } else {
            // ⚪ 访客（未登录）状态
            targetChamber.innerHTML = `
                <a href="#" id="terminalLoginTriggerBtn" class="nav-item-dual hide-on-mobile" style="text-decoration: none;"><strong>接入终端</strong><span>(获取敕令)</span></a>
            `;

            const loginTrigger = document.getElementById('terminalLoginTriggerBtn');
            if (loginTrigger) {
                loginTrigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof openLoginModal === 'function') openLoginModal();
                });
            }
        }
    }

    // 用户在登录弹窗里点击“建立锚点”成功时调用的全局公共确权接口
    window.simulateLoginSuccess = function(userName, avatarPath) {
        localStorage.setItem("lv_user_logged_in", "true");
        localStorage.setItem("lv_user_name", userName);
        localStorage.setItem("lv_user_avatar", avatarPath || "");
        
        // 自动重定位，绝不 404
        window.location.href = REPO_BASE + "philosophy/passport.html"; 
    };

    // 全局防呆监听：点击空白处自动收起下拉抽屉
    document.addEventListener('click', () => {
        const drawer = document.getElementById('userDropdownMenuDrawer');
        if(drawer) drawer.style.display = 'none';
    });
});
