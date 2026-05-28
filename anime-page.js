document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id') || 1;
    const currentAnime = getAnimeById(animeId);
    
    if (currentAnime) {
        initAnimePage(currentAnime);
        setupCountdown(currentAnime.nextEpisodeTime);
        setupCustomPlayer();
        setupDynamicRating(animeId);
    }
    setupCinemaMode();
    setupCommentSystem();
    setupMobileMenu();
});

// ۱. رندر اطلاعات و پیاده‌سازی سیستم هوشمند "وضعیت تماشا"
function initAnimePage(anime) {
    document.title = `ویرا انیمه | ${anime.title}`;
    document.getElementById("anime-title").innerText = anime.title;
    document.getElementById("anime-fa-title").innerText = anime.faTitle;
    document.getElementById("anime-rating").innerText = anime.rating;
    document.getElementById("anime-type").innerText = anime.type;
    document.getElementById("anime-year").innerText = anime.year;
    document.getElementById("anime-status").innerText = anime.status;
    document.getElementById("anime-description").innerText = anime.description;
    document.getElementById("anime-poster").src = anime.poster;
    document.getElementById("anime-large-banner").style.backgroundImage = `url('${anime.banner}')`;
    document.getElementById("ep-count").innerText = `${anime.episodes.length} قسمت`;
    
    const genresContainer = document.getElementById("anime-genres");
    genresContainer.innerHTML = "";
    anime.genres.forEach(g => {
        genresContainer.innerHTML += `<span>${g}</span>`;
    });
    
    // لود دکمه‌های قسمت‌ها و بررسی وضعیت تماشا از LocalStorage
    const episodesGrid = document.getElementById("episodes-grid");
    episodesGrid.innerHTML = "";
    
    let watchedHistory = JSON.parse(localStorage.getItem(`anime_${anime.id}_watched`)) || [];
    
    anime.episodes.forEach((ep, index) => {
        const epBtn = document.createElement("button");
        const isWatched = watchedHistory.includes(ep.number.toString());
        
        epBtn.className = `ep-btn-item ${index === 0 ? 'active' : ''} ${isWatched ? 'watched' : ''}`;
        epBtn.innerText = ep.number;
        
        epBtn.onclick = () => {
            // ذخیره در تاریخچه مرورگر کاربر به محض کلیک روی قسمت
            if (!watchedHistory.includes(ep.number.toString())) {
                watchedHistory.push(ep.number.toString());
                localStorage.setItem(`anime_${anime.id}_watched`, JSON.stringify(watchedHistory));
                epBtn.classList.add("watched");
            }
            changeEpisode(ep.url, ep.number, epBtn);
        };
        episodesGrid.appendChild(epBtn);
    });
    
    if (anime.episodes.length > 0) {
        changeEpisode(anime.episodes[0].url, anime.episodes[0].number, null);
    }
}

function changeEpisode(url, num, btn) {
    const video = document.getElementById("vira-player");
    document.getElementById("player-src").src = url;
    document.getElementById("playing-episode-title").innerText = `در حال پخش: قسمت ${num}`;
    video.load();
    video.play().catch(() => {});
    if (btn) {
        document.querySelectorAll(".ep-btn-item").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }
}

// ۲. راه‌اندازی ویدیو پلیر سفارشی اختصاصی (Custom HTML5 Player & PiP Mode)
function setupCustomPlayer() {
    const video = document.getElementById("vira-player");
    const playBtn = document.getElementById("play-btn");
    const skipBtn = document.getElementById("skip-btn");
    const pipBtn = document.getElementById("pip-btn");
    const fsBtn = document.getElementById("fullscreen-btn");
    const timeline = document.getElementById("timeline");
    const progress = document.getElementById("progress");
    const timeTxt = document.getElementById("time-txt");
    
    if (!video || !playBtn) return;
    
    playBtn.addEventListener("click", () => {
        if (video.paused) {
            video.play();
            playBtn.innerHTML = "<i class='bx bx-pause'></i>";
        } else {
            video.pause();
            playBtn.innerHTML = "<i class='bx bx-play'></i>";
        }
    });
    
    video.addEventListener("timeupdate", () => {
        const pct = (video.currentTime / video.duration) * 100;
        progress.style.width = `${pct}%`;
        
        let curM = Math.floor(video.currentTime / 60).toString().padStart(2, '0');
        let curS = Math.floor(video.currentTime % 60).toString().padStart(2, '0');
        let durM = Math.floor(video.duration || 0).toString().padStart(2, '0');
        let durS = Math.floor((video.duration || 0) % 60).toString().padStart(2, '0');
        timeTxt.innerText = `${curM}:${curS} / ${durM}:${durS}`;
    });
    
    timeline.addEventListener("click", (e) => {
        const rect = timeline.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        video.currentTime = pct * video.duration;
    });
    
    skipBtn.addEventListener("click", () => video.currentTime += 10); // ۱۰ ثانیه جلو زدن فیلم
    
    // قابلیت مینی‌پلیر (Picture in Picture)
    pipBtn.addEventListener("click", async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
            }
        } catch (err) { console.log("مرورگر شما از قابلیت مینی‌پلیر پشتیبانی نمی‌کند."); }
    });
    
    fsBtn.addEventListener("click", () => {
        const playerWrapper = document.getElementById("player-wrapper");
        if (!document.fullscreenElement) {
            playerWrapper.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    });
}

