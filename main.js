document.addEventListener("DOMContentLoaded", () => {
    renderLatestAnime();
    renderSchedule("امروز");
    setupSearch();
    setupScheduleTabs();
    setupMobileMenu();
    setupHeroBookmark();
});

// رندر آخرین انیمه‌ها با تصویر بهینه و بارگذاری تنبل
function renderLatestAnime() {
    const gridContainer = document.getElementById("latest-anime-grid");
    if (!gridContainer) return;
    gridContainer.innerHTML = "";
    
    animeDatabase.forEach(anime => {
        const card = document.createElement("div");
        card.className = "anime-card";
        card.onclick = () => window.location.href = `anime.html?id=${anime.id}`;
        
        let genresHtml = "";
        anime.genres.forEach(g => genresHtml += `<span>${g}</span>`);
        
        card.innerHTML = `
            <div class="card-thumb">
                <img src="${anime.poster}" alt="${anime.title}" loading="lazy">
                <span class="badge-ep">قسمت ${anime.episodes.length}</span>
                <span class="badge-rating"><i class='bx bxs-star'></i> ${anime.rating}</span>
            </div>
            <div class="card-body">
                <h3>${anime.title}</h3>
                <div class="card-genres">${genresHtml}</div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

// رندر سیستم جدول پخش هفتگی
function renderSchedule(dayName) {
    const scheduleContainer = document.getElementById("schedule-container");
    if (!scheduleContainer) return;
    scheduleContainer.innerHTML = "";
    
    const filteredAnime = animeDatabase.filter(anime => anime.day === dayName);
    if (filteredAnime.length === 0) {
        scheduleContainer.innerHTML = `<p style="color:var(--text-gray); grid-column:1/-1; text-align:center; padding:20px;">برنامه‌ای برای این روز ثبت نشده است.</p>`;
        return;
    }
    
    filteredAnime.forEach(anime => {
        const card = document.createElement("div");
        card.className = "anime-card";
        card.onclick = () => window.location.href = `anime.html?id=${anime.id}`;
        
        let genresHtml = "";
        anime.genres.forEach(g => genresHtml += `<span>${g}</span>`);
        
        card.innerHTML = `
            <div class="card-thumb">
                <img src="${anime.poster}" alt="${anime.title}" loading="lazy">
                <span class="badge-ep">${anime.status}</span>
                <span class="badge-rating"><i class='bx bxs-star'></i> ${anime.rating}</span>
            </div>
            <div class="card-body">
                <h3>${anime.title}</h3>
                <div class="card-genres">${genresHtml}</div>
            </div>
        `;
        scheduleContainer.appendChild(card);
    });
}

// مدیریت تب‌های روزهای هفته
function setupScheduleTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const activeTab = document.querySelector(".tab-btn.active");
            if (activeTab) activeTab.classList.remove("active");
            tab.classList.add("active");
            renderSchedule(tab.innerText);
        });
    });
}

// سیستم جستجوی هوشمند متصل به صفحه فیلتر
function setupSearch() {
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    if (!searchInput) return;
    
    const runSearch = () => {
        const q = searchInput.value.trim();
        if (q) window.location.href = `filter.html?search=${encodeURIComponent(q)}`;
    };
    if (searchBtn) searchBtn.addEventListener("click", runSearch);
    searchInput.addEventListener("keypress", (e) => { if (e.key === "Enter") runSearch(); });
}

// کنترلر منوی همبرگری در گوشی
function setupMobileMenu() {
    const toggle = document.getElementById("mobile-menu-icon");
    const menu = document.getElementById("nav-menu-container");
    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            menu.classList.toggle("active");
            const icon = toggle.querySelector("i");
            if (icon) {
                icon.className = menu.classList.contains("active") ? "bx bx-x" : "bx bx-menu";
            }
        });
    }
}

// سیستم ذخیره‌سازی انیمه ویژه در لیست علاقه‌مندی‌های مرورگر (Bookmark)
function setupHeroBookmark() {
    const btn = document.getElementById("hero-bookmark");
    if (!btn) return;
    
    // بررسی وضعیت قبلی در LocalStorage
    if (localStorage.getItem("hero_anime_saved") === "true") {
        btn.innerHTML = "<i class='bx bxs-bookmark-star' style='color:var(--blue-neon)'></i> در لیست شما";
    }
    
    btn.addEventListener("click", () => {
        if (localStorage.getItem("hero_anime_saved") !== "true") {
            localStorage.setItem("hero_anime_saved", "true");
            btn.innerHTML = "<i class='bx bxs-bookmark-star' style='color:var(--blue-neon)'></i> ذخیره شد";
            alert("این انیمه با موفقیت به لیست تماشای شما در حافظه مرورگر اضافه شد!");
        } else {
            localStorage.removeItem("hero_anime_saved");
            btn.innerHTML = "<i class='bx bx-bookmark'></i> افزودن به لیست";
            alert("انیمه از لیست تماشای شما حذف شد.");
        }
    });
}