// ==========================================
// 1. 全局数据变量
// ==========================================
let movieData = [];
let bookData = [];
let groupData = [];

// ==========================================
// 2. 核心：从 db.json 获取数据
// ==========================================
async function loadData() {
    try {
        const response = await fetch('./db.json'); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // 填充全局变量
        movieData = data.movies || [];
        bookData = data.books || [];
        groupData = data.groups || [];

        // 初始化页面
        initPage();

    } catch (error) {
        console.error("加载失败:", error);
        if (error.name === 'ReferenceError') {
            alert("代码不完整！缺少函数定义。");
        } else {
            alert("db.json 读取失败，请确保使用 Live Server 运行。");
        }
    }
}

// ==========================================
// 3. 页面初始化逻辑 (路由分发)
// ==========================================
function initPage() {
    console.log("开始初始化页面...");
    
    // 获取各页面的特有容器 ID
    const isHomePage    = document.getElementById('homeMovieGrid'); 
    const isMoviePage   = document.getElementById('movieGrid');     
    const isBookPage    = document.getElementById('bookGrid');      
    const isDetailPage  = document.getElementById('detailContainer'); 
    const isGroupPage   = document.getElementById('groupList');     

    // === 1. 首页 ===
    if (isHomePage) {
        // 渲染默认内容
        renderCards(movieData.slice(0, 4), 'homeMovieGrid', 'movie');
        renderCards(bookData.slice(0, 4), 'homeBookGrid', 'book');
        renderGroups(groupData.slice(0, 3), 'homeGroupList');
        
        // ★★★ 启动全站搜索 ★★★
        initHomeSearch(); 
    } 
    // === 2. 电影频道 ===
    else if (isMoviePage) {
        renderCards(movieData, 'movieGrid', 'movie');
        initSearch(movieData, 'movieGrid', 'movie');
        initTags(movieData, 'movieGrid', 'movie');
    } 
    // === 3. 图书频道 ===
    else if (isBookPage) {
        renderCards(bookData, 'bookGrid', 'book');
        initSearch(bookData, 'bookGrid', 'book');
        initTags(bookData, 'bookGrid', 'book');
    } 
    // === 4. 小组频道 ===
    else if (isGroupPage) {
        renderGroups(groupData, 'groupList');
        initTags(groupData, 'groupList', 'group'); 
    } 
    // === 5. 详情页 ===
    else if (isDetailPage) {
        initDetailPage();
    }
}

// ==========================================
// 4. 渲染函数
// ==========================================
function renderCards(data, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return; 

    container.innerHTML = '';
    if(!data || data.length === 0) {
        container.innerHTML = '<p style="padding:20px; color:#999;">没有找到相关内容。</p>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = function() {
            window.location.href = `detail.html?type=${type}&id=${item.id}`;
        };
        
        div.innerHTML = `
            <img src="${item.img}" alt="${item.title}">
            <h3>${item.title}</h3>
            <div class="rating">
                ${type === 'book' ? item.author : '★★★★★ ' + item.rating}
            </div>
        `;
        container.appendChild(div);
    });
}

function renderGroups(data, containerId = 'groupList') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if(!data || data.length === 0) {
        container.innerHTML = '<p style="padding:20px; color:#999;">没有找到相关小组。</p>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'group-item';
        const isSmall = containerId === 'homeGroupList';
        
        div.innerHTML = `
            <img src="${item.img}" class="group-img" style="${isSmall ? 'width:32px;height:32px' : ''}">
            <div class="group-info">
                <h3 style="${isSmall ? 'font-size:13px' : ''}"><a href="#">${item.title}</a></h3>
                <div class="group-meta">${item.member} 人聚集</div>
                ${!isSmall ? `<div class="group-desc">${item.desc}</div>` : ''} 
            </div>
        `;
        container.appendChild(div);
    });
}

// ==========================================
// 5. 交互功能 (首页全站搜索 / 频道搜索 / 标签)
// ==========================================

