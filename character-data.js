// character-data.js
// 只放資料與可調整設定。日後新增／修改選項，優先改這個檔案；主程式 character-app.js 不必動。
// 可用規則欄位：
// - HAIR_LENGTHS: weight, forceBangs, forceHairShape, forbidSpecialIds
// - HAIR_SHAPES: requireHairLength

const UI_ICONS = {
  hair: './assets/icons/hair_color.png',
  hairLength: './assets/icons/hair_length.png',
  hairShape: './assets/icons/hair_shape.png',
  bangs: './assets/icons/bangs.png',
  eye: './assets/icons/eye_color.png',
  eyeType: './assets/icons/eye_type.png',
  skin: './assets/icons/skin.png',
  streak_gradient: './assets/icons/hairdye.png',
  tattoo: './assets/icons/tattoo.png',
  mole: './assets/icons/mole.png',
  heterochromia: './assets/icons/heterochromia.png',
  scar: './assets/icons/scar.png',
  freckles: './assets/icons/freckles.png',
  fang: './assets/icons/fang.png',
  marking: './assets/icons/marking.png',
  pupil: './assets/icons/pupil.png',
  horn: './assets/icons/horn.png',
  beast_ears: './assets/icons/beast_ears.png',
  tail: './assets/icons/tail.png',
  wings: './assets/icons/wings.png',
  glow: './assets/icons/glow.png',
  accessory: './assets/icons/accessory.png',
  beard: './assets/icons/beard.png',
  lock: './assets/icons/lock.png',
  unlock: './assets/icons/unlock.png',  
  pin: './assets/icons/pin.png',
  copy: './assets/icons/copy.png',
  dice: './assets/icons/dice.png',
  special: './assets/icons/special.png',
  success: './assets/icons/success.png',
  warning: './assets/icons/warning.png',
  garbage: './assets/icons/garbage.png'
};

