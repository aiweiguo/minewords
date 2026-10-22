import { MapZone } from "@/types";

export const mapZones: MapZone[] = [
  {
    id: "zone-forest",
    mapArea: "forest",
    name: "Forest",
    nameCn: "森林",
    emoji: "🌲",
    requiredLevel: 1,
    questIds: ["collect-wood", "make-planks", "build-a-bed"],
    descriptionCn: "从这里开始！学木头、木板和床。",
  },
  {
    id: "zone-cave",
    mapArea: "cave",
    name: "Cave",
    nameCn: "洞穴",
    emoji: "⛏️",
    requiredLevel: 1,
    questIds: ["mine-stone", "find-iron", "find-diamond"],
    descriptionCn: "深入地下，挖石头、铁和钻石。",
  },
  {
    id: "zone-battle",
    mapArea: "battle",
    name: "Battle",
    nameCn: "战斗",
    emoji: "⚔️",
    requiredLevel: 2,
    questIds: ["fight-a-zombie", "craft-diamond-sword"],
    descriptionCn: "打败怪物，合成最强武器。",
  },
  {
    id: "zone-village",
    mapArea: "village",
    name: "Village",
    nameCn: "村庄",
    emoji: "🏘️",
    requiredLevel: 2,
    questIds: ["trade-at-village", "start-a-farm", "cook-a-meal"],
    descriptionCn: "和村民交易，开垦农场，学烹饪用语。",
  },
  {
    id: "zone-nether",
    mapArea: "nether",
    name: "Nether",
    nameCn: "下界",
    emoji: "🔥",
    requiredLevel: 3,
    questIds: ["open-nether-portal", "explore-nether-fortress"],
    descriptionCn: "建造传送门，探索下界要塞。",
  },
  {
    id: "zone-end",
    mapArea: "end",
    name: "The End",
    nameCn: "末地",
    emoji: "🐉",
    requiredLevel: 4,
    questIds: ["face-the-dragon"],
    descriptionCn: "终极挑战：摧毁水晶，迎战末影龙。",
  },
];

export function getMapZoneById(id: string): MapZone | undefined {
  return mapZones.find((zone) => zone.id === id);
}
