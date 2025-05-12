// 移除侧边栏控制代码（原toggleBtn和sidebar相关逻辑）

// 媒体数据模拟（实际使用时替换为接口请求）
const mediaData = {
    image: [
        'https://api.yimian.xyz/img',
        'https://api.lolimi.cn/API/tup/xjj.php',
        'https://api.lolimi.cn/API/meizi/api.php?type=image',
        'https://www.onexiaolaji.cn/RandomPicture/api/?key=qq249663924',
        'https://v2.xxapi.cn/api/meinvpic?return=302',
        'https://v2.xxapi.cn/api/baisi?return=302',
        'https://v2.xxapi.cn/api/heisi?return=302',
        'https://cdn.seovx.com/?mom=302',
        'https://cdn.seovx.com/ha/?mom=302',
        'https://api.pearktrue.cn/api/beautifulgirl/?type=image',
        'https://api.yujn.cn/api/cos.php',
        'https://api.yujn.cn/api/jk.php?',
        'https://api.yujn.cn/api/yscos.php??',
        'https://api.yujn.cn/api/heisi.php',
        'https://api.yujn.cn/api/tui.php?',
        'https://free.wqwlkj.cn/wqwlapi/ks_xjj.php?type=image',
        'https://free.wqwlkj.cn/wqwlapi/hlxcos.php?type=image'
    ],
    video: [
        'https://api.yujn.cn/api/zzxjj.php',
        `https://api.yujn.cn/api/xjj.php`,
        `https://api.yujn.cn/api/juhexjj.php`,
        `https://api.yujn.cn/api/luoli.php`
    ]
};

let currentType = 'video'; // 默认显示视频
let currentIndex = 0;
let history = [0]; // 记录视频浏览历史

// 切换媒体类型（现有逻辑保持不变）
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有按钮的选中状态
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        // 添加当前按钮的选中状态（触发高亮）
        btn.classList.add('active');
        
        currentType = btn.dataset.type;
        currentIndex = 0;
        if (currentType === 'video') history = [0]; 
        loadMedia();
    });
});

// 加载媒体内容
function loadMedia() {
    const container = document.getElementById('mediaContainer');
    container.innerHTML = '';
    
    if (currentType === 'image') {
        const img = document.createElement('img');
        img.src = mediaData.image[currentIndex];
        
        // 添加图片加载失败检测
        img.onerror = () => {
            console.log('图片加载失败，尝试加载下一个...');
            document.getElementById('nextBtn').click(); // 触发下一个按钮点击
        };
        
        container.appendChild(img);
    } else {
        const video = document.createElement('video');
        video.src = mediaData.video[currentIndex];
        video.controls = true;
        video.autoplay = true;  // 添加自动播放属性
        video.muted = true;     // 添加静音以兼容浏览器自动播放策略
        container.appendChild(video);
    }
}

// 下一个按钮
document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentType === 'video') {
        history.push(currentIndex); // 记录视频历史
    }
    currentIndex = (currentIndex + 1) % mediaData[currentType].length;
    loadMedia();
});

// 上一个按钮（仅视频有效）
document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentType === 'video' && history.length > 1) {
        history.pop(); // 移除当前索引
        currentIndex = history[history.length - 1];
        loadMedia();
    }
});

// 全屏功能
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    const media = document.querySelector('#mediaContainer img, #mediaContainer video');
    if (media.requestFullscreen) {
        media.requestFullscreen();
    }
});

// 初始加载视频
loadMedia();