// ★★★ 新增：首页全站搜索 ★★★
function initHomeSearch() {
    const input = document.getElementById('globalSearchInput');
    const defaultContent = document.getElementById('homeDefaultContent');
    const searchResults = document.getElementById('globalSearchResults');

    if (!input) return;

    input.addEventListener('input', function(e) {
        const keyword = e.target.value.trim().toLowerCase();

        // 如果输入为空，显示默认内容，隐藏搜索结果
        if (keyword === '') {
            defaultContent.style.display = 'block';
            searchResults.style.display = 'none';
            return;
        }

        // 否则：隐藏默认内容，显示搜索结果
        defaultContent.style.display = 'none';
        searchResults.style.display = 'block';

        // 1. 搜电影
        const foundMovies = movieData.filter(item => {
            return item.title.includes(keyword) || 
                   (item.director && item.director.includes(keyword));
        });
        renderCards(foundMovies, 'searchResultMovie', 'movie');

        // 2. 搜图书
        const foundBooks = bookData.filter(item => {
            return item.title.includes(keyword) || 
                   (item.author && item.author.includes(keyword));
        });
        renderCards(foundBooks, 'searchResultBook', 'book');
    });
}

// 频道页的单项搜索
function initSearch(currentData, containerId, type) {
    const searchInput = document.querySelector('.search-box input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const keyword = e.target.value.trim().toLowerCase();
        
        const filteredData = currentData.filter(item => {
            const matchTitle = item.title.includes(keyword);
            const matchCreator = (item.director && item.director.includes(keyword)) || 
                                 (item.author && item.author.includes(keyword));
            return matchTitle || matchCreator;
        });
        renderCards(filteredData, containerId, type);
    });
}

function initTags(currentData, containerId, type) {
    const tags = document.querySelectorAll('.tags span');
    tags.forEach(tag => {
        tag.style.cursor = 'pointer';
        tag.onclick = function() {
            const tagName = this.innerText;
            tags.forEach(t => { t.style.background = '#fff'; t.style.color = '#37a'; });
            this.style.background = '#00b51d';
            this.style.color = '#fff';

            const filteredData = currentData.filter(item => {
                const itemTags = item.tags || []; 
                return itemTags.includes(tagName);
            });

            if (containerId === 'groupList') {
                renderGroups(filteredData, containerId);
            } else {
                renderCards(filteredData, containerId, type);
            }
        };
    });
}

// ==========================================
// 6. 其他逻辑 (详情页 / 评论 / 登录)
// ==========================================

function submitComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    const list = document.getElementById('commentList');
    if (!text) { alert("请先输入评论内容！"); return; }
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    const newItem = document.createElement('div');
    newItem.className = 'comment-item';
    newItem.style.animation = "fadeIn 0.5s"; 
    newItem.innerHTML = `<span class="user" style="color:#37a;font-weight:bold;">我</span> <span style="color:#999;font-size:12px;">${dateStr}</span><p style="margin-top:5px;">${text}</p>`;
    list.prepend(newItem);
    input.value = '';
}

const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }`;
document.head.appendChild(styleSheet);

function initDetailPage() {
    const container = document.getElementById('detailContainer');
    if (!container) return; 
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');

    let dataSource = [];
    if (type === 'movie') dataSource = movieData;
    else if (type === 'book') dataSource = bookData;

    const item = dataSource.find(d => d.id == id);
    if (!item) {
        container.innerHTML = "<h1>未找到内容，请返回首页重试。</h1>";
        return;
    }
    const typeLabel = type === 'movie' ? "导演" : "作者";
    const subInfo = type === 'movie' ? item.director : item.author;
    const tagsStr = item.tags ? item.tags.join(' / ') : '暂无';

    container.innerHTML = `
        <h1 class="detail-title">${item.title} <span class="year">(${item.year})</span></h1>
        <div class="detail-flex">
            <div class="detail-poster"><img src="${item.img}" alt="${item.title}"></div>
            <div class="detail-info">
                <p><strong>${typeLabel}:</strong> ${subInfo}</p>
                <p><strong>类型:</strong> ${tagsStr}</p>
                <div class="detail-rating-block">
                    <span class="big-score">${item.rating}</span>
                    <div class="star-wrap"><div class="stars">★★★★★</div><div class="rating-count">102345人评价</div></div>
                </div>
                <div class="detail-intro"><h3>简介 · · · · · ·</h3><p>${item.desc}</p></div>
            </div>
        </div>
    `;
    document.title = `${item.title} - Douban Lite`;
}

// 入口
window.onload = function() {
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault(); 
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            if (u === 'admin' && p === 'admin') { alert("登录成功！"); window.location.href = "index.html"; }
            else { alert("账号密码错误"); }
        }
        return; 
    }
    loadData();
};