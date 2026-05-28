// اسکریپت اصلی مدیریت پنل ادمین - ویرا انیمه ۲۰۲۶

const ADMIN_USER = "Amin1388";
const ADMIN_PASS = "Amin123454321";

document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
    setupAdminNavigation();
    setupEpisodeManager();
    
    document.getElementById("login-submit-btn").addEventListener("click", handleLogin);
    document.getElementById("logout-btn").addEventListener("click", handleLogout);
    document.getElementById("save-anime-btn").addEventListener("click", handleSaveAnime);
    document.getElementById("cancel-edit-btn").addEventListener("click", resetAdminForm);
});

// ۱. سیستم احراز هویت و مدیریت سشن ادمین
function checkLoginStatus() {
    if (sessionStorage.getItem("vira_admin_logged") === "true") {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-main-panel").style.display = "block";
        document.getElementById("logout-btn").style.display = "flex";
        renderAdminTable();
    }
}

function handleLogin() {
    const user = document.getElementById("login-username").value.trim();
    const pass = document.getElementById("login-password").value.trim();

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem("vira_admin_logged", "true");
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-main-panel").style.display = "block";
        document.getElementById("logout-btn").style.display = "flex";
        renderAdminTable();
    } else {
        alert("نام کاربری یا رمز عبور ادمین اشتباه است!");
    }
}

function handleLogout() {
    sessionStorage.removeItem("vira_admin_logged");
    window.location.reload();
}

// ۲. ناوبری و سوییچ بین منوهای پنل
function setupAdminNavigation() {
    const btnAdd = document.getElementById("menu-btn-add");
    const btnList = document.getElementById("menu-btn-list");
    const secForm = document.getElementById("admin-section-form");
    const secList = document.getElementById("admin-section-list");

    btnAdd.addEventListener("click", () => {
        btnAdd.classList.add("active");
        btnList.classList.remove("active");
        secForm.style.display = "block";
        secList.style.display = "none";
        resetAdminForm();
    });

    btnList.addEventListener("click", () => {
        btnList.classList.add("active");
        btnAdd.classList.remove("active");
        secForm.style.display = "none";
        secList.style.display = "block";
        renderAdminTable();
    });
}

// ۳. ایجاد و مدیریت فیلدهای پویای قسمت‌ها (پخش و دانلود غیراجباری)
function setupEpisodeManager() {
    const container = document.getElementById("admin-episodes-list");
    const addBtn = document.getElementById("add-ep-row-btn");

    addBtn.addEventListener("click", () => {
        const rowCount = container.children.length + 1;
        createEpisodeRow(rowCount, "", "");
    });
}

function createEpisodeRow(num, streamUrl = "", downloadUrl = "") {
    const container = document.getElementById("admin-episodes-list");
    const row = document.createElement("div");
    row.className = "admin-ep-row";
    row.innerHTML = `
        <input type="text" class="ep-num-input" value="${num}" style="text-align:center; font-weight:bold;" placeholder="قسمت">
        <input type="text" class="ep-stream-input" value="${streamUrl}" placeholder="لینک پخش آنلاین ویدیو (MP4)">
        <input type="text" class="ep-download-input" value="${downloadUrl}" placeholder="لینک دانلود مستقیم (اختیاری)">
        <button type="button" class="btn-danger" style="padding:10px;" onclick="this.parentElement.remove()"><i class='bx bx-trash'></i></button>
    `;
    container.appendChild(row);
}

// ۴. ذخیره یا ویرایش اطلاعات در دیتابیس لوکال
async function handleSaveAnime() {
    const id = document.getElementById("edit-anime-id").value;
    
    // جمع‌آوری اطلاعات فرم
    const title = document.getElementById("anime-title").value.trim();
    const faTitle = document.getElementById("anime-fa-title").value.trim();
    const type = document.getElementById("anime-type").value;
    const status = document.getElementById("anime-status").value;
    const year = document.getElementById("anime-year").value.trim();
    const rating = document.getElementById("anime-rating").value.trim();
    const audio = document.getElementById("anime-audio").value;
    const day = document.getElementById("anime-day").value;
    const poster = document.getElementById("anime-poster").value.trim();
    const banner = document.getElementById("anime-banner").value.trim();
    const genres = document.getElementById("anime-genres").value.split(",").map(g => g.trim());
    const description = document.getElementById("anime-description").value.trim();

    if(!title || !faTitle || !poster || !banner) {
        alert("لطفاً فیلدهای اصلی و لینک تصاویر را وارد کنید.");
        return;
    }

    // استخراج لیست قسمت‌ها
    const epRows = document.querySelectorAll(".admin-ep-row");
    const episodes = [];
    epRows.forEach(row => {
        const number = row.querySelector(".ep-num-input").value.trim();
        const streamUrl = row.querySelector(".ep-stream-input").value.trim();
        const downloadUrl = row.querySelector(".ep-download-input").value.trim(); // بدون اجبار

        if(number && streamUrl) {
            episodes.push({ number, streamUrl, downloadUrl });
        }
    });

    const animeData = { title, faTitle, type, status, year, rating, audio, day, poster, banner, genres, description, episodes };

    if (id) {
        // حالت ویرایش انیمه موجود
        await updateAnime(id, animeData);
        alert("انیمه با موفقیت بروزرسانی شد.");
    } else {
        // حالت ثبت انیمه جدید
        await insertAnime(animeData);
        alert("انیمه جدید با موفقیت به دیتابیس اضافه شد.");
    }

    resetAdminForm();
    document.getElementById("menu-btn-list").click(); // سوییچ به جدول انیمه‌ها
}

