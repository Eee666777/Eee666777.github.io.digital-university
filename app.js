// Оновлення відео відповідно до чітких календарних меж сезонів
function updateSeasonAnimation() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  const video = document.getElementById('season-video');
  if (!video) return;

  let videoSrc = '';

  // 1 вересня (9) — 30 листопада (11): Осінь (osen.mp4)
  if (month >= 9 && month <= 11) {
    videoSrc = SEASON_VIDEOS.autumn;
  } 
  // 1 грудня (12) — 28/29 лютого (2): Зима (zima.mp4)
  else if (month === 12 || month === 1 || month === 2) {
    videoSrc = SEASON_VIDEOS.winter;
  } 
  // 1 березня (3) — 31 серпня (8): Літо (leto.mp4)
  else {
    videoSrc = SEASON_VIDEOS.springSummer;
  }

  if (!video.src.includes(encodeURIComponent(videoSrc)) && !video.src.endsWith(videoSrc)) {
    video.src = videoSrc;
    video.load();
    video.play().catch(e => console.log("Автозапуск відео обмежено браузером:", e));
  }
}
