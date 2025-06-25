// 收藏夹页面脚本
window.addEventListener('DOMContentLoaded', () => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const container = document.getElementById('favoritesContainer');
  if (!favorites.length) {
    container.innerHTML = '<p style="color:#fff;text-align:center;margin-top:40px;">暂无收藏视频</p>';
    return;
  }
  favorites.forEach((url, idx) => {
    const videoBox = document.createElement('div');
    videoBox.className = 'favorite-video-box';
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.style.maxWidth = '320px';
    video.style.maxHeight = '180px';
    videoBox.appendChild(video);
    // 删除按钮
    const delBtn = document.createElement('button');
    delBtn.textContent = '移除';
    delBtn.className = 'remove-btn';
    delBtn.onclick = function() {
      favorites.splice(idx, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      location.reload();
    };
    videoBox.appendChild(delBtn);
    container.appendChild(videoBox);
  });
});