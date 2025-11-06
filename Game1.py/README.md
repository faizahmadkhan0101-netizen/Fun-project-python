# 🎲 Number Guessing Game

A simple and fun Python game where you try to guess a randomly generated number between 1 and 100!

## 🎮 How to Play

1. Run the game:
   ```bash
   python main.py
   ```
2. The computer will generate a random number between 1 and 100
3. Enter your guess when prompted
4. The game will tell you if your guess is:
   - Too high ⬆️
   - Too low ⬇️
   - Correct! 🎯
5. Keep guessing until you find the right number

## ✨ Features

- 🔢 Random number generation
- 🤔 Interactive gameplay
- 🛡️ Input validation (checks for valid integers)
- 💡 Helpful hints after each guess
- 🔄 Continuous play until correct guess

## 🛠️ Requirements

- Python 3.x
- `random` module (included in Python standard library)

## 🚀 Quick Start

1. Make sure Python is installed on your system
2. Navigate to the game directory:
   ```bash
   cd "Fun project- python"
   ```
3. Run the game:
   ```bash
   python main.py
   ```

## 🎯 Game Logic

1. The game generates a random number between 1 and 100
2. Player inputs their guess
3. Game provides feedback:
   - "Too high!" if the guess is above the target
   - "Too low!" if the guess is below the target
   - "Congratulations!" when the correct number is guessed

## 💻 Code Example

```python
import random

number_to_guess = random.randint(1, 100)
# Game continues until correct guess
```

## 🔧 Error Handling

- ✅ Validates numeric input
- ❌ Gracefully handles non-integer inputs
- 🔄 Allows continuous attempts after invalid inputs

## 💡 Tips to Win

1. Start with 50 as your first guess
2. Use the feedback to narrow down the range
3. Keep track of your previous guesses
4. Use binary search strategy for optimal guessing

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest enhancements
- Submit pull requests

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Author

Created by Faiz Ahmad Khan

---

**Have fun playing the Number Guessing Game! 🎮**