const motivationalQuotes = [
  { id: 1, text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "inspiration" },
  { id: 2, text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "perseverance" },
  { id: 3, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "confidence" },
  { id: 4, text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "productivity" },
  { id: 5, text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "dreams" },
  { id: 6, text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "perseverance" },
  { id: 7, text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "courage" },
  { id: 8, text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "action" },
  { id: 9, text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous", category: "achievement" },
  { id: 10, text: "Dream bigger. Do bigger.", author: "Anonymous", category: "ambition" }
];

class MotivationalService {
  getDailyMotivation() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % motivationalQuotes.length;
    
    return {
      quote: motivationalQuotes[index],
      date: today.toISOString().split('T')[0]
    };
  }

  getRandomMotivation() {
    const index = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[index];
  }

  getAllMotivations() {
    return motivationalQuotes;
  }
}

module.exports = new MotivationalService();
