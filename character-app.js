// character-app.js
// 主程式邏輯。一般更新資料時不需要改這個檔案。

// ===== RULE HELPERS =====
function findByName(arr, name){ return arr.find(x => x.name === name); }
function hasForcedBangs(length){ return !!length?.forceBangs; }
function hasForcedHairShape(length){ return !!length?.forceHairShape; }
function getForcedBangs(length){ return findByName(BANGS, length?.forceBangs); }
function getForcedHairShape(length){ return findByName(HAIR_SHAPES, length?.forceHairShape); }
function shapeRequiresHairLength(shape){ return !!shape?.requireHairLength; }
function getRequiredHairLength(shape){ return findByName(HAIR_LENGTHS, shape?.requireHairLength); }
function getHairShapePool(length){
  // 若髮長資料指定 forceHairShape，只允許該造型。
  if(hasForcedHairShape(length)) return HAIR_SHAPES.filter(s => s.name === length.forceHairShape);
  // 若髮型資料指定 requireHairLength，只有符合該髮長時才進入抽選池。
  if(length) return HAIR_SHAPES.filter(s => !s.requireHairLength || s.requireHairLength === length.name);
  return HAIR_SHAPES;
}

// 取得因鎖定而被排除的所有 id（鎖定某群內任一 id，整群其他 id 也排除）
function getExcludedByLock(){
  const excluded = new Set();
  for(const [groupId, ids] of Object.entries(EXCLUSIVE_GROUPS)){
    const anyLocked = ids.some(id => lockedSpecials.has(id));
    if(anyLocked){
      ids.forEach(id => excluded.add(id));
    }
  }
  return excluded;
}

// ===== STATE =====
// lockedSpecials: Map of index -> special object (for individual special locking)
const locked = {};
const lockedSpecials = new Map(); // key: special.id -> {id,icon,label,en,rarity,value}
let currentData = null;
let copyModel = 'ch';

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function weightedPick(arr){
  const total = arr.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let r = Math.random() * total;
  for(const item of arr){
    r -= (item.weight ?? 1);
    if(r <= 0) return item;
  }
  return arr[arr.length - 1];
}
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

function renderIcon(icon, className = 'trait-img-icon'){
  if(typeof icon === 'string' && /\.(png|jpg|jpeg|svg|webp)$/i.test(icon)){
    return `<img class="${className}" src="${icon}" alt="">`;
  }
  return icon;
}

function rarityBadge(r){
  if(!r) return '';
  const map={rare:['r-rare','RARE'],epic:['r-epic','EPIC'],legend:['r-legend','LEGEND']};
  const [cls,label]=map[r]||[];
  return cls?`<span class="rarity ${cls}">${label}</span>`:'';
}


// 挑染：顏色純隨機，與主髮色無關，不連動鎖定
function genStreak(){
  const c = pick(DYNA_COLORS);
  const templates = [
    {zh:`前髮挑${c.zh}色`,en:`${c.en} highlight on front strands`},
    {zh:`側邊單束${c.zh}色挑染`,en:`single side streak in ${c.en}`},
    {zh:`局部${c.zh}色挑染`,en:`scattered ${c.en} streaks`},
    {zh:`瀏海${c.zh}色挑染`,en:`${c.en} highlight on bangs`},
    {zh:`髮根${c.zh}色挑染`,en:`${c.en} highlight at roots`},
    {zh:`髮尾挑${c.zh}色`,en:`${c.en} highlight at tips`},
    {zh:`隱藏底層${c.zh}色染（翻起可見）`,en:`hidden ${c.en} underlayer dye (visible when flipped)`},
  ];
  return pick(templates);
}