// ===== DATA =====
const HAIR_COLORS = [
  {name:'純黑',hex:'#1a1a1a',en:'jet black'},{name:'深墨黑',hex:'#0d0d14',en:'ink black'},
  {name:'深棕',hex:'#3d2b1f',en:'dark brown'},{name:'暖棕',hex:'#7a4f30',en:'warm brown'},
  {name:'金棕',hex:'#b8834a',en:'golden brown'},{name:'金髮',hex:'#e8c044',en:'blonde'},
  {name:'亞麻金',hex:'#d4b896',en:'flaxen'},{name:'銀灰',hex:'#a8a8b8',en:'silver gray'},
  {name:'珍珠白',hex:'#eeeeee',en:'pearl white'},{name:'鐵灰',hex:'#606070',en:'steel gray'},
  {name:'酒紅',hex:'#8b1a2a',en:'wine red'},{name:'橙紅',hex:'#c8552a',en:'auburn'},
  {name:'玫瑰粉',hex:'#e890b4',en:'rose pink'},{name:'嬰兒粉',hex:'#f4c0d4',en:'baby pink'},
  {name:'薰衣草紫',hex:'#9b72d8',en:'lavender purple'},{name:'深紫',hex:'#5b2d9a',en:'deep violet'},
  {name:'寶藍',hex:'#2a5fd4',en:'sapphire blue'},{name:'天藍',hex:'#6aaee8',en:'sky blue'},
  {name:'翡翠綠',hex:'#2eb87a',en:'emerald green'},{name:'草綠',hex:'#78c840',en:'grass green'},
  {name:'炭黑',hex:'#1a1a1a',en:'charcoal black'},
  {name:'半黑半白',hex:'#888888',en:'split dye (half black, half white)'},
];
const EYE_COLORS = [
  {name:'純黑',hex:'#10101e',en:'pitch black'},{name:'深棕',hex:'#4a2c1a',en:'dark brown'},
  {name:'琥珀棕',hex:'#b87828',en:'amber'},{name:'蜂蜜金',hex:'#d4a820',en:'honey gold'},
  {name:'翡翠綠',hex:'#20a860',en:'emerald green'},{name:'草綠',hex:'#68b440',en:'grass green'},
  {name:'寶藍',hex:'#1868d4',en:'sapphire blue'},{name:'天藍',hex:'#60a8e0',en:'sky blue'},
  {name:'冰藍',hex:'#a8d4f0',en:'ice blue'},{name:'薰衣草紫',hex:'#9468d0',en:'lavender'},
  {name:'深紫',hex:'#5a2490',en:'deep violet'},{name:'玫瑰紅',hex:'#c83058',en:'rose red'},
  {name:'緋紅',hex:'#e04040',en:'crimson'},{name:'粉紅',hex:'#f090b8',en:'pink'},
  {name:'銀灰',hex:'#b0b0c8',en:'silver gray'},{name:'月白',hex:'#d8e8f4',en:'moonlight white'},
  {name:'琥珀橙',hex:'#e07030',en:'amber orange'},{name:'金色',hex:'#e8c040',en:'golden'},
];
// 髮型拆分：長度與造型各自獨立（由原 HAIR_STYLES 拆出，不額外增減概念）
const HAIR_LENGTHS = [
  // weight 用來控制出現率；超短髮因限制較多，權重較低，避免頻繁出現。
  {name:'寸頭',en:'buzz cut', weight:0.35, forceBangs:'無瀏海', forceHairShape:'無特殊造型', forbidSpecialIds:['streak','gradient']},
  {name:'刺蝟頭',en:'short spiky hair', weight:0.35, forceBangs:'無瀏海', forceHairShape:'無特殊造型', forbidSpecialIds:['streak','gradient']},
  {name:'短髮',en:'short hair', weight:1.4},
  {name:'鎖骨中長髮',en:'collarbone-length hair', weight:1.5},
  {name:'長髮',en:'long hair', weight:1.5},
];
const HAIR_SHAPES = [
  {name:'無特殊造型',en:'no special styling'},
  {name:'鮑伯',en:'bob'},
  {name:'側分',en:'side-parted'},
  {name:'狼尾',en:'wolf cut'},
  {name:'內彎',en:'inward curl'},
  {name:'外捲',en:'outward curl'},
  {name:'半扎',en:'half-up'},
  {name:'直髮',en:'straight'},
  {name:'捲髮',en:'wavy'},
  {name:'麻花辮',en:'braided'},
  {name:'雙馬尾',en:'twin tails'},
  {name:'高單馬尾',en:'high ponytail'},
  {name:'低側馬尾',en:'low side ponytail'},
  {name:'包包頭',en:'bun'},
  {name:'雙邊包包頭',en:'double buns'},
  {name:'鯊魚夾抓髮',en:'claw clip updo', requireHairLength:'長髮'},
  {name:'公主捲',en:'princess curls'},
  {name:'雙辮子',en:'double braids'},
  {name:'雙馬尾花苞燈籠辮子',en:'twin ponytail bubble braids with flower-bud shaped sections'},
];

const BANGS = [
  {name:'無瀏海',en:'no bangs'},{name:'空氣瀏海',en:'blunt bangs'},
  {name:'齊瀏海',en:'straight-cut bangs'},{name:'斜瀏海',en:'side-swept bangs'},
  {name:'眉上瀏海',en:'above-brow bangs'},{name:'公主切',en:'hime-cut bangs'},
  {name:'中分瀏海',en:'center-parted bangs'},{name:'鋸齒瀏海',en:'wispy textured bangs'},
  {name:'遮眼長瀏海',en:'eye-covering long bangs'},{name:'捲瀏海',en:'curled bangs'},
  {name:'後梳瀏海',en:'slicked back bangs'},
];
const EYE_TYPES = [
  {name:'大圓眼',en:'large round eyes'},{name:'杏仁眼',en:'almond-shaped eyes'},
  {name:'丹鳳眼',en:'upturned monolid eyes'},{name:'貓眼（外眼角上揚）',en:'cat eyes'},
  {name:'下垂眼（帶憂鬱感）',en:'droopy eyes'},{name:'細長眼',en:'narrow eyes'},
  {name:'單眼皮小眼',en:'monolid eyes'},{name:'雙眼皮大眼',en:'double-lidded wide eyes'},
  {name:'深邃歐式眼',en:'deep-set eyes'},
];
const SKIN_TONES = [
  {name:'透瓷白',hex:'#fae8e0',en:'porcelain white'},{name:'奶油象牙',hex:'#f5e0c8',en:'ivory cream'},
  {name:'自然米白',hex:'#ecd0b0',en:'natural beige'},{name:'小麥黃',hex:'#d4a870',en:'wheat'},
  {name:'蜂蜜色',hex:'#c89050',en:'honey'},{name:'古銅棕',hex:'#a07040',en:'bronze'},
  {name:'深棕',hex:'#784830',en:'deep brown'},
];

