<div align="center">
  <h1> AmbientGlass Premium Spicetify Theme </h1>
  <p><i>A state-of-the-art Spicetify theme inspired by modern glassmorphism and Apple-style aesthetics.</i></p>

  [![Spicetify](https://img.shields.io/badge/Spicetify-Theme-success?style=for-the-badge&logo=spotify)](#)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#)
</div>

<br>

AmbientGlass transforms your Spotify into a vibrant, atmospheric experience with floating UI elements, dynamic glows, and deep glassmorphism effects. It is designed to feel highly premium, fluid, and immersive.

---

## 📸 Preview
![Preview 1](preview.png)

---

##  Features

- **Floating Home Cluster**: A sleek, minimal navigation dock that elegantly expands on hover.
- **Centered Search Experience**: A cinematic search bar with ring animations that docks smoothly on scroll.
- **Theme Settings Panel**: Real-time customization for colors, glows, and glass effects—right inside Spotify.
- **Frosted Glass Customization**: Adjustable blur intensity and premium translucent reflections.
- **Privacy Mode**: One-click protection that instantly hides artist/song names and album covers.
- **Atmospheric Blobs**: Vibrant, blurred background elements that create depth and set the mood.
- **Cinematic Startup**: A custom intro animation to start your listening session in style.

---

##  Installation

### Option A: Marketplace (Recommended)
1. Make sure you have [Spicetify](https://spicetify.app/) installed.
2. Open the **Spicetify Marketplace** directly within Spotify.
3. Search for **AmbientGlass**.
4. Click **Install**.

### Option B: Automated Windows Installation
1. Download the `install_ambientglass.bat` script from this repository.
2. Double-click to run it. It will automatically download the required files, move them to the correct directories, and configure Spicetify for you.

### Option C: Manual Installation
1. Download the repository and extract it.
2. Place the `AmbientGlass` folder into your Spicetify `Themes` directory.
3. Copy `theme.js` into your Spicetify `Extensions` directory.
4. Open your terminal/PowerShell and run:
   ```bash
   spicetify config current_theme AmbientGlass
   spicetify config inject_css 1 replace_colors 1 overwrite_assets 1 inject_theme_js 1
   spicetify config extensions theme.js
   spicetify apply
   ```

---

##  Updating & Uninstalling

If you used the manual or automated installation method, you can use the provided batch scripts (`update_ambientglass.bat` and `uninstall_ambientglass.bat`) to easily update the theme to the newest version or completely remove it.

---

##  Credits

Made by **EROX**.