// 漸層：以主髮色為起點，隨機搭配終點色，連動鎖定主髮色
function genGradient(primaryHair){
  const c = pick(DYNA_COLORS);
  const templates = [
    {zh:`髮尾漸層（${primaryHair.name}→${c.zh}）`,en:`gradient tips (${primaryHair.en} → ${c.en})`},
    {zh:`全髮漸層（${primaryHair.name}→${c.zh}）`,en:`full gradient (${primaryHair.en} → ${c.en})`},
    {zh:`髮根漸層（${primaryHair.name}→${c.zh}）`,en:`root-to-tip gradient (${primaryHair.en} → ${c.en})`},
    {zh:`雙色分區染（${primaryHair.name}＋${c.zh}）`,en:`two-tone split dye (${primaryHair.en} + ${c.en})`},
    {zh:`彩虹漸層（${primaryHair.name}起）`,en:`rainbow gradient starting from ${primaryHair.en}`},
  ];
  return pick(templates);
}
function genHeterochromia(primaryEye){
  const other = EYE_COLORS.filter(e=>e.name!==primaryEye.name);
  const second = pick(other);
  const templates = [
    {zh:`左${primaryEye.name}，右${second.name}`,en:`left ${primaryEye.en}, right ${second.en}`},
    {zh:`右${primaryEye.name}，左${second.name}`,en:`right ${primaryEye.en}, left ${second.en}`},
    {zh:`${primaryEye.name}底色，${second.name}外圈`,en:`${primaryEye.en} inner iris, ${second.en} outer ring`},
    {zh:`${primaryEye.name}底色，${second.name}瞳孔中心`,en:`${primaryEye.en} iris, ${second.en} pupil center`},
  ];
  return pick(templates);
}

// ===== GENERATE =====
function generate(){
  const btn=document.getElementById('genBtn');
  btn.classList.add('rolling');
  setTimeout(()=>btn.classList.remove('rolling'),400);

  const prev=currentData?{...currentData}:{};
  const d={};

  d.hair       = locked.hair       || pick(HAIR_COLORS);
  d.hairLength = locked.hairLength || weightedPick(HAIR_LENGTHS);

  // 若髮型鎖定為鯊魚夾，髮長強制長髮；若髮長鎖定為非長髮，鯊魚夾不會被抽中。
  if(shapeRequiresHairLength(locked.hairShape)){
    d.hairLength = getRequiredHairLength(locked.hairShape) || d.hairLength;
  }
  d.hairShape = locked.hairShape || pick(getHairShapePool(d.hairLength));
  if(shapeRequiresHairLength(d.hairShape)){
    d.hairLength = getRequiredHairLength(d.hairShape) || d.hairLength;
  }

  if(hasForcedHairShape(d.hairLength)){
    d.hairShape = getForcedHairShape(d.hairLength) || d.hairShape;
  }
  if(hasForcedBangs(d.hairLength)){
    d.bangs = getForcedBangs(d.hairLength) || pick(BANGS);
    (d.hairLength.forbidSpecialIds || []).forEach(id => {
      if(id === 'gradient' && lockedSpecials.has('gradient')) delete locked.hair;
      lockedSpecials.delete(id);
    });
  } else {
    d.bangs = locked.bangs || pick(BANGS);
  }
  d.eye      = locked.eye       || pick(EYE_COLORS);
  d.eyeType  = locked.eyeType   || pick(EYE_TYPES);
  d.earType  = locked.earType   || pick(EAR_TYPES);
  d.skin     = locked.skin      || pick(SKIN_TONES);

  // Build specials: start from locked ones, fill rest from pool
  const lockedIds = new Set(lockedSpecials.keys());
  const lockedList = [...lockedSpecials.values()];
  const excludedIds = getExcludedByLock(); // 人體工學互斥排除

  // How many new specials to generate（無上限：從 SPECIAL_COUNTS 抽，但不限總數）
  const totalCount = pick(SPECIAL_COUNTS);
  const newCount = Math.max(0, totalCount - lockedList.length);

  // Pool: exclude locked IDs + 互斥群 IDs；寸頭／刺蝟頭不會出現挑染/漸層
  const forbiddenByHair = new Set(d.hairLength?.forbidSpecialIds || []);
  const availablePool = shuffle(SPECIAL_POOL.filter(t => !lockedIds.has(t.id) && !excludedIds.has(t.id) && !forbiddenByHair.has(t.id)));
  const newSpecials = availablePool.slice(0, newCount).map(t => {
    if(t.id === 'heterochromia'){
      const val = genHeterochromia(d.eye);
      return {...t, value: val};
    }
    if(t.id === 'gradient'){
      const val = genGradient(d.hair);
      return {...t, value: val};
    }
    if(t.id === 'streak'){
      const val = genStreak();
      return {...t, value: val};
    }
    const val = pick(t.values);
    return {...t, value: val};
  });

  d.specials = [...lockedList, ...newSpecials];

  currentData=d;
  render(d,prev);
  document.getElementById('copyBtn').style.display='block';
}

