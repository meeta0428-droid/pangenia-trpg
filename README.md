# Pangaea Rebuild Character Sheet - Tool Walkthrough

## Overview
This is a web-based character sheet tool designed for the TRPG "Pangaea Rebuild". It allows players to manage their character's stats, jobs, equipment, and background, while automatically calculating growth costs and total EC (Energy Cost).

## Features

### 1. Stats & Growth System
- **5 Main Stats**: Strength (剛), Skill (巧), Intellect (知), Speed (速), Charm (魅).
- **Growth Logic**: increasing stats incurs EC costs based on the *total number of growths*.
- **Cost Table**:
  - 1st growth: 5 EC
  - 2nd-3rd: 10 EC
  - 4th-5th: 20 EC
  - ...and so on.
- **Undo**: Decreasing a stat refunds the cost of the *last* growth.

### 2. Character Creation Elements
- **Race Selection**: 
  - Automatically applies stat modifiers.
  - Handles "Any Stat" choices (preventing duplicate selections for the same stat).
  - Displays race descriptions.
- **Job Selection**:
  - Job 1 is free.
  - Job 2 costs **10 EC**.

### 3. Equipment & Items
- **Equipment**: Slots for Main Weapon, Sub Weapon, and Body Armor.
- **Items**: 6 slots for general items.
- **Cost Integration**: Entering an EC cost for any equipment or item automatically updates the Total EC.

### 4. Arts Packs
- Three packs available with increasing costs per slot:
  - **Pack 1**: 10 EC per item.
  - **Pack 2**: 15 EC per item.
  - **Pack 3**: 20 EC per item.
- Cost is only applied when text is entered into a slot.

### 5. Save/Load System
- **Local Storage**: Save up to 50 characters directly in your browser.
- **Control Panel**:
  - Save: Stores current data to selected slot.
  - Load: Restores data from selected slot.
  - Delete: Clears data from selected slot.
- **Slot Status**: Displays character name and race for easy identification.

### 6. Background
- Text areas for defining the character's Past, Reason for joining, Relationship with Allies, and Future Goals.

## Usage
1. Open `index.html` in any modern web browser.
2. Select a **Race** and **Job**.
3. Adjust **Stats** using the `+` and `-` buttons.
4. Enter **Equipment**, **Items**, and **Arts** as needed.
5. The **Total EC** at the bottom will update automatically.

## Related Tools
### Dice Roller
A simple dice rolling tool is included in the `dice_roller` directory.
- **Rules**: 1 = Fumble (-1 Success), 2-3 = Failure, 4-6 = Success.
- **RF Rank**: Enter a rank (0-3) to negate that number of fumbles automatically.
- **Total Result**: Calculates "Successes - Fumbles" (after RF negation).

## Deployment

### GitHub Pages
1. Go to your GitHub repository -> **Settings**.
2. Navigate to **Pages**.
3. Under **Branch**, select `main`.
4. Click **Save**.

### Vercel (Recommended)
1. Go to [Vercel](https://vercel.com/) and log in (e.g. via GitHub).
2. Click **Add New...** -> **Project**.
3. Import the `pangenia-trpg` repository.
4. Framework Preset: Leave as **Other**.
5. Click **Deploy**.
   - Your site will live at `https://pangenia-trpg.vercel.app` (or similar).
   - The Character Sheet will be at `/`.
   - The Dice Roller will be at `/dice_roller/`.
