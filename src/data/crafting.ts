import { CraftingRecipe } from "@/types";

const slot = (itemId: string, english: string, chinese: string) => ({
  itemId,
  english,
  chinese,
});

export const craftingRecipes: CraftingRecipe[] = [
  {
    id: "torch",
    resultEnglish: "Torch",
    resultChinese: "火把",
    resultWordId: "torch",
    grid: [
      [slot("coal", "Coal", "煤")],
      [slot("stick", "Stick", "木棍")],
    ],
    simpleEnglish: "Coal on top of a stick makes a torch.",
    simpleChinese: "煤放在木棍上面合成火把。",
    keywordIds: ["coal", "stick", "torch", "light"],
    relatedGuideId: "craft-torch",
  },
  {
    id: "bed",
    resultEnglish: "Bed",
    resultChinese: "床",
    resultWordId: "bed",
    grid: [
      [
        slot("wool", "Wool", "羊毛"),
        slot("wool", "Wool", "羊毛"),
        slot("wool", "Wool", "羊毛"),
      ],
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
    ],
    simpleEnglish: "You need three wool and three planks.",
    simpleChinese: "你需要三个羊毛和三个木板。",
    keywordIds: ["wool", "plank", "bed", "sleep"],
    relatedGuideId: "craft-bed",
    relatedQuestId: "build-a-bed",
  },
  {
    id: "crafting-table",
    resultEnglish: "Crafting Table",
    resultChinese: "工作台",
    resultWordId: "crafting-table",
    grid: [
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
    ],
    simpleEnglish: "Four planks make a crafting table.",
    simpleChinese: "四个木板合成工作台。",
    keywordIds: ["plank", "craft", "crafting-table"],
    relatedGuideId: "crafting-table",
    relatedQuestId: "make-planks",
  },
  {
    id: "stick",
    resultEnglish: "Stick",
    resultChinese: "木棍",
    resultWordId: "stick",
    grid: [
      [slot("plank", "Plank", "木板")],
      [slot("plank", "Plank", "木板")],
    ],
    simpleEnglish: "Two planks make four sticks.",
    simpleChinese: "两个木板合成四根木棍。",
    keywordIds: ["plank", "stick", "wood"],
  },
  {
    id: "wooden-pickaxe",
    resultEnglish: "Wooden Pickaxe",
    resultChinese: "木镐",
    resultWordId: "pickaxe",
    grid: [
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
      [null, slot("stick", "Stick", "木棍"), null],
      [null, slot("stick", "Stick", "木棍"), null],
    ],
    simpleEnglish: "Three planks and two sticks make a pickaxe.",
    simpleChinese: "三个木板和两根木棍合成镐。",
    keywordIds: ["plank", "stick", "pickaxe"],
    relatedGuideId: "wooden-pickaxe",
  },
  {
    id: "diamond-sword",
    resultEnglish: "Diamond Sword",
    resultChinese: "钻石剑",
    resultWordId: "diamond-sword",
    grid: [
      [slot("diamond", "Diamond", "钻石"), null, null],
      [slot("diamond", "Diamond", "钻石"), null, null],
      [null, slot("stick", "Stick", "木棍"), null],
    ],
    simpleEnglish: "Two diamonds and one stick make a diamond sword.",
    simpleChinese: "两个钻石和一根木棍合成钻石剑。",
    keywordIds: ["diamond", "sword", "stick", "craft"],
    relatedGuideId: "diamond-sword-guide",
    relatedQuestId: "craft-diamond-sword",
  },
  {
    id: "shield",
    resultEnglish: "Shield",
    resultChinese: "盾牌",
    resultWordId: "shield",
    grid: [
      [
        slot("plank", "Plank", "木板"),
        slot("iron", "Iron", "铁"),
        slot("plank", "Plank", "木板"),
      ],
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
      [null, slot("plank", "Plank", "木板"), null],
    ],
    simpleEnglish: "One iron ingot and six planks make a shield.",
    simpleChinese: "一个铁锭和六个木板合成盾牌。",
    keywordIds: ["shield", "iron", "plank", "fight"],
    relatedGuideId: "craft-shield",
  },
  {
    id: "boat",
    resultEnglish: "Boat",
    resultChinese: "船",
    resultWordId: "boat",
    grid: [
      [
        slot("plank", "Plank", "木板"),
        null,
        slot("plank", "Plank", "木板"),
      ],
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
    ],
    simpleEnglish: "Five planks make a boat.",
    simpleChinese: "五个木板合成船。",
    keywordIds: ["plank", "boat", "water"],
    relatedGuideId: "craft-boat",
  },
  {
    id: "bookshelf",
    resultEnglish: "Bookshelf",
    resultChinese: "书架",
    resultWordId: "bookshelf",
    grid: [
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
      [
        slot("book", "Book", "书"),
        slot("book", "Book", "书"),
        slot("book", "Book", "书"),
      ],
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
    ],
    simpleEnglish: "Six planks and three books make a bookshelf.",
    simpleChinese: "六个木板和三本书合成书架。",
    keywordIds: ["bookshelf", "book", "plank", "enchant"],
    relatedGuideId: "craft-bookshelf",
  },
  {
    id: "chest",
    resultEnglish: "Chest",
    resultChinese: "箱子",
    resultWordId: "chest",
    grid: [
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
      [
        slot("plank", "Plank", "木板"),
        null,
        slot("plank", "Plank", "木板"),
      ],
      [
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
        slot("plank", "Plank", "木板"),
      ],
    ],
    simpleEnglish: "Eight planks make a chest.",
    simpleChinese: "八个木板合成箱子。",
    keywordIds: ["chest", "plank", "craft"],
    relatedGuideId: "craft-chest",
  },
  {
    id: "ladder",
    resultEnglish: "Ladder",
    resultChinese: "梯子",
    resultWordId: "ladder",
    grid: [
      [slot("stick", "Stick", "木棍"), null, slot("stick", "Stick", "木棍")],
      [slot("stick", "Stick", "木棍"), slot("stick", "Stick", "木棍"), slot("stick", "Stick", "木棍")],
      [slot("stick", "Stick", "木棍"), null, slot("stick", "Stick", "木棍")],
    ],
    simpleEnglish: "Seven sticks make a ladder.",
    simpleChinese: "七根木棍合成梯子。",
    keywordIds: ["ladder", "stick", "climb"],
  },
  {
    id: "fence",
    resultEnglish: "Fence",
    resultChinese: "栅栏",
    resultWordId: "fence",
    grid: [
      [
        slot("plank", "Plank", "木板"),
        slot("stick", "Stick", "木棍"),
        slot("plank", "Plank", "木板"),
      ],
      [
        slot("plank", "Plank", "木板"),
        slot("stick", "Stick", "木棍"),
        slot("plank", "Plank", "木板"),
      ],
    ],
    simpleEnglish: "Four planks and two sticks make a fence.",
    simpleChinese: "四个木板和两根木棍合成栅栏。",
    keywordIds: ["fence", "plank", "stick", "farm"],
    relatedQuestId: "start-a-farm",
  },
  {
    id: "furnace",
    resultEnglish: "Furnace",
    resultChinese: "熔炉",
    resultWordId: "furnace",
    grid: [
      [
        slot("stone", "Stone", "石头"),
        slot("stone", "Stone", "石头"),
        slot("stone", "Stone", "石头"),
      ],
      [slot("stone", "Stone", "石头"), null, slot("stone", "Stone", "石头")],
      [
        slot("stone", "Stone", "石头"),
        slot("stone", "Stone", "石头"),
        slot("stone", "Stone", "石头"),
      ],
    ],
    simpleEnglish: "Eight stone blocks make a furnace.",
    simpleChinese: "八个石头合成熔炉。",
    keywordIds: ["furnace", "stone", "cook", "smelt"],
    relatedQuestId: "cook-a-meal",
  },
];

export function getCraftingRecipeById(id: string): CraftingRecipe | undefined {
  return craftingRecipes.find((recipe) => recipe.id === id);
}

export function searchCraftingRecipes(query: string): CraftingRecipe[] {
  const q = query.trim().toLowerCase();
  if (!q) return craftingRecipes;
  return craftingRecipes.filter((recipe) => {
    const haystack = [
      recipe.resultEnglish,
      recipe.resultChinese,
      recipe.simpleEnglish,
      recipe.simpleChinese,
      ...recipe.grid.flatMap((row) =>
        row.filter(Boolean).map((cell) => `${cell!.english} ${cell!.chinese}`),
      ),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
