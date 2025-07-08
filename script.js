// 优化后的媒体展示应用

// 媒体数据配置
const mediaConfig = {
    video: [
        "http://api.yujn.cn/api/zzxjj.php",
        "http://www.yujn.cn/api/yuzu.php",
        "http://www.yujn.cn/api/tianmei.php",
        "http://www.yujn.cn/api/jksp.php",
        "http://www.yujn.cn/api/sbkl.php",
        "http://www.yujn.cn/api/rewu.php",
        "http://www.yujn.cn/api/luoli.php",
        "http://www.yujn.cn/api/shejie.php",
        "http://www.yujn.cn/api/hanfu.php",
        "http://www.yujn.cn/api/jpmt.php",
        "http://www.yujn.cn/api/manyao.php",
        "http://www.yujn.cn/api/diaodai.php",
        "http://www.yujn.cn/api/qingchun.php",
        "http://www.yujn.cn/api/COS.php",
        "http://www.yujn.cn/api/nvgao.php",
        "http://www.yujn.cn/api/jiepai.php",
        "http://www.yujn.cn/api/ksbianzhuang.php",
        "http://www.yujn.cn/api/wmsc.php",
        "http://www.yujn.cn/api/shwd.php",
        "http://www.yujn.cn/api/chuanda.php",
        "https://api.mmp.cc/api/miss?type=mp4",
        "https://www.yviii.com/video/i.php",
        "https://www.yviii.com/video/suiji.php",
    ]
};