// ===== RENDER =====
function render(d, prev){
  const main=document.getElementById('mainContent');
  const baseTraits=[
    {key:'hair',icon:UI_ICONS.hair,label:'髮色',val:`<span class="color-pip" style="background:${d.hair.hex}"></span>${d.hair.name}${d.hair.sub?' ・ '+d.hair.sub:''}`},
    {key:'hairLength',icon:UI_ICONS.hairLength,label:'髮長',val:d.hairLength.name},
    {key:'hairShape',icon:UI_ICONS.hairShape,label:'髮型',val:d.hairShape.name},
    {key:'bangs',icon:UI_ICONS.bangs,label:'瀏海',val:d.bangs.name},
    {key:'eye',icon:UI_ICONS.eye, label:'瞳色',val:`<span class="color-pip" style="background:${d.eye.hex}"></span>${d.eye.name}`},
    {key:'eyeType',icon:UI_ICONS.eyeType,label:'眼型',val:d.eyeType.name},
    {key:'earType',icon:UI_ICONS.earType,label:'耳型',val:d.earType.name},
    {key:'skin',icon:UI_ICONS.skin, label:'膚色',val:`<span class="color-pip" style="background:${d.skin.hex}"></span>${d.skin.name}`},
  ];

  let html='<div class="results-grid">';
  baseTraits.forEach(t=>{
    const isLocked=locked[t.key]!==undefined;
    const changed=!isLocked&&prev[t.key]&&JSON.stringify(prev[t.key])!==JSON.stringify(d[t.key]);
    // 主瞳色被異色瞳連動鎖定時，鎖頭禁用
    const eyeLockedByHetero = t.key==='eye' && hasLockedHeterochromia();
    // 主髮色被漸層連動鎖定時，鎖頭禁用（挑染不連動）
    const hairLockedByGradient = t.key==='hair' && hasLockedGradient();
    // 寸頭／刺蝟頭強制無瀏海、無特殊髮型，避免鎖定狀態造成衝突
    const lockedByHairLengthRule = ((hasForcedBangs(d.hairLength) && t.key==='bangs') || (hasForcedHairShape(d.hairLength) && t.key==='hairShape'));
    // 鯊魚夾強制長髮，但不限制瀏海。
    const lockedByHairShapeRule = shapeRequiresHairLength(d.hairShape) && t.key==='hairLength';
    const isDisabled = eyeLockedByHetero || hairLockedByGradient || lockedByHairLengthRule || lockedByHairShapeRule;
    const lockTitle = eyeLockedByHetero ? '由異色瞳鎖定，請從特殊外觀解鎖'
                    : hairLockedByGradient ? '由漸層染鎖定，請從特殊外觀解鎖'
                    : lockedByHairLengthRule ? '此髮長會固定部分髮型／瀏海規則'
                    : lockedByHairShapeRule ? '此髮型會固定需要的髮長，瀏海不受限制'
                    : (isLocked?'解除鎖定':'鎖定此項');
    const lockIcon = isLocked ? `<img class="lock-img" src="${UI_ICONS.lock}" alt="locked">` : `<img class="lock-img" src="${UI_ICONS.unlock}" alt="unlock">`;
    const lockDisabled = isDisabled ? 'style="opacity:0.4;cursor:not-allowed"' : '';
    const lockOnClick = isDisabled
      ? `showToast('${lockTitle}')`
      : `toggleLock('${t.key}')`;
    html+=`<div class="trait-card ${isLocked?'locked':''} ${changed?'just-changed':''}" id="card-${t.key}">
      <div class="trait-icon">${renderIcon(t.icon, 'trait-img-icon')}</div>
      <div class="trait-info">
        <div class="trait-label">${t.label}</div>
        <div class="trait-value">${t.val}</div>
      </div>
      <button class="lock-btn" onclick="${lockOnClick}" title="${lockTitle}" ${lockDisabled}>${lockIcon}</button>
    </div>`;
  });
  html+='</div>';

  // Specials section — individual lock per row
  html+=`<div class="specials-section">
    <div class="specials-header">
      <span class="specials-title"><img class="title-img" src="${UI_ICONS.special}" alt=""> 特殊外觀</span>
      <span style="font-family:'Iansui','Space Mono',monospace;font-size:10px;color:var(--muted)">${d.specials.length} 項特徵 · 逐條鎖定</span>
    </div>
    <div class="specials-body">`;

  if(d.specials.length===0){
    html+=`<div class="no-specials">本次無特殊外觀（再次生成可能出現）</div>`;
  } else {
    d.specials.forEach(s=>{
      const isLocked = lockedSpecials.has(s.id);
      const valZh = s.value?.zh ?? s.value;
      html+=`<div class="special-row ${isLocked?'locked':''}">
        <div class="special-row-icon">${renderIcon(s.icon, 'special-img-icon')}</div>
        <div class="special-row-info">
          <div class="special-row-label">${s.label}</div>
          <div class="special-row-value">${valZh} ${rarityBadge(s.rarity)}</div>
        </div>
        <button class="spec-lock-btn ${isLocked?'on':''}" onclick="toggleSpecialLock('${s.id}')">${isLocked?`<img class="lock-img" src="${UI_ICONS.lock}" alt="locked">`:`<img class="lock-img" src="${UI_ICONS.unlock}" alt="unlock">`}</button>
      </div>`;
    });
  }
  html+=`</div></div>`;
  main.innerHTML=html;
}

