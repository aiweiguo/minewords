# MineWords 🏔️📚

**MineWords** is a Minecraft-themed English learning application designed for kids. It turns vocabulary acquisition into an adventure — complete with crafting, quests, map exploration, speaking practice, and a monster quiz system.

Built with **Next.js 15** (App Router) and **TypeScript**, running entirely in the browser with no backend dependencies.

---

## ✨ Features

### 📖 Vocabulary Learning
- Dictionary with search, categories, and word detail pages
- Spaced repetition review system
- Wrong word tracking for focused practice

### 🎮 Gamification
- **Crafting system** — craft items using learned words as materials
- **Quests** — complete quests to earn rewards and unlock new content
- **Map zones** — explore themed zones: Forest, Ocean, Desert, Nether, End
- **Unlockables** — decorations, base panels, and achievements
- **Inventory** — manage collected items and resources

### 🗣️ Speaking Practice
- Speech recognition-powered speaking scenarios
- Sentence pattern drills
- Real-world conversation simulations (ordering food, asking for directions, etc.)

### 🧠 Learning Tools
- **Daily Adventure** — a word-a-day challenge with streak tracking
- **Word Monsters** — defeat monsters by answering vocabulary questions
- **Mastery Challenges** — timed and untimed quiz modes
- **MineDex** — track mastered words like a Pokédex

### 📊 Progress Tracking
- Learning stats and streak tracking
- Parent report panel
- Progress by difficulty tier

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧩 Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── crafting/     # Crafting system
│   ├── dictionary/   # Word dictionary
│   ├── guides/       # Learning guides
│   ├── listening/    # Listening exercises
│   ├── map/          # Map zone exploration
│   ├── minedex/      # Word collection tracker
│   ├── parent/       # Parent dashboard
│   ├── planner/      # Learning plan builder
│   ├── quests/       # Quest system
│   ├── review/       # Review/quiz system
│   ├── speak/        # Speaking practice
│   └── ...
├── components/       # Reusable React components
├── data/             # Game data (vocabulary, quests, recipes, etc.)
├── lib/              # Utilities and game logic
├── store/            # Zustand game state store
├── styles/           # Global CSS
└── types/            # TypeScript types
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** (App Router) | Framework |
| **TypeScript** | Type safety |
| **Zustand** | Client-side state management |
| **Web Speech API** | Speech recognition for speaking practice |
| **CSS Modules** | Scoped styling |

---

## 📜 License

MIT — see [LICENSE](./LICENSE) for details.

---

## 🎯 Why Open Source?

MineWords was built as a learning tool for kids to make English fun through gamification. By open-sourcing it, we hope educators, developers, and parents can adapt it, improve it, and create localized versions for their own communities.
