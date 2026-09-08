# 🌲 Blackwood Pines - 3D Survival Horror Game

> A first-person 3D psychological survival horror game built with **Three.js**, **React 19**, and **Tailwind CSS**. Evade the antlered forest stalker, scavenge for generator spark plugs and diesel fuel, repair the ham radio, and escape through the southern mountain forestry gate.

![Blackwood Pines](public/favicon.ico)

---

## 🎮 How to Play

### Story & Objective
- **Chapter I - The Stranded Ranger**: Search your crashed truck at the North Trailhead for the Ranger Cabin Key.
- **Chapter II - Shrouded Runes**: Scavenge 3 heavy-duty spark plugs hidden among ancient monoliths, tents, and logging shacks.
- **Chapter III - Blood & High Voltage**: Locate the 5-gallon diesel canister and prime the Caterpillar generator.
- **Chapter IV - The Final Evacuation**: Restore power, dodge the awakened entity, unlock the South Forestry Gate, and flee into the night.

---

## 🕹️ Controls

### Keyboard & Mouse
| Action | Key / Input |
|---|---|
| **Move** | `W` `A` `S` `D` / Arrow Keys |
| **Look** | Mouse (Click screen to lock cursor) |
| **Sprint** | `Shift` (Depletes stamina) |
| **Crouch** | `C` or `Ctrl` (Dampens footstep noise) |
| **Jump** | `Space` |
| **Interact / Collect** | `E` |
| **Flashlight / Tap Flicker** | `F` |
| **UV Blacklight Mode** | `T` (Reveals hidden runes & trails) |
| **Reload Battery** | `R` |
| **Throw Bottle (Distract)** | `G` |
| **Ignite Magnesium Flare** | `X` (Wards off creature) |
| **Hold Breath** | `Alt` or `H` (Reduces breathing noise) |
| **Peek / Lean** | `Q` (Left) / `E` (Right) |
| **Forest Topographic Map** | `M` |
| **Objectives Dossier** | `O` |
| **Quick Save / Load Code** | `K` (Save) / `L` (Load) |
| **Pause Menu** | `Esc` |

### 🎮 Gamepad / Controller Support (Xbox & PlayStation)
| Action | Controller Button |
|---|---|
| **Move** | Left Analog Stick |
| **Look** | Right Analog Stick |
| **Interact / Select** | `A` (Xbox) / `✕` (PS) |
| **Crouch** | `B` (Xbox) / `○` (PS) |
| **Reload Battery** | `X` (Xbox) / `□` (PS) |
| **Flashlight / Tap** | `Y` (Xbox) / `△` (PS) |
| **Sprint** | `Right Trigger (RT / R2)` |
| **Hold Breath** | `Left Trigger (LT / L2)` |
| **Throw Bottle** | `Left Bumper (LB / L1)` |
| **Ignite Flare** | `Right Bumper (RB / R1)` |
| **Open Map** | `D-Pad Up` |
| **Objectives Dossier** | `D-Pad Down` |
| **Lean Left / Right** | `D-Pad Left / Right` |
| **Pause** | `Start / Options` |
| **Haptic Feedback** | DualRumble vibration on jumpscares, heartbeat & creature roar |

### 📱 Mobile & Touch Devices
- On-screen floating analog movement joystick.
- Touch-and-drag right-side look viewport.
- Touch buttons for Flashlight, Sprint, Crouch, Jump, Interact, Flare, Bottle, and Map.

---

## 🚀 How to Publish to GitHub Pages

This project is configured with **zero-config relative asset paths** and an automated **GitHub Actions Workflow**.

### Option 1: Automatic Deployment via GitHub Actions (Recommended)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Blackwood Pines"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Go to your GitHub repository in your browser:
   - Click **Settings** ➔ **Pages** (in the left sidebar).
   - Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
3. Every time you push to `main` (or trigger the workflow manually in the Actions tab), GitHub will automatically build and publish your game to:
   `https://<your-username>.github.io/<your-repo-name>/`

### Option 2: Manual Local Build
To create a standalone production build:
```bash
npm run build
```
The compiled, ready-to-deploy static assets will be in the `dist/` directory.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Open in your browser at:
# http://localhost:3000
```