const SPECIAL_POOL = [
  {id:'streak',icon:UI_ICONS.streak_gradient,label:'挑染',en:'hair highlight',rarity:null,
   values:[
     {zh:'前髮挑色',en:'highlight on front strands'},
     {zh:'側邊單束挑色',en:'single side color streak'},
     {zh:'局部彩色挑染',en:'scattered color streaks'},
     {zh:'瀏海挑色',en:'color highlight on bangs'},
     {zh:'髮根挑色',en:'color highlight at roots'},
     {zh:'髮尾挑色',en:'color highlight at tips'},
   ],
   genDynamic: true, /* 顏色動態隨機，不依賴主髮色 */
  },
  {id:'gradient',icon:UI_ICONS.streak_gradient,label:'漸層染',en:'gradient dye',rarity:null,
   values:[] /* generated dynamically based on hair color */,
   genDynamic: true,
  },
  {id:'tattoo',icon:UI_ICONS.tattoo,label:'刺青',en:'tattoo',rarity:'rare',
   values:[
     {zh:'頸後刺青',en:'tattoo on the back of the neck'},
     {zh:'手臂半袖刺青',en:'half-sleeve arm tattoo'},
     {zh:'鎖骨刺青',en:'collarbone tattoo'},
     {zh:'手指刺青',en:'finger tattoo'},
     {zh:'腳踝刺青',en:'ankle tattoo'},
     {zh:'背部刺青',en:'back tattoo'},
     {zh:'胸口刺青',en:'tattoo on the chest'},
     {zh:'耳後刺青',en:'tattoo behind the ear'},
     {zh:'手腕刺青',en:'wrist tattoo'},
   ]},
  {id:'mole',icon:UI_ICONS.mole,label:'痣',en:'mole',rarity:null,
   values:[
     {zh:'眼角淚痣',en:'teardrop mole at the corner of the eye'},
     {zh:'嘴角一顆痣',en:'beauty mark near the lips'},
     {zh:'鎖骨痣',en:'mole on the collarbone'},
     {zh:'額頭正中痣',en:'forehead mole at the center'},
     {zh:'脖頸側面痣',en:'mole on the side of the neck'},
     {zh:'肩膀痣',en:'shoulder mole'},
     {zh:'嘴唇上方小痣',en:'small mole above the upper lip'},
   ]},
  {id:'heterochromia',icon:UI_ICONS.heterochromia,label:'異色瞳',en:'heterochromia',rarity:'epic',
   values:[] /* generated dynamically */},
  {id:'scar',icon:UI_ICONS.scar,label:'傷疤',en:'scar',rarity:'rare',
   values:[
     {zh:'眉頭傷疤',en:'scar through the eyebrow'},
     {zh:'臉頰傷疤',en:'scar on the cheek'},
     {zh:'嘴角傷疤',en:'scar at the corner of the mouth'},
     {zh:'下顎傷疤',en:'scar along the jawline'},
     {zh:'手臂傷疤',en:'scar on the arm'},
     {zh:'脖頸傷疤',en:'scar on the side of the neck'},
     {zh:'胸口傷疤',en:'scar on the chest'},
   ]},
  {id:'freckles',icon:UI_ICONS.freckles,label:'雀斑',en:'freckles',rarity:null,
   values:[
     {zh:'鼻樑淡雀斑',en:'faint freckles across the nose bridge'},
     {zh:'臉頰細密雀斑',en:'dense freckles on the cheeks'},
     {zh:'全臉曬斑',en:'sun freckles all over the face'},
     {zh:'眼睛周圍淡斑',en:'faint spots around the eyes'},
   ]},
  {id:'fang',icon:UI_ICONS.fang,label:'虎牙',en:'fang',rarity:null,
   values:[
     {zh:'左側虎牙',en:'left fang tooth'},
     {zh:'右側虎牙',en:'right fang tooth'},
     {zh:'雙虎牙',en:'double fangs'},
     {zh:'細長尖牙（全排）',en:'full row of sharp elongated teeth'},
   ]},
  {id:'beard',icon:UI_ICONS.beard,label:'鬍子',en:'facial hair',rarity:null,
   values:[
     {zh:'淡淡鬍渣',en:'faint stubble'},
     {zh:'短鬍渣',en:'short stubble'},
     {zh:'下巴短鬚',en:'short chin beard'},
     {zh:'山羊鬍',en:'goatee'},
     {zh:'八字鬍',en:'mustache'},
     {zh:'細修八字鬍',en:'neatly trimmed thin mustache'},
     {zh:'連鬢鬍',en:'sideburns'},
     {zh:'絡腮鬍',en:'full beard'},
     {zh:'修剪整齊的短鬍',en:'neatly trimmed short beard'},
     {zh:'下巴與上唇短鬍',en:'short beard on the chin and upper lip'},
     {zh:'稀疏凌亂鬍渣',en:'sparse messy stubble'},
     {zh:'長鬍子',en:'long beard'},
   ]},
  {id:'marking',icon:UI_ICONS.marking,label:'胎記/紋路',en:'birthmark / marking',rarity:'epic',
   values:[
     {zh:'心形胎記',en:'heart-shaped birthmark'},
     {zh:'星形胎記',en:'star-shaped birthmark'},
     {zh:'龍鱗紋路（側腹）',en:'dragon scale patterns along the waist'},
     {zh:'發光紋路（情緒觸發）',en:'glowing markings that activate with emotion'},
     {zh:'古代印記（額頭）',en:'ancient seal marking on the forehead'},
     {zh:'月牙胎記',en:'crescent-shaped birthmark'},
   ]},
  {id:'pupil',icon:UI_ICONS.pupil,label:'特殊瞳孔',en:'special pupil',rarity:'epic',
   values:[
     {zh:'十字形瞳孔',en:'cross-shaped pupils'},
     {zh:'星形瞳孔',en:'star-shaped pupils'},
     {zh:'縱瞳（貓型）',en:'vertical slit pupils (cat-like)'},
     {zh:'漩渦瞳',en:'swirling vortex pupils'},
     {zh:'花瓣紋瞳孔',en:'petal-patterned pupils'},
     {zh:'六芒星形',en:'hexagram-shaped pupils'},
   ]},
  {id:'horn',icon:UI_ICONS.horn,label:'角',en:'horns',rarity:'legend',
   values:[
     {zh:'小惡魔彎角',en:'small curved demon horns'},
     {zh:'鹿角（分叉）',en:'branching deer antlers'},
     {zh:'羊角（螺旋）',en:'spiral ram horns'},
     {zh:'獨角（額正中）',en:'single unicorn horn at the forehead'},
     {zh:'龍角（後仰）',en:'swept-back dragon horns'},
     {zh:'骨角（裸露骨質）',en:'exposed bone horns'},
   ]},
  {id:'beast_ears',icon:UI_ICONS.beast_ears,label:'獸耳',en:'beast ears',rarity:'legend',
   values:[
     {zh:'狐狸耳',en:'fox ears'},
     {zh:'貓耳',en:'cat ears'},
     {zh:'兔耳（長垂）',en:'long drooping bunny ears'},
     {zh:'狼耳',en:'wolf ears'},
     {zh:'惡魔蝙蝠耳',en:'demon bat ears'},
	 {zh:'熊耳',en:'bear ears'},
	 {zh:'犬耳',en:'dog ears'},
   ]},
  {id:'tail',icon:UI_ICONS.tail,label:'尾巴',en:'tail',rarity:'legend',
   values:[
     {zh:'蓬鬆狐狸尾',en:'fluffy fox tail'},
     {zh:'貓尾（捲曲）',en:'curling cat tail'},
     {zh:'惡魔尖刃尾',en:'barbed demon tail'},
     {zh:'龍尾（帶鱗）',en:'scaly dragon tail'},
     {zh:'多尾狐',en:'multi-tailed fox'},
   ]},
  {id:'wings',icon:UI_ICONS.wings,label:'翅膀',en:'wings',rarity:'legend',
   values:[
     {zh:'小天使羽翼',en:'small angel feathered wings'},
     {zh:'黑色墮天使翼',en:'black fallen angel wings'},
     {zh:'蝙蝠惡魔翼',en:'bat-like demon wings'},
     {zh:'透明昆蟲翼',en:'translucent insect wings'},
     {zh:'龍翼（帶膜）',en:'webbed dragon wings'},
   ]},
  {id:'glow',icon:UI_ICONS.glow,label:'發光/特效',en:'glow / special effect',rarity:'epic',
   values:[
     {zh:'眼睛發淡光（情緒觸發）',en:'eyes faintly glow when emotional'},
     {zh:'髮絲帶微光',en:'hair strands shimmer with a soft glow'},
     {zh:'皮膚偶爾微發光',en:'skin occasionally emits a faint luminescence'},
     {zh:'紋路發光（身體）',en:'body markings glow in the dark'},
     {zh:'情緒顯色（皮膚）',en:'skin shifts color with mood'},
     {zh:'呼氣帶光霧',en:'breath leaves a trail of glowing mist'},
   ]},
  {id:'accessory',icon:UI_ICONS.accessory,label:'配件',en:'accessory',rarity:null,
   values:[
     {zh:'細框圓眼鏡',en:'thin round glasses'},
     {zh:'半框眼鏡',en:'half-rim glasses'},
     {zh:'墨鏡（掛於領口）',en:'sunglasses hanging at the collar'},
     {zh:'細鏈耳環',en:'delicate chain earrings'},
     {zh:'大圈耳環',en:'oversized hoop earrings'},
     {zh:'耳骨夾',en:'ear cuff'},
     {zh:'項鍊（十字架）',en:'cross necklace'},
     {zh:'項鍊（星星吊墜）',en:'star pendant necklace'},
     {zh:'髮夾（一字夾排列）',en:'row of bobby pins'},
     {zh:'黑色頭帶',en:'black headband'},
     {zh:'蝴蝶結髮飾',en:'bow hair accessory'},
     {zh:'鼻環（細圈）',en:'thin nose ring'},
     {zh:'鼻釘',en:'nose stud'},
     {zh:'手腕細鏈',en:'delicate wrist chain'},
     {zh:'戒指（多枚）',en:'multiple rings'},
   ]},
];

