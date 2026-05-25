/* ==========================================================================
   LEVYTHOS HEADER SYSTEM - STABLE VERSION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // 自动识别根路径
    // =========================
    const pathName = window.location.pathname;

    let REPO_BASE = "/";

    if (pathName.includes('/levythos/')) {
        REPO_BASE = "/levythos/";
    }

    // =========================
    // 全局登录弹窗控制
    // =========================
    window.openLoginModal = function () {

        const modal = document.getElementById('lv-login-modal');

        if (modal) {

            modal.style.display = 'flex';

            setTimeout(() => {
                modal.classList.add('active');
            }, 10);

        } else {

            console.error("未找到 #lv-login-modal");

        }
    };

    window.closeLoginModal = function () {

        const modal = document.getElementById('lv-login-modal');

        if (modal) {

            modal.classList.remove('active');

            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);

        }
    };

    // =========================
    // 登录成功后的统一接口
    // =========================
    window.simulateLoginSuccess = function (userName, avatarPath) {

        localStorage.setItem("lv_user_logged_in", "true");

        localStorage.setItem("lv_user_name", userName || "星河灯塔");

        localStorage.setItem(
            "lv_user_avatar",
            avatarPath || (REPO_BASE + "assets/images/archetype_narrative.jpg")
        );

        console.log("[TERMINAL AUTH] 登录成功:", userName);

        // 关闭弹窗
        if (typeof window.closeLoginModal === 'function') {
            window.closeLoginModal();
        }

        // 跳转
        window.location.href = REPO_BASE + "philosophy/passport.html";
    };

    // =========================
    // 动态加载 Header
    // =========================
    const placeholder = document.getElementById('header-placeholder');

    if (placeholder) {

        fetch(REPO_BASE + 'header.html')

            .then(response => {

                if (!response.ok) {
                    throw new Error('header.html 加载失败');
                }

                return response.text();
            })

            .then(html => {

                placeholder.innerHTML = html;

                fixHeaderPaths();

                synchronizeUserStatus();

                bindHeaderLoginButton();

            })

            .catch(error => {

                console.error("HEADER 加载失败:", error);

            });
    }

    // =========================
    // 修复 Header 路径
    // =========================
    function fixHeaderPaths() {

        const logoLink = document.getElementById('headerLogoLink');

        const logoImg = document.getElementById('headerLogoImg');

        if (logoLink) {
            logoLink.href = REPO_BASE + "index.html";
        }

        if (logoImg) {
            logoImg.src = REPO_BASE + "assets/images/logo.png";
        }

        const navLinks = document.querySelectorAll('#headerSiteNav a');

        navLinks.forEach(link => {

            const href = link.getAttribute('href');

            if (href && href.startsWith('/')) {

                link.href = REPO_BASE + href.substring(1);

            }
        });
    }

    // =========================
    // 同步登录状态
    // =========================
    function synchronizeUserStatus() {

        const isLoggedIn =
            localStorage.getItem("lv_user_logged_in") === "true";

        const savedName =
            localStorage.getItem("lv_user_name") || "星河灯塔";

        const savedAvatar =
            localStorage.getItem("lv_user_avatar") ||
            (REPO_BASE + "assets/images/archetype_narrative.jpg");

        const chamber =
            document.getElementById('headerActionsChamber');

        if (!chamber) return;

        // =====================
        // 已登录
        // =====================
        if (isLoggedIn) {

            chamber.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;">

                    <img
                        src="${savedAvatar}"
                        style="
                            width:28px;
                            height:28px;
                            border-radius:50%;
                            border:1px solid #e8b923;
                        "
                    />

                    <a
                        href="${REPO_BASE}philosophy/passport.html"
                        class="nav-item-dual"
                        style="text-decoration:none;"
                    >
                        <strong>${savedName}</strong>
                    </a>

                    <a
                        href="#"
                        id="terminalLogoutBtn"
                        class="nav-item-dual"
                        style="text-decoration:none;"
                    >
                        退出
                    </a>

                </div>
            `;

            const logoutBtn =
                document.getElementById('terminalLogoutBtn');

            if (logoutBtn) {

                logoutBtn.addEventListener('click', function (e) {

                    e.preventDefault();

                    localStorage.removeItem("lv_user_logged_in");

                    localStorage.removeItem("lv_user_name");

                    localStorage.removeItem("lv_user_avatar");

                    window.location.reload();

                });
            }

        }

        // =====================
        // 未登录
        // =====================
        else {

            chamber.innerHTML = `
                <a
                    href="#"
                    id="terminalLoginTriggerBtn"
                    class="nav-item-dual"
                    style="text-decoration:none;"
                >
                    <strong>接入终端</strong>
                    <span>(获取敕令)</span>
                </a>
            `;
        }
    }

    // =========================
    // 绑定 Header 登录按钮
    // =========================
    function bindHeaderLoginButton() {

        const loginBtn =
            document.getElementById('terminalLoginTriggerBtn');

        if (loginBtn) {

            loginBtn.addEventListener('click', function (e) {

                e.preventDefault();

                window.openLoginModal();

            });
        }
    }

});