class MediaApp {
    constructor() {
        this.currentType = 'video';
        this.currentIndex = 0;
        this.history = [0];
        this.isLoading = false;
        this.preloadCache = new Map();
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.isRandomMode = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.init();
    }
    init() {
        this.createLoadingIndicator();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadUserPreferences();
        this.loadMedia();
    }
    createLoadingIndicator() {
        const loading = document.createElement('div');
        loading.id = 'loadingIndicator';
        loading.className = 'loading-indicator';
        loading.innerHTML = '<div class="spinner"></div><span>加载中...</span>';
        document.body.appendChild(loading);
    }
    showLoading() {
        this.isLoading = true;
        document.getElementById('loadingIndicator').style.display = 'flex';
    }
    hideLoading() {
        this.isLoading = false;
        document.getElementById('loadingIndicator').style.display = 'none';
    }
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <p>${message}</p>
                <button onclick="app.retryLoad()">重试</button>
                <button onclick="app.nextMedia()">跳过</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    retryLoad() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        this.loadMedia();
    }
    setupEventListeners() {
        document.getElementById('nextBtn').addEventListener('click', () => this.nextMedia());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevMedia());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        this.addControlButtons();
    }
    addControlButtons() {
        const controls = document.querySelector('.controls');
        const randomBtn = document.createElement('button');
        randomBtn.className = 'control-btn';
        randomBtn.id = 'randomBtn';
        randomBtn.textContent = '随机';
        randomBtn.addEventListener('click', () => this.toggleRandomMode());
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'control-btn';
        favoriteBtn.id = 'favoriteBtn';
        favoriteBtn.textContent = '收藏';
        favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        controls.appendChild(randomBtn);
        controls.appendChild(favoriteBtn);
    }
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (this.isLoading) return;
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextMedia();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevMedia();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    this.toggleRandomMode();
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    this.toggleFavorite();
                    break;
            }
        });
    }
    loadUserPreferences() {
        const savedIndex = localStorage.getItem('currentIndex');
        const savedRandomMode = localStorage.getItem('isRandomMode');
        if (savedIndex) this.currentIndex = parseInt(savedIndex);
        if (savedRandomMode) this.isRandomMode = savedRandomMode === 'true';
    }
    saveUserPreferences() {
        localStorage.setItem('currentIndex', this.currentIndex.toString());
        localStorage.setItem('isRandomMode', this.isRandomMode.toString());
    }
    async loadMedia() {
        if (this.isLoading) return;
        this.showLoading();
        this.retryCount = 0;
        const container = document.getElementById('mediaContainer');
        container.innerHTML = '';
        const mediaUrl = mediaConfig['video'][this.currentIndex];
        try {
            await this.loadVideo(mediaUrl, container);
            this.hideLoading();
            this.updateFavoriteButton();
            this.saveUserPreferences();
            this.preloadNext();
        } catch (error) {
            this.hideLoading();
            this.handleLoadError(error);
        }
    }
    loadVideo(url, container) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.muted = false;
            video.onloadeddata = () => {
                container.appendChild(video);
                resolve();
            };
            video.onerror = () => {
                reject(new Error('视频加载失败'));
            };
            video.src = url;
        });
    }
    handleLoadError(error) {
        console.error('媒体加载失败:', error);
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.showError(`${error.message}，正在重试... (${this.retryCount}/${this.maxRetries})`);
            setTimeout(() => this.loadMedia(), 2000);
        } else {
            this.showError(`${error.message}，已达到最大重试次数`);
        }
    }
    preloadNext() {
        const nextIndex = this.getNextIndex();
        const nextUrl = mediaConfig['video'][nextIndex];
        if (!this.preloadCache.has(nextUrl)) {
            // 视频预加载可选实现
        }
    }
    getNextIndex() {
        if (this.isRandomMode) {
            return Math.floor(Math.random() * mediaConfig['video'].length);
        }
        return (this.currentIndex + 1) % mediaConfig['video'].length;
    }
    nextMedia() {
        this.history.push(this.currentIndex);
        if (this.isRandomMode) {
            this.currentIndex = this.getNextIndex();
        } else {
            // 保持当前有效URL索引，避免加载无效URL
            const nextIndex = (this.currentIndex + 1) % mediaConfig['video'].length;
            const nextUrl = mediaConfig['video'][nextIndex];
            // 简单校验URL是否有效（可根据实际需求扩展）
            if (nextUrl.startsWith('https://') || nextUrl.startsWith('http://')) {
                this.currentIndex = nextIndex;
            } else {
                // 如果无效，保持当前索引
                this.currentIndex = this.currentIndex;
            }
        }
        this.loadMedia();
    }
    prevMedia() {
        if (this.history.length > 1) {
            this.history.pop();
            this.currentIndex = this.history[this.history.length - 1];
            this.loadMedia();
        }
    }
    toggleFullscreen() {
        const media = document.querySelector('#mediaContainer video');
        if (media) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (media.requestFullscreen) {
                media.requestFullscreen();
            }
        }
    }
    toggleRandomMode() {
        this.isRandomMode = !this.isRandomMode;
        const randomBtn = document.getElementById('randomBtn');
        if (this.isRandomMode) {
            randomBtn.classList.add('active');
            randomBtn.textContent = '随机✓';
        } else {
            randomBtn.classList.remove('active');
            randomBtn.textContent = '随机';
        }
        this.saveUserPreferences();
    }
    toggleFavorite() {
        const currentUrl = mediaConfig['video'][this.currentIndex];
        fetch('favorites.txt')
          .then(response => response.text())
          .then(text => {
            let favorites = text ? text.split('\n').filter(line => line.trim() !== '') : [];
            const index = favorites.indexOf(currentUrl);
            if (index === -1) {
              favorites.push(currentUrl);
            } else {
              favorites.splice(index, 1);
            }
            // 发送更新请求
            fetch('update_favorites.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: 'favorites=' + encodeURIComponent(favorites.join('\n'))
            }).then(() => {
              this.updateFavoriteButton();
            });
          });
    }

    updateFavoriteButton() {
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            const currentUrl = mediaConfig['video'][this.currentIndex];
            fetch('favorites.txt')
              .then(response => response.text())
              .then(text => {
                const favorites = text ? text.split('\n').filter(line => line.trim() !== '') : [];
                const isFavorited = favorites.includes(currentUrl);
                if (isFavorited) {
                    favoriteBtn.classList.add('active');
                    favoriteBtn.textContent = '已收藏';
                } else {
                    favoriteBtn.classList.remove('active');
                    favoriteBtn.textContent = '收藏';
                }
              });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new MediaApp();
    const helpDiv = document.createElement('div');
    helpDiv.className = 'help-overlay';
    helpDiv.innerHTML = `
        <div class="help-content">
            <h3>键盘快捷键</h3>
            <p>→ 或 空格: 下一个</p>
            <p>← : 上一个</p>
            <p>F: 全屏</p>
            <p>R: 随机模式</p>
            <p>S: 收藏</p>
            <p>H: 显示/隐藏帮助</p>
        </div>
    `;
    document.body.appendChild(helpDiv);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'h' || e.key === 'H') {
            e.preventDefault();
            helpDiv.style.display = helpDiv.style.display === 'none' ? 'flex' : 'none';
        }
        if (e.key === 'Escape') {
            helpDiv.style.display = 'none';
        }
    });
    helpDiv.addEventListener('click', (e) => {
        if (e.target === helpDiv) {
            helpDiv.style.display = 'none';
        }
    });
});