// ===== LOCK TOGGLES =====
function hasLockedHeterochromia(){ return lockedSpecials.has('heterochromia'); }
function hasLockedGradient(){ return lockedSpecials.has('gradient'); }

function toggleLock(key){
  if(!currentData) return;
  // 主瞳色被異色瞳鎖定時不允許單獨操作
  if(key==='eye' && hasLockedHeterochromia()) return;
  // 主髮色被漸層鎖定時不允許單獨操作（挑染不連動）
  if(key==='hair' && hasLockedGradient()) return;
  // 寸頭／刺蝟頭時瀏海與造型由髮長強制決定
  if((hasForcedBangs(currentData.hairLength) && key==='bangs') || (hasForcedHairShape(currentData.hairLength) && key==='hairShape')) return;
  // 鯊魚夾時髮長由髮型強制決定，但瀏海仍可自由鎖定。
  if(shapeRequiresHairLength(currentData.hairShape) && key==='hairLength') return;
  if(locked[key]!==undefined){ delete locked[key]; }
  else { locked[key]=currentData[key]; }
  if(key==='hairLength' && locked.hairLength){
    if(hasForcedBangs(locked.hairLength)) delete locked.bangs;
    if(hasForcedHairShape(locked.hairLength)) delete locked.hairShape;
    (locked.hairLength.forbidSpecialIds || []).forEach(id => {
      if(id === 'gradient') delete locked.hair;
      lockedSpecials.delete(id);
    });
  }
  render(currentData,{});
}

function toggleSpecialLock(id){
  if(!currentData) return;
  if(lockedSpecials.has(id)){
    lockedSpecials.delete(id);
    if(id==='heterochromia'){ delete locked.eye; }
    if(id==='gradient'){ delete locked.hair; }
  } else {
    if((currentData.hairLength?.forbidSpecialIds || []).includes(id)) return;
    const s = currentData.specials.find(x=>x.id===id);
    if(s){
      lockedSpecials.set(id, s);
      if(id==='heterochromia'){ locked.eye = currentData.eye; }
      if(id==='gradient'){ locked.hair = currentData.hair; }
    }
  }
  render(currentData,{});
}

