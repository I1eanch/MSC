class QuickLinksService {
  constructor() {
    this.links = [
      {
        id: 1,
        title: "Workout Tracker",
        url: "/workouts",
        icon: "fitness",
        category: "health",
        description: "Track your daily workouts and progress"
      },
      {
        id: 2,
        title: "Meal Planner",
        url: "/meals",
        icon: "restaurant",
        category: "health",
        description: "Plan your weekly meals"
      },
      {
        id: 3,
        title: "Goals",
        url: "/goals",
        icon: "target",
        category: "productivity",
        description: "Set and track your goals"
      },
      {
        id: 4,
        title: "Statistics",
        url: "/stats",
        icon: "chart",
        category: "analytics",
        description: "View your progress statistics"
      },
      {
        id: 5,
        title: "Settings",
        url: "/settings",
        icon: "settings",
        category: "system",
        description: "Manage your preferences"
      },
      {
        id: 6,
        title: "Community",
        url: "/community",
        icon: "people",
        category: "social",
        description: "Connect with others"
      }
    ];
  }

  getQuickLinks() {
    return {
      links: this.links,
      total: this.links.length
    };
  }

  getQuickLinksByCategory(category) {
    const filtered = this.links.filter(link => link.category === category);
    return {
      links: filtered,
      category,
      total: filtered.length
    };
  }

  getQuickLinkById(id) {
    return this.links.find(link => link.id === id) || null;
  }

  getCategories() {
    const categories = [...new Set(this.links.map(link => link.category))];
    return categories.map(category => ({
      name: category,
      count: this.links.filter(link => link.category === category).length
    }));
  }
}

module.exports = new QuickLinksService();
