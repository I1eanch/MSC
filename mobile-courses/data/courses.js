const coursesData = {
  courses: [
    {
      id: 1,
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript",
      instructor: "John Smith",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180'%3E%3Crect fill='%234A90E2' width='300' height='180'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' fill='white' font-size='24'%3EWeb Development%3C/text%3E%3C/svg%3E",
      premium: false,
      progress: 45,
      modules: [
        {
          id: 1,
          title: "HTML Basics",
          lessons: [
            { id: 1, title: "Introduction to HTML", duration: 12, completed: true, premium: false },
            { id: 2, title: "HTML Tags and Elements", duration: 15, completed: true, premium: false },
            { id: 3, title: "Forms and Input", duration: 18, completed: false, premium: false }
          ]
        },
        {
          id: 2,
          title: "CSS Styling",
          lessons: [
            { id: 4, title: "CSS Selectors", duration: 14, completed: false, premium: false },
            { id: 5, title: "Box Model", duration: 16, completed: false, premium: false },
            { id: 6, title: "Flexbox Layout", duration: 20, completed: false, premium: true }
          ]
        },
        {
          id: 3,
          title: "JavaScript Fundamentals",
          lessons: [
            { id: 7, title: "Variables and Data Types", duration: 13, completed: false, premium: false },
            { id: 8, title: "Functions and Scope", duration: 17, completed: false, premium: true }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      description: "Master React with hooks, context, and advanced patterns",
      instructor: "Jane Doe",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180'%3E%3Crect fill='%2361DAFB' width='300' height='180'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' fill='%23282C34' font-size='24'%3EReact Patterns%3C/text%3E%3C/svg%3E",
      premium: true,
      progress: 20,
      modules: [
        {
          id: 1,
          title: "React Hooks",
          lessons: [
            { id: 1, title: "useState Hook", duration: 16, completed: true, premium: true },
            { id: 2, title: "useEffect Hook", duration: 18, completed: false, premium: true },
            { id: 3, title: "Custom Hooks", duration: 20, completed: false, premium: true }
          ]
        },
        {
          id: 2,
          title: "State Management",
          lessons: [
            { id: 4, title: "Context API", duration: 15, completed: false, premium: true },
            { id: 5, title: "Redux Basics", duration: 22, completed: false, premium: true }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Python for Data Science",
      description: "Explore data analysis, visualization, and machine learning",
      instructor: "Mike Johnson",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180'%3E%3Crect fill='%233776AB' width='300' height='180'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' fill='white' font-size='24'%3EPython Data Science%3C/text%3E%3C/svg%3E",
      premium: true,
      progress: 0,
      modules: [
        {
          id: 1,
          title: "Python Fundamentals",
          lessons: [
            { id: 1, title: "Python Basics", duration: 14, completed: false, premium: true },
            { id: 2, title: "Data Structures", duration: 19, completed: false, premium: true }
          ]
        },
        {
          id: 2,
          title: "Libraries and Tools",
          lessons: [
            { id: 3, title: "NumPy and Pandas", duration: 25, completed: false, premium: true },
            { id: 4, title: "Data Visualization", duration: 20, completed: false, premium: true }
          ]
        }
      ]
    }
  ],
  userSubscription: {
    isPremium: false,
    expiresAt: null
  },
  userProgress: {}
};