// ===== COPY MODAL =====
function openCopyModal(){
  if(!currentData) return;
  copyModalLang='zh';
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.id='copyOverlay';
  overlay.innerHTML=`
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title"><img class="title-img" src="${UI_ICONS.copy}" alt=""> 複製人設文字</span>
        <button class="modal-close" onclick="closeCopyModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="lang-tabs">
          <button class="lang-tab active" id="tab-zh" onclick="switchLang('zh')">中文</button>
          <button class="lang-tab" id="tab-en" onclick="switchLang('en')">英文</button>
          <button class="lang-tab" id="tab-both" onclick="switchLang('both')">中＋英</button>
        </div>
        <div class="preview-box" id="previewBox"></div>
        <button class="modal-copy-btn" onclick="doModalCopy()">複製到剪貼簿</button>
        <button class="modal-line-btn" id="lineShareBtn" onclick="doLineShare()">分享到 LINE</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) closeCopyModal(); });
  updatePreview();
  // 顯示分享鈕：只要在 LINE 內就顯示（能不能分享按下去再判斷，避免 isApiAvailable 誤判而藏鈕）
  try{
    if(typeof liff!=='undefined' && liff.isInClient && liff.isInClient()){
      const lb=document.getElementById('lineShareBtn');
      if(lb) lb.style.display='block';
    }
  }catch(e){ /* 非 LINE 環境，維持隱藏 */ }
}

function closeCopyModal(){
  const el=document.getElementById('copyOverlay');
  if(el) el.remove();
}

function switchLang(lang){
  copyModalLang=lang;
  document.querySelectorAll('.lang-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+lang)?.classList.add('active');
  updatePreview();
}

function buildText(lang){
  const d=currentData;
  const parts=[];
  const hairName = lang==='en'?d.hair.en : d.hair.name+(d.hair.sub?'（'+d.hair.sub+'）':'');
  const hairLength = lang==='en'?d.hairLength.en:d.hairLength.name;
  const hairShape = lang==='en'?d.hairShape.en:d.hairShape.name;
  const bangs = lang==='en'?d.bangs.en:d.bangs.name;
  const eye = lang==='en'?d.eye.en:d.eye.name;
  const eyeType = lang==='en'?d.eyeType.en:d.eyeType.name;
  const earType = lang==='en'?d.earType.en:d.earType.name;
  const skin = lang==='en'?d.skin.en:d.skin.name;

  // 若有異色瞳特殊條件，主瞳色由異色瞳描述取代
  const hasHetero = d.specials.some(s=>s.id==='heterochromia');

  if(lang==='en'){
    parts.push(`${hairName} hair color`);
    parts.push(hairLength);
    if(d.hairShape.name !== '無特殊造型') parts.push(hairShape);
    parts.push(bangs);
    if(!hasHetero) parts.push(`${eye} eyes`);
    parts.push(eyeType);
    if(d.earType.name !== '正常耳') parts.push(earType);
    parts.push(`${skin} skin`);
    d.specials.forEach(s=>{
      const val=s.value?.en??s.value;
      if(s.id==='heterochromia'){
        parts.push(`heterochromia (${val})`);
      } else {
        parts.push(val);
      }
    });
    return parts.join(', ');
  } else {
    parts.push(hairName+'髮色');
    parts.push(hairLength);
    if(d.hairShape.name !== '無特殊造型') parts.push(hairShape);
    parts.push(bangs);
    if(!hasHetero) parts.push(eye+'瞳色');
    parts.push(eyeType);
    if(d.earType.name !== '正常耳') parts.push(earType);
    parts.push(skin+'膚色');
    d.specials.forEach(s=>{
      const val=s.value?.zh??s.value;
      if(s.id==='heterochromia'){
        parts.push('異色瞳（'+val+'）');
      } else {
        parts.push(val);
      }
    });
    return parts.join('，');
  }
}

function updatePreview(){
  const box=document.getElementById('previewBox');
  if(!box) return;
  let text='';
  if(copyModalLang==='both'){
    text=buildText('zh')+'\n\n'+buildText('en');
  } else {
    text=buildText(copyModalLang);
  }
  box.textContent=text;
}

function doModalCopy(){
  let text='';
  if(copyModalLang==='both'){
    text=buildText('zh')+'\n\n'+buildText('en');
  } else {
    text=buildText(copyModalLang);
  }
  // 先存暫存區，跟複製成敗脫鉤（LINE 內嵌瀏覽器 clipboard 常失敗，之前因此漏存）
  saveToStash();
  const markCopied=()=>{
    const btn=document.querySelector('.modal-copy-btn');
    if(btn){
      btn.innerHTML=`<img class="title-img" src="${UI_ICONS.success}" alt=""> 已複製！`;
      setTimeout(()=>{btn.textContent='複製到剪貼簿';},2000);
    }
  };
  // 嘗試現代 clipboard API；失敗則用 execCommand 備援
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(markCopied).catch(()=>fallbackCopy(text,markCopied));
  } else {
    fallbackCopy(text, markCopied);
  }
}

function fallbackCopy(text, onDone){
  try{
    const ta=document.createElement('textarea');
    ta.value=text;
    ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if(onDone) onDone();
  }catch(e){ console.warn('複製失敗（已存暫存）：', e); }
}

// ===== LIFF 分享（只有在 LINE 裡才會被觸發）=====
// 若分享鈕的彈窗在 LIFF 就緒前就被開過，這個函式可補顯示（由 load 流程呼叫）
function showLineShareButton(){
  const lb=document.getElementById('lineShareBtn');
  if(lb) lb.style.display='block';
}

function doLineShare(){
  // 沿用彈窗目前選的語言，產出跟「複製」一樣的文字
  let text='';
  if(copyModalLang==='both'){
    text=buildText('zh')+'\n\n'+buildText('en');
  } else {
    text=buildText(copyModalLang);
  }
  try{
    if(typeof liff==='undefined' || !liff.shareTargetPicker){
      alert('分享功能僅在 LINE 內可用');
      return;
    }
    saveToStash(); // 分享前先存暫存，與分享成敗脫鉤
    liff.shareTargetPicker([{ type:'text', text }])
      .then(()=>{
        const btn=document.getElementById('lineShareBtn');
        if(btn){ btn.textContent='已開啟分享！'; setTimeout(()=>{btn.textContent='分享到 LINE';},2000); }
      })
      .catch(err=>{ console.warn('分享取消或失敗：', err); });
  }catch(e){
    console.warn('shareTargetPicker 失敗：', e);
  }
}
let stashList = []; // [{zh, en, time}]

function saveToStash(){
  const zh = buildText('zh');
  const en = buildText('en');

  // Duplicate detection: if identical zh+en already exists, show toast and abort
  const isDupe = stashList.some(s => s.zh === zh && s.en === en);
  if(isDupe){
    showToast('此人設已在佔存區中');
    return;
  }

  const now = new Date();
  const time = now.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'});
  const entry = {zh, en, time};

  if(stashList.length >= MAX_STASH){
    openDeleteModal(entry);
    return;
  }
  stashList.push(entry);
  renderStash();
}

function showToast(msg){
  const existing = document.getElementById('stashToast');
  if(existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'stashToast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
    background:#1a1a2e; border:1px solid var(--accent2); color:var(--accent2);
    font-family:'Iansui','Space Mono',monospace; font-size:11px; letter-spacing:1px;
    padding:10px 20px; border-radius:10px; z-index:9999;
    animation: fadeIn 0.2s ease; white-space:nowrap;
    box-shadow: 0 4px 20px rgba(244,114,182,0.2);
  `;
  document.body.appendChild(toast);
  setTimeout(()=>{ toast.style.opacity='0'; toast.style.transition='opacity 0.3s'; setTimeout(()=>toast.remove(),300); }, 2200);
}

