export const locations = [
  {
    id: "reynoldsburg",
    name: "Reynoldsburg",
    address: "6005 Gender Rd, Reynoldsburg, OH 43068",
    phone: "(614) 626-0051",
    hours: "Mon–Thu 11am–10pm · Fri–Sat 11am–11pm · Sun 12pm–9pm",
  },
];

export const restaurant = {
  name: "El Asadero Reynoldsburg",
  initials: "EA",
  tagline: "Authentic Mexican Cuisine",
  description: "Serving bold, authentic Mexican flavors in Reynoldsburg, OH. From sizzling fajitas to fresh ceviches, every dish is made with passion and tradition.",

  address: {
    street: "",
    city: "Reynoldsburg",
    state: "OH",
    zip: "",
    full: "Reynoldsburg, OH",
    line1: "Reynoldsburg, OH",
    line2: "",
  },

  phone: "(614) 626-0051",
  phoneRaw: "6146260051",
  email: "info@elasaderoreynoldsburg.com",

  hours: [
    { days: "Mon - Thu", hours: "11am - 10pm" },
    { days: "Fri - Sat", hours: "11am - 11pm" },
    { days: "Sunday",    hours: "12pm - 9pm"  },
  ],

  hero: {
    headline: "Where Fire Meets",
    headlineAccent: "Tradition.",
    subheading:
      "Slow-cooked meats, hand-pressed tortillas, and flavors that cross borders — El Asadero is Reynoldsburg's home for true Mexican cooking.",
    stats: [
      { value: "20+",   label: "Menu Categories"  },
      { value: "150+",  label: "Signature Dishes"  },
      { value: "Fresh", label: "Made Daily"         },
    ],
  },

  about: {
    headline: "Real Flavors,",
    headlineAccent: "Real Tradition",
    body: [
      "El Asadero was born from a deep love for authentic Mexican cuisine. We bring together regional recipes — from Jalisco fajitas and Veracruz seafood to Oaxacan mole — all under one roof in Reynoldsburg.",
      "Every dish is crafted with fresh ingredients and time-honored techniques. Whether you're here for a quick lunch or a full parrillada with the family, we make every visit memorable.",
    ],
    stats: [
      { value: "150+",  label: "Menu Items"    },
      { value: "20+",   label: "Categories"    },
      { value: "Fresh", label: "Made Daily"    },
    ],
  },

  cta: {
    headline: "Order Fresh.",
    headlineAccent: "Today.",
    subheading: "Order online for pickup or give us a call. Fresh, authentic Mexican dishes ready for you.",
  },

  social: {
    facebook:  "#",
    instagram: "#",
    twitter:   "#",
  },

  copyright: "2024 El Asadero Reynoldsburg",
};