const SPECIAL_COUNTS = [0,1,1,1,2,2,2,3,3,3,4,4,5];

// 人體工學互斥群：同群內若有任何一條被鎖定，整群從抽選池排除
// key = groupId, value = [特徵id陣列]
const EXCLUSIVE_GROUPS = {
  eye_special:  ['heterochromia','pupil'],   // 異色瞳 & 特殊瞳孔只能選一
  hair_dye:     ['streak','gradient'],        // 挑染 & 漸層只能選一
  horn:         ['horn'],                     // 角（單獨一群，鎖定即排除同群）
  beast_ears:   ['beast_ears'],               // 獸耳
  tail:         ['tail'],                     // 尾巴
  wings:        ['wings'],                    // 翅膀
};

// Shared color pool
const DYNA_COLORS = [
  {zh:'金',en:'gold'},{zh:'銀白',en:'silver white'},{zh:'粉',en:'pink'},
  {zh:'玫瑰紅',en:'rose red'},{zh:'天藍',en:'sky blue'},{zh:'冰藍',en:'ice blue'},
  {zh:'翡翠綠',en:'emerald green'},{zh:'紫',en:'violet'},{zh:'橙紅',en:'auburn'},
  {zh:'白',en:'white'},{zh:'炭灰',en:'charcoal gray'},{zh:'珠光',en:'pearl'},
];
