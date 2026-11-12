import { MapZone } from "@/types";

export const mapZones: MapZone[] = [
  {
    id: "zone-forest",
    mapArea: "forest",
    name: "Forest",
    nameCn: "森林",
    emoji: "🌲",
    requiredLevel: 1,
    questIds: ["wood-fights-for-sword", "gather-wood-for-sword"],
    descriptionCn: "开口打怪攒木头，喂木剑目标。",
  },
  {
    id: "zone-cave",
    mapArea: "cave",
    name: "Cave",
    nameCn: "洞穴",
    emoji: "⛏️",
    requiredLevel: 1,
    questIds: ["stone-fights-for-sword", "gather-stone-for-sword"],
    descriptionCn: "木剑解锁后，来这里攒石头做石剑。",
  },
  {
    id: "zone-battle",
    mapArea: "battle",
    name: "Craft Bench",
    nameCn: "工作台",
    emoji: "⚔️",
    requiredLevel: 1,
    questIds: ["craft-wooden-sword-errand", "craft-stone-sword-errand"],
    descriptionCn: "材料够了就开口合成武器，挂上武器架。",
  },
  {
    id: "zone-village",
    mapArea: "village",
    name: "Village",
    nameCn: "村庄",
    emoji: "🏘️",
    requiredLevel: 2,
    questIds: [],
    descriptionCn: "交易线稍后开放。先完成木剑 / 石剑武装。",
  },
  {
    id: "zone-nether",
    mapArea: "nether",
    name: "Nether",
    nameCn: "下界",
    emoji: "🔥",
    requiredLevel: 3,
    questIds: [],
    descriptionCn: "铁阶以后再开。",
  },
  {
    id: "zone-end",
    mapArea: "end",
    name: "The End",
    nameCn: "末地",
    emoji: "🐉",
    requiredLevel: 4,
    questIds: [],
    descriptionCn: "终极挑战稍后开放。",
  },
];

export function getMapZoneById(id: string): MapZone | undefined {
  return mapZones.find((zone) => zone.id === id);
}
