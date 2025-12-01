/**
 * Douban Lite - 核心逻辑脚本
 * 包含：数据加载、路由分发、页面渲染、搜索逻辑、交互功能
 */

// ==========================================
// 1. 数据准备 (含 fallback 备份数据)
// ==========================================

// 预定义的备份数据，防止 fetch 失败（例如直接打开 html 文件时）
const FALLBACK_DATA = {
  "movies": [
    { "id": 1, "title": "肖申克的救赎", "rating": 9.7, "tags": ["剧情", "犯罪", "经典"], "year": "1994", "director": "弗兰克·德拉邦特", "img": "https://placehold.co/270x400/333/fff?text=Shawshank", "desc": "一场关乎希望与自由的越狱。银行家安迪被冤枉杀害妻子和情夫..." },
    { "id": 2, "title": "霸王别姬", "rating": 9.6, "tags": ["剧情", "爱情", "经典"], "year": "1993", "director": "陈凯歌", "img": "https://placehold.co/270x400/800/fff?text=Farewell", "desc": "风华绝代，不疯魔不成活。程蝶衣与段小楼半个世纪的悲欢离合..." },
    { "id": 3, "title": "阿甘正传", "rating": 9.5, "tags": ["剧情", "爱情", "励志"], "year": "1994", "director": "罗伯特·泽米吉斯", "img": "https://placehold.co/270x400/26a/fff?text=Gump", "desc": "Life was like a box of chocolates. 阿甘的奔跑人生..." },
    { "id": 4, "title": "泰坦尼克号", "rating": 9.4, "tags": ["爱情", "灾难", "经典"], "year": "1997", "director": "詹姆斯·卡梅隆", "img": "https://placehold.co/270x400/123/fff?text=Titanic", "desc": "一艘永不沉没的巨轮，一段跨越生死的爱情..." },
    { "id": 5, "title": "千与千寻", "rating": 9.4, "tags": ["动画", "奇幻", "日本"], "year": "2001", "director": "宫崎骏", "img": "https://placehold.co/270x400/e6b/fff?text=Spirited", "desc": "不能吃太胖哦，会被杀掉的！少女千寻的奇幻冒险..." },
    { "id": 6, "title": "盗梦空间", "rating": 9.3, "tags": ["科幻", "悬疑", "美国"], "year": "2010", "director": "克里斯托弗·诺兰", "img": "https://placehold.co/270x400/000/fff?text=Inception", "desc": "梦境中的梦境，这一层是现实还是虚幻？" }
  ],
  "books": [
    { "id": 101, "title": "红楼梦", "author": "曹雪芹", "rating": 9.6, "tags": ["小说", "文学", "经典"], "year": "清代", "img": "https://placehold.co/270x400/532/fff?text=RedDream", "desc": "满纸荒唐言，一把辛酸泪。都云作者痴，谁解其中味。" },
    { "id": 102, "title": "活着", "author": "余华", "rating": 9.4, "tags": ["小说", "文学", "历史"], "year": "1993", "img": "https://placehold.co/270x400/333/fff?text=Live", "desc": "地主少爷福贵嗜赌成性，终于输光了家业一贫如洗。" },
    { "id": 103, "title": "1984", "author": "乔治·奥威尔", "rating": 9.3, "tags": ["小说", "科幻", "政治"], "year": "1949", "img": "https://placehold.co/270x400/444/fff?text=1984", "desc": "老大哥在看着你。一部杰出的政治寓言小说。" },
    { "id": 104, "title": "三体", "author": "刘慈欣", "rating": 8.9, "tags": ["科幻", "小说", "科技"], "year": "2006", "img": "https://placehold.co/270x400/000/fff?text=3Body", "desc": "文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划..." }
  ],
  "groups": [
    { "title": "豆瓣鹅组", "member": "683201", "desc": "这里是八卦的聚集地...", "img": "https://placehold.co/48x48/00b51d/fff?text=G", "tags": ["生活", "兴趣"] },
    { "title": "爱猫生活", "member": "45210", "desc": "吸猫，我们是专业的。", "img": "https://placehold.co/48x48/orange/fff?text=Cat", "tags": ["生活", "兴趣"] },
    { "title": "下厨房", "member": "12300", "desc": "今天你吃了什么？", "img": "https://placehold.co/48x48/d22/fff?text=Food", "tags": ["生活"] },
    { "title": "极简生活", "member": "89000", "desc": "如无必要，勿增实体。", "img": "https://placehold.co/48x48/333/fff?text=Min", "tags": ["生活", "职场"] },
    { "title": "程序员的日常", "member": "1024", "desc": "也就是修修电脑...", "img": "https://placehold.co/48x48/000/fff?text=Code", "tags": ["职场", "校园"] }
  ]
};

