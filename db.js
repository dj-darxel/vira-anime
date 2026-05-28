// دیتابیس مرکزی و داینامیک ویرا انیمه با قابلیت ارتقا به سرور آنلاین در آینده (سال ۲۰۲۶)

const DEFAULT_ANIMES = [
    {
        id: 1,
        title: "Attack on Titan",
        faTitle: "حمله به تایتان",
        type: "سریالی",
        status: "اتمام یافته",
        year: "۲۰۱۳",
        rating: "۹.۱",
        genres: ["اکشن", "فانتزی", "درام"],
        audio: "both", // both (دوبله و زیرنویس) | dubbed (دوبله) | subbed (زیرنویس)
        poster: "https://wallpapercave.com/wp/wp1812485.jpg",
        banner: "https://wallpapercave.com/wp/wp1812462.jpg",
        description: "داستان در دنیایی جریان دارد که بشریت توسط غول‌هایی به نام تایتان محاصره شده است. پس از ویران شدن دیوار شهر و کشته شدن مادر ارن یگر، او قسم می‌خورد که تمام تایتان‌ها را نابود کند...",
        day: "شنبه",
        nextEpisodeTime: null,
        episodes: [
            { number: "1", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
            { number: "2", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", downloadUrl: "" } // بدون لینک دانلود برای تست ساختار خطا ندادن
        ]
    },
    {
        id: 2,
        title: "Demon Slayer",
        faTitle: "تیغه شیطان",
        type: "سریالی",
        status: "در حال پخش",
        year: "۲۰۱۹",
        rating: "۸.۷",
        genres: ["اکشن", "ماوراءطبیعی"],
        audio: "subbed",
        poster: "https://wallpapercave.com/wp/wp8150479.jpg",
        banner: "https://wallpapercave.com/wp/wp4915664.jpg",
        description: "تانجیرو کامادو پسر جوانی است که پس از قتل عام خانواده‌اش توسط شیاطین و تبدیل شدن خواهر کوچکش نزوکو به یک شیطان، برای یافتن پادزهر و انتقام به ارتش شیطان‌کش‌ها می‌پیوندد.",
        day: "امروز",
        nextEpisodeTime: "2026-06-03T20:00:00",
        episodes: [
            { number: "1", streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" }
        ]
    }
];

// مقداردهی اولیه دیتابیس در LocalStorage
if (!localStorage.getItem("vira_anime_db")) {
    localStorage.setItem("vira_anime_db", JSON.stringify(DEFAULT_ANIMES));
}

// --- توابع ناهمگام (Async) مدیریت دیتابیس برای اتصال راحت به سرور در آینده ---

// دریافت لیست تمام انیمه‌ها
async function getAllAnimes() {
    const data = localStorage.getItem("vira_anime_db");
    return data ? JSON.parse(data) : [];
}

// دریافت یک انیمه خاص بر اساس آی‌دی
async function getAnimeById(id) {
    const animes = await getAllAnimes();
    return animes.find(anime => anime.id === parseInt(id)) || null;
}

// اضافه کردن انیمه جدید
async function insertAnime(animeData) {
    const animes = await getAllAnimes();
    // تولید آی‌دی خودکار جدید
    const newId = animes.length > 0 ? Math.max(...animes.map(a => a.id)) + 1 : 1;
    const newAnime = { id: newId, ...animeData };
    animes.push(newAnime);
    localStorage.setItem("vira_anime_db", JSON.stringify(animes));
    return newAnime;
}

// ویرایش انیمه موجود
async function updateAnime(id, updatedData) {
    const animes = await getAllAnimes();
    const index = animes.findIndex(anime => anime.id === parseInt(id));
    if (index !== -1) {
        animes[index] = { ...animes[index], ...updatedData };
        localStorage.setItem("vira_anime_db", JSON.stringify(animes));
        return true;
    }
    return false;
}

// حذف یک انیمه
async function deleteAnime(id) {
    let animes = await getAllAnimes();
    animes = animes.filter(anime => anime.id !== parseInt(id));
    localStorage.setItem("vira_anime_db", JSON.stringify(animes));
    return true;
}