// ۳. شمارش معکوس زنده برای انیمه‌های در حال پخش
function setupCountdown(targetDate) {
    const box = document.getElementById("countdown-box");
    const display = document.getElementById("timer-display");
    if (!targetDate || !box) return;
    
    box.style.display = "flex";
    
    function updateTimer() {
        const diff = new Date(targetDate) - new Date();
        if (diff <= 0) {
            display.innerText = "هم‌اکنون در حال پخش...";
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        display.innerHTML = `
            <div class="countdown-box">${days} روز</div>
            <div class="countdown-box">${hours} ساعت</div>
            <div class="countdown-box">${mins} دقیقه</div>
        `;
    }
    updateTimer();
    setInterval(updateTimer, 60000); // آپدیت هر یک دقیقه
}

// ۴. سیستم امتیازدهی ستاره‌ای ماندگار
function setupDynamicRating(id) {
    const stars = document.querySelectorAll("#user-rating-stars i");
    let savedRating = localStorage.getItem(`anime_${id}_rating`);
    
    if (savedRating) highlightStars(savedRating);
    
    stars.forEach(star => {
        star.addEventListener("click", () => {
            const val = star.getAttribute("data-value");
            localStorage.setItem(`anime_${id}_rating`, val);
            highlightStars(val);
            alert(`امتیاز ${val} ستاره از طرف شما با موفقیت ثبت شد!`);
        });
    });
    
    function highlightStars(val) {
        stars.forEach(s => {
            s.style.color = s.getAttribute("data-value") <= val ? "#facc15" : "#4b5563";
        });
    }
}

// ۵. حالت سینما لایت (خاموشی چراغ‌ها)
function setupCinemaMode() {
    const btn = document.getElementById("light-switch-btn");
    if (btn) {
        btn.addEventListener("click", () => {
            document.body.classList.toggle("cinema-dark");
            btn.innerHTML = document.body.classList.contains("cinema-dark") ?
                "<i class='bx bxs-lightbulb'></i> روشن کردن چراغ" :
                "<i class='bx bx-lightbulb'></i> سینما لایت";
        });
    }
}

// ۶. سیستم ثبت نظر موقت فرم
function setupCommentSystem() {
    const btn = document.getElementById("submit-comment-btn");
    const txt = document.getElementById("comment-text");
    const wrapper = document.getElementById("comments-wrapper");
    if (btn && txt && wrapper) {
        btn.addEventListener("click", () => {
            if (!txt.value.trim()) return;
            wrapper.innerHTML = `
                <div class='comment-item'>
                    <div class='comment-user-avatar'><i class='bx bx-user'></i></div>
                    <div class='comment-content'>
                        <h4>کاربر مهمان <span>هم‌اکنون</span></h4>
                        <p>${txt.value}</p>
                    </div>
                </div>` + wrapper.innerHTML;
            txt.value = "";
            document.getElementById("comment-count").innerText = document.querySelectorAll(".comment-item").length;
        });
    }
}

// منوی موبایل صفحه پخش
function setupMobileMenu() {
    const toggle = document.getElementById("mobile-menu-icon");
    const menu = document.getElementById("nav-menu-container");
    if (toggle && menu) toggle.addEventListener("click", () => menu.classList.toggle("active"));
}