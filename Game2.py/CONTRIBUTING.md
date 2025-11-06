# 🤝 Contributing to Ludo Game

First off, thank you for considering contributing to the Ludo Game! It's people like you that make this project better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. By participating, you are expected to uphold this standard.

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Mention your browser and version**

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would work**

### 🔧 Pull Request Process

1. **Fork the Repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ludo-game.git
   cd ludo-game
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # OR
   git checkout -b fix/bug-fix
   ```

4. **Make Your Changes**
   - Write clean, readable code
   - Follow the existing code style
   - Test your changes thoroughly

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: Amazing new feature"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Choose your fork and branch
   - Fill in the PR template
   - Submit!

## 📝 Style Guidelines

### JavaScript

- Use `const` and `let` instead of `var`
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

```javascript
// ✅ Good
const getCurrentPlayer = () => {
    return gameState.players[gameState.currentPlayerIndex];
};

// ❌ Bad
function f() {
    var p = g[i];
    return p;
}
```

### CSS

- Use meaningful class names
- Group related styles together
- Use CSS variables for repeated values
- Add comments for complex layouts

```css
/* ✅ Good */
.dice-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* ❌ Bad */
.dc {
    display: flex;
}
```

### HTML

- Use semantic HTML5 elements
- Include proper ARIA labels
- Keep structure clean and organized

```html
<!-- ✅ Good -->
<button class="roll-btn" aria-label="Roll the dice">
    Roll Dice
</button>

<!-- ❌ Bad -->
<div class="btn" onclick="roll()">
    Roll
</div>
```

## 🎨 Feature Ideas Welcome

We're always looking for new features! Some ideas:

- 🤖 AI opponent mode
- 🔊 Sound effects and music
- 🎨 Multiple board themes
- 📊 Statistics and leaderboard
- 💾 Save/load game state
- 🌐 Online multiplayer
- 🏆 Achievements system
- ⏱️ Timer mode

## 🐛 Known Issues

Check our [Issues page](https://github.com/YOUR_USERNAME/ludo-game/issues) for current bugs and feature requests.

## 📞 Questions?

Feel free to open an issue with the `question` label, and we'll be happy to help!

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🎲**
