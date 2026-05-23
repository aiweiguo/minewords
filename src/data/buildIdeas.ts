import { BuildIdea, BuildIdeaCategory } from "@/types";

export const buildIdeas: BuildIdea[] = [
  {
    id: "tree-house",
    title: "Build a Tree House",
    titleCn: "建造一个树屋",
    category: "house",
    descriptionCn: "在大树上建一个小房间，加梯子和火把。",
    missionEn: [
      "Find a big tree.",
      "Build a small room in the leaves.",
      "Add a ladder.",
      "Put torches inside.",
    ],
    materials: [
      { english: "Wood", chinese: "木头" },
      { english: "Ladder", chinese: "梯子" },
      { english: "Torch", chinese: "火把" },
      { english: "Glass", chinese: "玻璃" },
    ],
    keywords: [
      { wordId: "tree", english: "tree", chinese: "树" },
      { wordId: "wood", english: "wood", chinese: "木头" },
      { wordId: "build", english: "build", chinese: "建造" },
      { wordId: "torch", english: "torch", chinese: "火把" },
    ],
    rewards: [
      { type: "resource", resource: "wood", amount: 10 },
      { type: "resource", resource: "emerald", amount: 2 },
      { type: "xp", xp: 15 },
    ],
    icon: "tree",
  },
  {
    id: "secret-base",
    title: "Build a Secret Base",
    titleCn: "建造秘密基地",
    category: "house",
    descriptionCn: "在地下或山洞里建一个隐藏基地，用门挡住入口。",
    missionEn: [
      "Dig into a hill or cave.",
      "Build a hidden room.",
      "Add a door.",
      "Place chests inside.",
    ],
    materials: [
      { english: "Stone", chinese: "石头" },
      { english: "Door", chinese: "门" },
      { english: "Chest", chinese: "箱子" },
      { english: "Torch", chinese: "火把" },
    ],
    keywords: [
      { wordId: "cave", english: "cave", chinese: "洞穴" },
      { wordId: "door", english: "door", chinese: "门" },
      { wordId: "chest", english: "chest", chinese: "箱子" },
      { wordId: "build", english: "build", chinese: "建造" },
    ],
    rewards: [
      { type: "resource", resource: "stone", amount: 8 },
      { type: "xp", xp: 20 },
    ],
    icon: "cave",
  },
  {
    id: "small-castle",
    title: "Build a Small Castle",
    titleCn: "建造小城堡",
    category: "house",
    descriptionCn: "用石头建一座小城堡，加高墙和瞭望台。",
    missionEn: [
      "Collect lots of stone.",
      "Build castle walls.",
      "Add a tower.",
      "Place torches on the walls.",
    ],
    materials: [
      { english: "Stone", chinese: "石头" },
      { english: "Torch", chinese: "火把" },
      { english: "Door", chinese: "门" },
    ],
    keywords: [
      { wordId: "stone", english: "stone", chinese: "石头" },
      { wordId: "build", english: "build", chinese: "建造" },
      { wordId: "fight", english: "fight", chinese: "战斗" },
    ],
    rewards: [
      { type: "resource", resource: "stone", amount: 15 },
      { type: "xp", xp: 25 },
    ],
    icon: "stone",
  },
  {
    id: "animal-farm",
    title: "Build an Animal Farm",
    titleCn: "建造动物农场",
    category: "farm",
    descriptionCn: "用栅栏围住猪、牛、羊，方便获得食物。",
    missionEn: [
      "Find pigs, cows, and sheep.",
      "Build fences around them.",
      "Add a gate.",
      "Feed the animals.",
    ],
    materials: [
      { english: "Fence", chinese: "栅栏" },
      { english: "Gate", chinese: "栅栏门" },
      { english: "Wheat", chinese: "小麦" },
    ],
    keywords: [
      { wordId: "pig", english: "pig", chinese: "猪" },
      { wordId: "cow", english: "cow", chinese: "牛" },
      { wordId: "sheep", english: "sheep", chinese: "羊" },
      { wordId: "beef", english: "beef", chinese: "牛肉" },
    ],
    rewards: [
      { type: "resource", resource: "wood", amount: 5 },
      { type: "resource", resource: "emerald", amount: 1 },
      { type: "xp", xp: 15 },
    ],
    icon: "pig",
  },
  {
    id: "carrot-farm",
    title: "Plant a Carrot Farm",
    titleCn: "种胡萝卜农场",
    category: "farm",
    descriptionCn: "用 hoe 耕地，种胡萝卜，做稳定食物来源。",
    missionEn: [
      "Craft a hoe.",
      "Till the soil near water.",
      "Plant carrots.",
      "Wait and harvest.",
    ],
    materials: [
      { english: "Hoe", chinese: "锄" },
      { english: "Carrot", chinese: "胡萝卜" },
      { english: "Water", chinese: "水" },
    ],
    keywords: [
      { wordId: "hoe", english: "hoe", chinese: "锄" },
      { wordId: "carrot", english: "carrot", chinese: "胡萝卜" },
      { wordId: "potato", english: "potato", chinese: "土豆" },
    ],
    rewards: [
      { type: "resource", resource: "wood", amount: 3 },
      { type: "xp", xp: 10 },
    ],
    icon: "carrot",
  },
  {
    id: "auto-door",
    title: "Redstone Automatic Door",
    titleCn: "红石自动门",
    category: "redstone",
    descriptionCn: "用按钮和红石做自动开关的门。",
    missionEn: [
      "Place a door.",
      "Connect redstone.",
      "Add a button.",
      "Press the button to open the door.",
    ],
    materials: [
      { english: "Door", chinese: "门" },
      { english: "Button", chinese: "按钮" },
      { english: "Redstone", chinese: "红石" },
    ],
    keywords: [
      { wordId: "door", english: "door", chinese: "门" },
      { wordId: "craft", english: "craft", chinese: "合成" },
    ],
    rewards: [
      { type: "resource", resource: "iron", amount: 2 },
      { type: "xp", xp: 20 },
    ],
    icon: "door",
  },
  {
    id: "button-light",
    title: "Button Light Switch",
    titleCn: "按钮灯开关",
    category: "redstone",
    descriptionCn: "一键开关红石灯或火把线路。",
    missionEn: [
      "Place a redstone lamp.",
      "Connect redstone dust.",
      "Add a button.",
      "Turn the light on and off.",
    ],
    materials: [
      { english: "Redstone Lamp", chinese: "红石灯" },
      { english: "Button", chinese: "按钮" },
      { english: "Redstone", chinese: "红石" },
    ],
    keywords: [
      { wordId: "torch", english: "torch", chinese: "火把" },
      { wordId: "craft", english: "craft", chinese: "合成" },
    ],
    rewards: [{ type: "xp", xp: 15 }],
    icon: "torch",
  },
  {
    id: "explore-cave",
    title: "Explore a Cave",
    titleCn: "探索洞穴",
    category: "adventure",
    descriptionCn: "带火把和镐进入洞穴，寻找煤炭和铁矿。",
    missionEn: [
      "Find a cave entrance.",
      "Place torches along the way.",
      "Mine coal and iron.",
      "Return safely.",
    ],
    materials: [
      { english: "Pickaxe", chinese: "镐" },
      { english: "Torch", chinese: "火把" },
      { english: "Sword", chinese: "剑" },
    ],
    keywords: [
      { wordId: "cave", english: "cave", chinese: "洞穴" },
      { wordId: "mine", english: "mine", chinese: "挖矿" },
      { wordId: "coal", english: "coal", chinese: "煤" },
      { wordId: "iron", english: "iron", chinese: "铁" },
    ],
    rewards: [
      { type: "resource", resource: "iron", amount: 2 },
      { type: "xp", xp: 20 },
    ],
    icon: "cave",
  },
  {
    id: "find-village-adventure",
    title: "Find a Village",
    titleCn: "寻找村庄",
    category: "adventure",
    descriptionCn: "向远方探索，找到村庄和村民。",
    missionEn: [
      "Walk in one direction.",
      "Look for houses.",
      "Find villagers.",
      "Trade if you have emeralds.",
    ],
    materials: [
      { english: "Food", chinese: "食物" },
      { english: "Bed", chinese: "床" },
    ],
    keywords: [
      { wordId: "village", english: "village", chinese: "村庄" },
      { wordId: "villager", english: "villager", chinese: "村民" },
      { wordId: "trade", english: "trade", chinese: "交易" },
    ],
    rewards: [
      { type: "resource", resource: "emerald", amount: 2 },
      { type: "xp", xp: 25 },
    ],
    icon: "village",
  },
  {
    id: "diamond-hunt",
    title: "Diamond Hunt",
    titleCn: "钻石探险",
    category: "adventure",
    descriptionCn: "去深层挖矿，寻找稀有钻石。",
    missionEn: [
      "Go deep underground.",
      "Use an iron pickaxe.",
      "Search near Y level -59.",
      "Bring diamonds home.",
    ],
    materials: [
      { english: "Iron Pickaxe", chinese: "铁镐" },
      { english: "Torch", chinese: "火把" },
      { english: "Food", chinese: "食物" },
    ],
    keywords: [
      { wordId: "diamond", english: "diamond", chinese: "钻石" },
      { wordId: "pickaxe", english: "pickaxe", chinese: "镐" },
      { wordId: "cave", english: "cave", chinese: "洞穴" },
    ],
    rewards: [
      { type: "resource", resource: "diamond", amount: 1 },
      { type: "xp", xp: 30 },
    ],
    icon: "diamond",
  },
  {
    id: "wolf-house",
    title: "Build a Wolf House",
    titleCn: "建造狼的小屋",
    category: "decoration",
    descriptionCn: "为你的狼建一个小窝，旁边放骨头和床。",
    missionEn: [
      "Tame a wolf with bones.",
      "Build a small dog house.",
      "Add a bed nearby.",
      "Let your wolf sit at home.",
    ],
    materials: [
      { english: "Wood", chinese: "木头" },
      { english: "Bone", chinese: "骨头" },
      { english: "Bed", chinese: "床" },
    ],
    keywords: [
      { wordId: "wolf", english: "wolf", chinese: "狼" },
      { wordId: "bed", english: "bed", chinese: "床" },
      { wordId: "build", english: "build", chinese: "建造" },
    ],
    rewards: [
      { type: "resource", resource: "wood", amount: 5 },
      { type: "xp", xp: 15 },
    ],
    icon: "wolf",
  },
  {
    id: "diamond-museum",
    title: "Build a Diamond Museum",
    titleCn: "建造钻石博物馆",
    category: "decoration",
    descriptionCn: "用玻璃和钻石块展示你的珍贵收藏。",
    missionEn: [
      "Collect glass and diamonds.",
      "Build a display room.",
      "Place diamond blocks inside.",
      "Add signs with English labels.",
    ],
    materials: [
      { english: "Glass", chinese: "玻璃" },
      { english: "Diamond", chinese: "钻石" },
      { english: "Torch", chinese: "火把" },
    ],
    keywords: [
      { wordId: "diamond", english: "diamond", chinese: "钻石" },
      { wordId: "glass", english: "glass", chinese: "玻璃" },
      { wordId: "build", english: "build", chinese: "建造" },
    ],
    rewards: [
      { type: "resource", resource: "emerald", amount: 3 },
      { type: "xp", xp: 30 },
    ],
    icon: "diamond",
  },
  {
    id: "library-room",
    title: "Build a Library",
    titleCn: "建造图书馆",
    category: "decoration",
    descriptionCn: "用书架和火把建一个安静的图书馆。",
    missionEn: [
      "Craft bookshelves.",
      "Build a book room.",
      "Add tables and torches.",
      "Read and learn English words.",
    ],
    materials: [
      { english: "Bookshelf", chinese: "书架" },
      { english: "Plank", chinese: "木板" },
      { english: "Torch", chinese: "火把" },
    ],
    keywords: [
      { wordId: "craft", english: "craft", chinese: "合成" },
      { wordId: "plank", english: "plank", chinese: "木板" },
      { wordId: "build", english: "build", chinese: "建造" },
    ],
    rewards: [{ type: "xp", xp: 20 }],
    icon: "plank",
  },
  {
    id: "underwater-house",
    title: "Build an Underwater House",
    titleCn: "建造海底屋",
    category: "house",
    descriptionCn: "用玻璃在海底建一个观察窗房间。",
    missionEn: [
      "Find water.",
      "Use glass for walls.",
      "Pump out water inside.",
      "Add doors and torches.",
    ],
    materials: [
      { english: "Glass", chinese: "玻璃" },
      { english: "Door", chinese: "门" },
      { english: "Torch", chinese: "火把" },
    ],
    keywords: [
      { wordId: "glass", english: "glass", chinese: "玻璃" },
      { wordId: "build", english: "build", chinese: "建造" },
    ],
    rewards: [
      { type: "resource", resource: "emerald", amount: 2 },
      { type: "xp", xp: 25 },
    ],
    icon: "glass",
  },
  {
    id: "survive-with-wood",
    title: "Survive with Wood Only",
    titleCn: "只用木头活过一天",
    category: "adventure",
    descriptionCn: "挑战：一天内只用木头相关工具生存。",
    missionEn: [
      "Use only wooden tools.",
      "Collect food.",
      "Build a wood shelter.",
      "Survive until morning.",
    ],
    materials: [{ english: "Wood", chinese: "木头" }],
    keywords: [
      { wordId: "wood", english: "wood", chinese: "木头" },
      { wordId: "axe", english: "axe", chinese: "斧" },
      { wordId: "sleep", english: "sleep", chinese: "睡觉" },
    ],
    rewards: [
      { type: "resource", resource: "wood", amount: 10 },
      { type: "xp", xp: 20 },
    ],
    icon: "wood",
  },
  {
    id: "steve-story-sword",
    title: "Help Steve Find His Sword",
    titleCn: "帮助 Steve 找剑",
    category: "adventure",
    descriptionCn: "Steve 丢了钻石剑！帮他找钻石并合成新剑。",
    missionEn: [
      "Steve lost his diamond sword.",
      "Find diamonds in a cave.",
      "Craft a new sword.",
      "Give the sword to Steve.",
    ],
    materials: [
      { english: "Diamond", chinese: "钻石" },
      { english: "Stick", chinese: "木棍" },
    ],
    keywords: [
      { wordId: "diamond", english: "diamond", chinese: "钻石" },
      { wordId: "sword", english: "sword", chinese: "剑" },
      { wordId: "stick", english: "stick", chinese: "木棍" },
    ],
    rewards: [
      { type: "resource", resource: "diamond", amount: 1 },
      { type: "xp", xp: 30 },
    ],
    icon: "sword",
  },
];

export const buildIdeaCategoryLabels: Record<
  BuildIdeaCategory,
  { en: string; cn: string; emoji: string }
> = {
  house: { en: "House", cn: "建筑", emoji: "🏠" },
  farm: { en: "Farm", cn: "农场", emoji: "🌾" },
  redstone: { en: "Redstone", cn: "红石", emoji: "⚡" },
  adventure: { en: "Adventure", cn: "探险", emoji: "🗺️" },
  decoration: { en: "Decoration", cn: "装饰", emoji: "✨" },
};

export function getBuildIdeaById(id: string): BuildIdea | undefined {
  return buildIdeas.find((idea) => idea.id === id);
}

export function getRandomBuildIdea(category?: BuildIdeaCategory | "all"): BuildIdea {
  const pool =
    category && category !== "all"
      ? buildIdeas.filter((idea) => idea.category === category)
      : buildIdeas;
  return pool[Math.floor(Math.random() * pool.length)];
}