// 全局变量
let movieData = [];
let bookData = [];
let groupData = [];

// ==========================================
// 2. 数据加载逻辑
// ==========================================
async function loadData() {
    try {
        const response = await fetch('./db.json'); 
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        
        movieData = data.movies;
        bookData = data.books;
        groupData = data.groups;
        console.log("数据加载成功 (From JSON)");
    } catch (error) {
        console.warn("无法读取 db.json (可能是直接打开了 HTML 文件)，使用内置备份数据。", error);
        movieData = FALLBACK_DATA.movies;
        bookData = FALLBACK_DATA.books;
        groupData = FALLBACK_DATA.groups;
    } finally {
        initPage();
    }
}

// ==========================================
// 3. 页面路由与初始化
// ==========================================
function initPage() {
    // 根据页面中存在的特定 ID 来判断当前是哪个页面
    const isHomePage    = document.getElementById('homeMovieGrid'); 
    const isMoviePage   = document.getElementById('movieGrid');     
    const isBookPage    = document.getElementById('bookGrid');      
    const isDetailPage  = document.getElementById('detailContainer'); 
    const isGroupPage   = document.getElementById('groupList');     

    // === 场景 1: 首页 ===
    if (isHomePage) {
        // 渲染首页推荐（截取部分数据）
        renderCards(movieData.slice(0, 4), 'homeMovieGrid', 'movie');
        renderCards(bookData.slice(0, 4), 'homeBookGrid', 'book');
        renderGroups(groupData.slice(0, 3), 'homeGroupList');
        
        // 启动全站搜索
        initHomeSearch(); 
    } 
    // === 场景 2: 电影频道 ===
    else if (isMoviePage) {
        renderCards(movieData, 'movieGrid', 'movie');
        initLocalSearch(movieData, 'movieGrid', 'movie');
        initTags(movieData, 'movieGrid', 'movie');
    } 
    // === 场景 3: 图书频道 ===
    else if (isBookPage) {
        renderCards(bookData, 'bookGrid', 'book');
        initLocalSearch(bookData, 'bookGrid', 'book');
        initTags(bookData, 'bookGrid', 'book');
    } 
    // === 场景 4: 小组频道 ===
    else if (isGroupPage) {
        renderGroups(groupData, 'groupList');
        initTags(groupData, 'groupList', 'group'); 
    } 
    // === 场景 5: 详情页 ===
    else if (isDetailPage) {
        initDetailPage();
    }
}

// ==========================================
// 4. 渲染函数 (Render)
// ==========================================

/**
 * 渲染卡片 (电影/图书)
 * @param {Array} data 数据数组
 * @param {String} containerId 容器ID
 * @param {String} type 类型 'movie' 或 'book'
 */
function renderCards(data, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return; 

    container.innerHTML = '';
    
    if(!data || data.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; padding:20px; color:#999; text-align:center;">没有找到相关内容。</p>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        // 点击跳转到详情页，携带 type 和 id 参数
        div.onclick = function() {
            window.location.href = `detail.html?type=${type}&id=${item.id}`;
        };
        
        // 图书显示作者，电影显示评分
        const subInfo = type === 'book' ? item.author : `<span style="color:#e09015">★ ${item.rating}</span>`;

        div.innerHTML = `
            <img src="${item.img}" alt="${item.title}">
            <h3>${item.title}</h3>
            <div class="rating">${subInfo}</div>
        `;
        container.appendChild(div);
    });
}

/**
 * 渲染小组列表
 */