// ۵. رندر جدول انیمه‌ها جهت ویرایش و حذف
async function renderAdminTable() {
    const tbody = document.getElementById("admin-table-body");
    if(!tbody) return;
    tbody.innerHTML = "";
    
    const animes = await getAllAnimes();
    
    animes.forEach(anime => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${anime.poster}" alt="poster"></td>
            <td><b>${anime.title}</b></td>
            <td>${anime.faTitle}</td>
            <td><span class="text-gold"><i class='bx bxs-star'></i></span> ${anime.rating}</td>
            <td>
                <div style="display:flex; gap:10px;">
                    <button class="btn-secondary" style="padding:6px 12px; font-size:13px;" onclick="editAnimeTrigger(${anime.id})"><i class='bx bx-edit-alt'></i> ویرایش</button>
                    <button class="btn-danger" style="padding:6px 12px; font-size:13px;" onclick="deleteAnimeTrigger(${anime.id})"><i class='bx bx-trash'></i> حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// تریگر دکمه ویرایش و پر کردن فیلدها
window.editAnimeTrigger = async function(id) {
    const anime = await getAnimeById(id);
    if(!anime) return;

    document.getElementById("menu-btn-add").click();
    document.getElementById("form-section-title").innerHTML = `<i class='bx bx-edit text-gold'></i> در حال ویرایش انیمه: ${anime.title}`;
    
    document.getElementById("edit-anime-id").value = anime.id;
    document.getElementById("anime-title").value = anime.title;
    document.getElementById("anime-fa-title").value = anime.faTitle;
    document.getElementById("anime-type").value = anime.type;
    document.getElementById("anime-status").value = anime.status;
    document.getElementById("anime-year").value = anime.year;
    document.getElementById("anime-rating").value = anime.rating;
    document.getElementById("anime-audio").value = anime.audio;
    document.getElementById("anime-day").value = anime.day;
    document.getElementById("anime-poster").value = anime.poster;
    document.getElementById("anime-banner").value = anime.banner;
    document.getElementById("anime-genres").value = anime.genres.join(", ");
    document.getElementById("anime-description").value = anime.description;

    const container = document.getElementById("admin-episodes-list");
    container.innerHTML = "";
    if(anime.episodes) {
        anime.episodes.forEach(ep => {
            createEpisodeRow(ep.number, ep.streamUrl, ep.downloadUrl);
        });
    }
    document.getElementById("cancel-edit-btn").style.display = "block";
};

// تریگر دکمه حذف
window.deleteAnimeTrigger = async function(id) {
    if(confirm("آیا از حذف این انیمه از دیتابیس مطمئن هستید؟")) {
        await deleteAnime(id);
        renderAdminTable();
    }
};

function resetAdminForm() {
    document.getElementById("edit-anime-id").value = "";
    document.getElementById("form-section-title").innerHTML = `<i class='bx bx-plus text-gold'></i> افزودن انیمه جدید به دیتابیس`;
    document.getElementById("anime-title").value = "";
    document.getElementById("anime-fa-title").value = "";
    document.getElementById("anime-year").value = "";
    document.getElementById("anime-rating").value = "";
    document.getElementById("anime-poster").value = "";
    document.getElementById("anime-banner").value = "";
    document.getElementById("anime-genres").value = "";
    document.getElementById("anime-description").value = "";
    document.getElementById("admin-episodes-list").innerHTML = "";
    document.getElementById("cancel-edit-btn").style.display = "none";
}