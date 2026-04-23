# Build Realm's Rise — Medieval idle game (Phases 1–8)

## Realm's Rise — Medieval Idle Kingdom Builder

A tap-to-earn idle game where you grow a medieval kingdom from a single peasant hut into a sprawling empire, then "declare sovereignty" to reset and unlock permanent skill tree powers.

### Features (what the player will do)
- **Tap to earn gold** with a satisfying big crown button and floating "+X gold" numbers
- **Buy 10 tiers of buildings** — Peasant Hut, Market Stall, Blacksmith, Tavern, Mill, Barracks, Cathedral, Castle Tower, Royal Treasury, Palace — each earning passive gold per second
- **Unlock 30 upgrades** (3 per building) that multiply income at 10, 25, and 50 owned
- **Declare Sovereignty (prestige)** once you've earned 1 million gold — reset your kingdom in exchange for Crown Points
- **Spend Crown Points on a 16-node skill tree** across 4 branches: Commerce (amber), Military (red), Faith (purple), Lineage (blue) — permanent boosts that carry across runs
- **Offline earnings** — the kingdom keeps working while you're away (2h cap, 6h with the Blessing skill)
- **Auto-save** every 30 seconds and on background, with a "welcome back" greeting showing what you earned while away
- **Celebratory milestone pop-ups** when you hit key lifetime goals (first coin, 1M gold, first prestige, etc.)
- **Settings with hard reset** for starting over

### Design (dark parchment / stone — as specified)
- Deep warm brown background (#1a1208) with subtle parchment-like texture
- Gold (#FFD700) for all important numbers and highlights
- Serif typography for headings and gold values — feels like an illuminated ledger
- Building cards: dark embossed panels (#2a1f0e) with amber borders
- Branch colors on the skill tree for clear visual grouping
- Smooth gold counter that interpolates instead of jumping
- Tactile press animations, haptic feedback, and floating click numbers
- Glowing skill nodes when available, checkmarks when owned

### Screens
1. **Kingdom** — the main clicker: gold total, gold/sec subtitle, huge tap button, 3 stat chips (Gold/Click, Gold/Sec, Prestige count), and the "Declare Sovereignty" button that appears once eligible. Settings gear in the header.
2. **Buildings** — segmented control switches between "Buildings" (progressively revealed list of 10, each with cost, count, GPS contribution, progress bar to next upgrade, and a Buy / Buy Max toggle) and "Upgrades" (available upgrades + a purchased section).
3. **Skill Tree** — Crown Points counter at top, 4 vertical branches in a 2×2 grid with connecting lines, node states for locked / available / unlocked / can't afford, with a confirmation sparkle when unlocked.
4. **Prestige confirmation modal** — "Your kingdom will fall, but your legacy endures" with CP preview.

### App icon
- Generated icon: a golden crown on a deep parchment-brown background with subtle gold filigree — regal, medieval, instantly readable at small sizes.

### Scope for this build
- Phases 1–8: full game data, engine, 3 screens, prestige system, skill tree, save/load with offline progress, settings reset
- Polish (Phase 9 milestones and Phase 10 extra animations/Buy Max/progress bars) can follow in a next pass, though I'll include the core visual polish and number formatting now so it looks great from the start