function renderGroups(data, containerId = 'groupList') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if(!data || data.length === 0) {
        container.innerHTML = '<p style="padding:20px; color:#999;">没有找到相关小组。</p>';
        return;
    }

    // 判断是否是首页侧边栏的小列表
    const isSmall = containerId === 'homeGroupList';

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'group-item';
        
        div.innerHTML = `
            <img src="${item.img}" class="group-img" style="${isSmall ? 'width:32px;height:32px;margin-right:10px;' : ''}">
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
// 5. 搜索与标签功能
// ==========================================

// 首页：全站搜索
function initHomeSearch() {
    const input = document.getElementById('globalSearchInput');
    const defaultContent = document.getElementById('homeDefaultContent');
    const searchResults = document.getElementById('globalSearchResults');

    if (!input || !defaultContent || !searchResults) return;

    input.addEventListener('input', function(e) {
        const keyword = e.target.value.trim().toLowerCase();

        // 没输入时，显示默认首页
        if (keyword === '') {
            defaultContent.style.display = 'block';
            searchResults.style.display = 'none';
            return;
        }

        // 有输入时，切换显示
        defaultContent.style.display = 'none';
        searchResults.style.display = 'block';

        // 搜索电影 (匹配标题或导演)
        const foundMovies = movieData.filter(item => 
            item.title.includes(keyword) || (item.director && item.director.includes(keyword))
        );
        renderCards(foundMovies, 'searchResultMovie', 'movie');

        // 搜索图书 (匹配标题或作者)
        const foundBooks = bookData.filter(item => 
            item.title.includes(keyword) || (item.author && item.author.includes(keyword))
        );
        renderCards(foundBooks, 'searchResultBook', 'book');
    });
}

// 频道页：局部搜索
function initLocalSearch(currentData, containerId, type) {
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

// 标签点击过滤
function initTags(currentData, containerId, type) {
    const tags = document.querySelectorAll('.tags span');
    tags.forEach(tag => {
        tag.onclick = function() {
            // 样式处理
            tags.forEach(t => { t.style.background = '#fff'; t.style.color = '#37a'; });
            this.style.background = '#00b51d';
            this.style.color = '#fff';

            const tagName = this.innerText;

            // 数据过滤
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
// 6. 详情页逻辑
// ==========================================

// 添加样式（用于评论动画）
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }`;
document.head.appendChild(styleSheet);

function initDetailPage() {
    const container = document.getElementById('detailContainer');
    if (!container) return; 

    // 获取 URL 参数 ?type=movie&id=1
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');

    // 确定要在哪个数组里找
    let dataSource = [];
    if (type === 'movie') dataSource = movieData;
    else if (type === 'book') dataSource = bookData;

    // 查找对应 ID 的数据
    const item = dataSource.find(d => d.id == id);

    if (!item) {
        container.innerHTML = "<h2 style='padding:40px'>未找到内容，请返回首页重试。</h2>";
        return;
    }

    // 根据类型显示不同的字段标签
    const typeLabel = type === 'movie' ? "导演" : "作者";
    const subInfo = type === 'movie' ? item.director : item.author;
    const tagsStr = item.tags ? item.tags.join(' / ') : '暂无';

    // 动态渲染 HTML
    container.innerHTML = `
        <h1 class="detail-title">${item.title} <span class="year">(${item.year})</span></h1>
        <div class="detail-flex">
            <div class="detail-poster"><img src="${item.img}" alt="${item.title}"></div>
            <div class="detail-info">
                <p><strong>${typeLabel}:</strong> ${subInfo}</p>
                <p><strong>类型:</strong> ${tagsStr}</p>
                <div class="detail-rating-block">
                    <span class="big-score">${item.rating}</span>
                    <div class="star-wrap">
                        <div class="stars" style="color:#e09015">★★★★★</div>
                        <div class="rating-count">102,345人评价</div>
                    </div>
                </div>
                <div class="detail-intro">
                    <h3>简介 · · · · · ·</h3>
                    <p>${item.desc}</p>
                </div>
            </div>
        </div>
    `;
    
    // 修改浏览器标题
    document.title = `${item.title} - Douban Lite`;
}

// 提交评论功能
function submitComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    const list = document.getElementById('commentList');

    if (!text) { 
        alert("请先输入评论内容！"); 
        return; 
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    
    const newItem = document.createElement('div');
    newItem.className = 'comment-item';
    newItem.style.animation = "fadeIn 0.5s"; // 应用动画
    
    newItem.innerHTML = `
        <span class="user" style="color:#37a;font-weight:bold;">我</span> 
        <span style="color:#999;font-size:12px;">${dateStr}</span>
        <p style="margin-top:5px;">${text}</p>
    `;
    
    // 插入到列表最前面
    list.prepend(newItem);
    input.value = '';
}

// ==========================================
// 7. 入口函数
// ==========================================

window.onload = function() {
    // 1. 处理登录页面的特殊逻辑
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault(); 
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            
            if (u === 'admin' && p === 'admin') { 
                alert("登录成功！"); 
                window.location.href = "index.html"; 
            } else { 
                alert("账号或密码错误"); 
            }
        }
        return; // 登录页不需要加载数据，直接返回
    }

    // 2. 其他页面加载数据
    loadData();
};