function renderStash(){
  const count = document.getElementById('stashCount');
  const empty = document.getElementById('stashEmpty');
  const list  = document.getElementById('stashList');
  if(!count) return;
  count.textContent = stashList.length + ' / ' + MAX_STASH;
  if(stashList.length === 0){
    empty.style.display = 'block';
    list.style.display  = 'none';
    return;
  }
  empty.style.display = 'none';
  list.style.display  = 'flex';
  list.innerHTML = stashList.map((s,i) => `
    <div class="stash-card">
      <div class="stash-card-num">#${i+1}</div>
      <div class="stash-card-body">
        <div class="stash-card-zh">${s.zh}</div>
        <div class="stash-card-en">${s.en}</div>
        <div class="stash-card-time">${s.time}</div>
      </div>
      <button class="stash-del-btn" onclick="deleteStash(${i})" title="刪除"><img class="del-img" src="${UI_ICONS.garbage}" alt="刪除"></button>
    </div>`).join('');
}

function deleteStash(idx){
  stashList.splice(idx,1);
  renderStash();
}

// Module-level variable to hold pending stash entry while delete modal is open
let _pendingStashEntry = null;

// Called when already at 5, asking user to delete one before adding new
function openDeleteModal(pendingEntry){
  _pendingStashEntry = pendingEntry; // store at module level, not on DOM element

  const itemsHtml = stashList.map((s,i) => `
    <div class="del-modal-item" onclick="confirmDelete(${i})">
      <span class="del-modal-item-num">#${i+1}</span>
      <span class="del-modal-item-text">${s.zh}</span>
      <span class="del-modal-item-x"><img class="del-img" src="${UI_ICONS.garbage}" alt="刪除"></span>
    </div>`).join('');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'delOverlay';
  overlay.innerHTML = `
    <div class="modal del-modal">
      <div class="modal-header">
        <span class="modal-title"><img class="title-img" src="${UI_ICONS.warning}" alt="警告"> 暫存區已滿</span>
        <button class="modal-close" onclick="closeDeleteModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="del-modal-hint" style="margin-bottom:14px">請選擇一筆刪除，以儲存新的人設</div>
        <div class="del-modal-list">${itemsHtml}</div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) closeDeleteModal(); });
}

function closeDeleteModal(){
  const el = document.getElementById('delOverlay');
  if(el) el.remove();
  _pendingStashEntry = null;
}

function confirmDelete(idx){
  stashList.splice(idx, 1);
  if(_pendingStashEntry){
    stashList.push(_pendingStashEntry);
    _pendingStashEntry = null;
    renderStash();
    closeDeleteModal();
    showToast('替換完成，新人設已儲存至暫存區');
  } else {
    renderStash();
    closeDeleteModal();
  }
}
