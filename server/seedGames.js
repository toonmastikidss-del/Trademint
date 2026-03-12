const mongoose = require('mongoose');
const Game = require('./models/Game');

const games = [
  {
    name: 'Coin Flip',
    description: 'Simple heads or tails game. Double your money with 50% chance!',
    icon: '🪙',
    category: 'Luck',
    minBet: 10,
    maxBet: 5000,
    totalPlayers: 2400,
    isActive: true,
    rules: 'Flip a coin. If it matches your choice (Heads/Tails), you win 2x your bet.',
    winRate: 0.5
  },
  {
    name: 'Dice Roll',
    description: 'Roll the dice and win big! Predict the outcome.',
    icon: '🎲',
    category: 'Luck',
    minBet: 20,
    maxBet: 3000,
    totalPlayers: 1800,
    isActive: true,
    rules: 'Roll a 6-sided die. Choose your number (1-6). Correct guess wins 5x.',
    winRate: 0.167
  },
  {
    name: 'Lucky Spin',
    description: 'Spin the wheel and multiply your winnings!',
    icon: '🎡',
    category: 'Luck',
    minBet: 50,
    maxBet: 10000,
    totalPlayers: 3100,
    isActive: true,
    rules: 'Spin the wheel. Land on multiplier segments to increase your bet.',
    winRate: 0.4
  },
  {
    name: 'Slot Machine',
    description: 'Classic slots experience. Match symbols to win!',
    icon: '🎰',
    category: 'Luck',
    minBet: 10,
    maxBet: 2000,
    totalPlayers: 1200,
    isActive: true,
    rules: 'Match 3 identical symbols in a row to win 10x your bet.',
    winRate: 0.1
  },
  {
    name: 'Blackjack',
    description: 'Beat the dealer to 21 without going over.',
    icon: '🃏',
    category: 'Skill',
    minBet: 100,
    maxBet: 10000,
    totalPlayers: 1500,
    isActive: true,
    rules: 'Get closer to 21 than the dealer without exceeding. Cards 2-10 face value, J/Q/K=10, A=1 or 11.',
    winRate: 0.48
  },
  {
    name: 'Wheel of Fortune',
    description: 'Predict where the wheel will stop!',
    icon: '🎯',
    category: 'Luck',
    minBet: 25,
    maxBet: 5000,
    totalPlayers: 890,
    isActive: true,
    rules: 'Bet on a section. When wheel stops on your section, win based on multiplier.',
    winRate: 0.25
  }
];

async function seedGames() {
  try {
    await mongoose.connect('mongodb://localhost:27017/trademint');
    console.log('✅ Connected to MongoDB');

    // Clear existing games
    await Game.deleteMany({});
    console.log('🗑️  Cleared existing games');

    // Insert new games
    const inserted = await Game.insertMany(games);
    console.log(`✅ Seeded ${inserted.length} games successfully`);

    inserted.forEach(game => {
      console.log(`  - ${game.icon} ${game.name} (${game.category}) - ${game.totalPlayers} players`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding games:', error);
    process.exit(1);
  }
}

seedGames();
