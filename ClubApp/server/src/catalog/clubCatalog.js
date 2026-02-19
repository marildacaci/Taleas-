const CATALOG = {
  fitness: {
    description: "Professional fitness center focused on strength, cardio and wellness programs.",
    plans: [
      { name: "Basic", durationDays: 30, price: 20, maxActivities: 5 },
      { name: "Premium", durationDays: 30, price: 35, maxActivities: 10 }
    ],
    activities: ["Gym", "Cardio", "Yoga", "Pilates", "Crossfit", "Zumba", "Boxing", "Spinning", "HIIT", "Stretching"]
  },
  dance: {
    description: "Dance studio offering professional choreography and performance training.",
    plans: [
      { name: "Basic", durationDays: 30, price: 20, maxActivities: 5 },
      { name: "Premium", durationDays: 30, price: 35, maxActivities: 10 }
    ],
    activities: ["Hip Hop", "Ballet", "Salsa", "Kizomba", "Contemporary", "Tango", "Breakdance", "Jazz Dance", "Latin Dance", "Dance Fitness"]
  },
  coding: {
    description: "Programming club focused on modern web and backend technologies.",
    plans: [
      { name: "Basic", durationDays: 30, price: 20, maxActivities: 5 },
      { name: "Premium", durationDays: 30, price: 35, maxActivities: 10 }
    ],
    activities: ["HTML/CSS", "JavaScript", "React", "Node.js", "Python", "Java", "Databases", "Git/GitHub", "Algorithms", "APIs"]
  }
};

module.exports = CATALOG;
