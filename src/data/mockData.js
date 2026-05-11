export const mockRepInfo = {
  id: "REP-9021",
  name: "Arjun Kumar",
  territory: "Guntur District, Andhra Pradesh",
  todayTarget: 12,
  completed: 3
};

export const mockAnomalies = [
  {
    id: "AN-1",
    type: "alert-danger",
    title: "Pest Outbreak Alert",
    description: "High incidence of Fall Armyworm detected in neighboring Prakasam district. Prioritize Ampligo discussions.",
    time: "2 hours ago"
  },
  {
    id: "AN-2",
    type: "alert-warning",
    title: "Weather Shift",
    description: "Unexpected heavy rainfall predicted for tomorrow. Delay fungicide applications by 48 hrs.",
    time: "5 hours ago"
  }
];

export const mockPriorityVisits = [
  {
    id: "VISIT-001",
    type: "retailer",
    name: "Sri Venkateswara Agro",
    location: "Tenali",
    distance: "2.4 km away",
    priorityScore: 98,
    reason: "Competitor 'Brand X' launched promo. Defensive action required.",
    inventoryStatus: "Low on Voliam Targo",
    nextBestAction: {
      action: "Pitch Voliam Targo Bulk Discount",
      rationale: "Their inventory is down 60% compared to last week, and competitor is pushing new insecticides. Secure order today.",
      products: ["Voliam Targo", "Pegasus"]
    },
    status: "pending"
  },
  {
    id: "VISIT-002",
    type: "farmer",
    name: "Ramesh Naidu",
    location: "Narakoduru Village",
    distance: "4.1 km away",
    priorityScore: 92,
    reason: "Cotton crop at critical boll-formation stage. High pest risk.",
    crop: "Cotton (60 days)",
    nextBestAction: {
      action: "Recommend Ampligo for Bollworm",
      rationale: "Growth stage indicates peak vulnerability to Pink Bollworm. Immediate prophylactic spray advised.",
      products: ["Ampligo"]
    },
    status: "pending"
  },
  {
    id: "VISIT-003",
    type: "retailer",
    name: "Kisan Seva Kendra",
    location: "Chebrole",
    distance: "7.8 km away",
    priorityScore: 85,
    reason: "High historical sales, upcoming Kharif preparation.",
    inventoryStatus: "Optimal",
    nextBestAction: {
      action: "Introduce Miravis Duo pre-booking",
      rationale: "They are a premium buyer. Secure early booking for the upcoming chili season.",
      products: ["Miravis Duo"]
    },
    status: "pending"
  }
];
