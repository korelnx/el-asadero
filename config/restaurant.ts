export const locations = [
  {
    id: "reynoldsburg",
    name: "Reynoldsburg",
    address: "6005 Gender Rd, Reynoldsburg, OH 43068",
    phone: "(614) 626-0051",
    hours: "Mon–Thu 11am–10pm · Fri–Sat 11am–11pm · Sun 12pm–9pm",
  },
  {
    id: "columbus",
    name: "Columbus",
    address: "1234 High St, Columbus, OH 43215",
    phone: "(614) 555-0199",
    hours: "Mon–Thu 11am–10pm · Fri–Sat 11am–11pm · Sun 12pm–9pm",
  },
  {
    id: "gahanna",
    name: "Gahanna",
    address: "890 Morse Rd, Gahanna, OH 43230",
    phone: "(614) 555-0177",
    hours: "Mon–Sun 11am–10pm",
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
    headline: "Discover Our Authentic",
    headlineAccent: "Mexican Flavors",
    subheading:
      "From sizzling fajitas and birria to fresh seafood and hand-crafted cocktails — El Asadero brings the heart of Mexico straight to Reynoldsburg.",
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
    headline: "Ready to Experience",
    headlineAccent: "El Asadero?",
    subheading: "Order online for pickup or give us a call. Fresh, authentic Mexican dishes ready for you.",
  },

  social: {
    facebook:  "#",
    instagram: "#",
    twitter:   "#",
  },

  copyright: "2024 El Asadero Reynoldsburg",
};
