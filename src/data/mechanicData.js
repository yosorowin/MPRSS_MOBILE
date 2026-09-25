export const mockMechanicUser = {
  id: "mechanic-001",
  name: "Juan Dela Cruz",
  email: "mechanic@mprss.com",
  mobile: "+63 917 123 4567",
  role: "Mechanic",
  status: "Available",
  initials: "JD",
  completedJobsTotal: 24,
};

export const mockMechanicJobs = [
  {
    id: "SR-0012",
    customerName: "Carlos Reyes",
    motorcycle: "Honda Click 125",
    year: 2023,
    color: "Matte Black",
    plateNumber: "NCR-4821",
    vin: "MH1JF1234P0001234",
    serviceType: "CVT Replacement",
    customerIssue: "Motorcycle has unusual vibration and reduced acceleration.",
    schedule: "Sept 23, 2026",
    scheduleTime: "10:30 AM",
    assignedBy: "Shop Admin",
    assignedDate: "Sept 22, 2026",
    priority: "High",
    status: "In Progress",
    parts: [
      { name: "CVT Drive Belt", category: "Transmission", qty: 1, availability: "Available" },
      { name: "Roller Weights", category: "Transmission", qty: 1, availability: "Available" },
      { name: "Clutch Assembly", category: "Transmission", qty: 1, availability: "Available" },
    ],
    notes: [
      {
        author: "Admin",
        text: "Inspect the CVT assembly before replacement and report any additional damage.",
        timestamp: "Sept 22, 2026 • 4:15 PM",
      },
      {
        author: "Mechanic",
        text: "Initial inspection completed. Drive belt shows visible wear.",
        timestamp: "Sept 23, 2026 • 10:45 AM",
      },
    ],
  },
  {
    id: "SR-0013",
    customerName: "Maria Santos",
    motorcycle: "Yamaha Aerox 155",
    year: 2022,
    color: "Blue",
    plateNumber: "NCR-6157",
    vin: "RKRSG1234N0008912",
    serviceType: "Brake Pad Replacement",
    customerIssue: "Front brake feels weak and produces a scraping sound.",
    schedule: "Sept 23, 2026",
    scheduleTime: "1:00 PM",
    assignedBy: "Shop Admin",
    assignedDate: "Sept 22, 2026",
    priority: "Normal",
    status: "Waiting for Parts",
    parts: [
      { name: "Front Brake Pads", category: "Brakes", qty: 1, availability: "Unavailable" },
      { name: "Brake Cleaner", category: "Maintenance", qty: 1, availability: "Available" },
    ],
    notes: [
      {
        author: "Admin",
        text: "Customer requested inspection of the front disc before installation.",
        timestamp: "Sept 22, 2026 • 3:30 PM",
      },
    ],
  },
  {
    id: "SR-0014",
    customerName: "Angela Santos",
    motorcycle: "Kawasaki Ninja 400",
    year: 2021,
    color: "Green",
    plateNumber: "NCR-7720",
    vin: "MLHZX4001M0014578",
    serviceType: "Chain and Sprocket Replacement",
    customerIssue: "Chain is loose and produces noise during acceleration.",
    schedule: "Sept 23, 2026",
    scheduleTime: "3:30 PM",
    assignedBy: "Shop Admin",
    assignedDate: "Sept 23, 2026",
    priority: "Normal",
    status: "Pending",
    parts: [
      { name: "520 Chain Kit", category: "Drivetrain", qty: 1, availability: "Available" },
      { name: "Front Sprocket", category: "Drivetrain", qty: 1, availability: "Available" },
      { name: "Rear Sprocket", category: "Drivetrain", qty: 1, availability: "Available" },
    ],
    notes: [],
  },
  {
    id: "SR-0015",
    customerName: "Miguel Dela Cruz",
    motorcycle: "Honda CBR600RR",
    year: 2022,
    color: "Red",
    plateNumber: "NCR-9031",
    vin: "JH2PC4002N0011203",
    serviceType: "Oil and Filter Change",
    customerIssue: "Routine maintenance service.",
    schedule: "Sept 22, 2026",
    scheduleTime: "2:00 PM",
    assignedBy: "Shop Admin",
    assignedDate: "Sept 22, 2026",
    priority: "Normal",
    status: "Ready for Quality Check",
    parts: [
      { name: "10W-40 Engine Oil", category: "Lubricants", qty: 2, availability: "Available" },
      { name: "Oil Filter", category: "Maintenance", qty: 1, availability: "Available" },
    ],
    notes: [
      {
        author: "Mechanic",
        text: "Oil and filter replaced. No leaks observed after startup test.",
        timestamp: "Sept 22, 2026 • 3:05 PM",
      },
    ],
  },
];

export const mockMechanicNotifications = [
  {
    id: "mn-1",
    type: "NEW JOB",
    text: "A Honda CBR600RR service was assigned to you.",
    time: "10 minutes ago",
    read: false,
    jobId: "SR-0015",
  },
  {
    id: "mn-2",
    type: "JOB UPDATE",
    text: "Service SR-0012 is scheduled for 10:30 AM today.",
    time: "35 minutes ago",
    read: false,
    jobId: "SR-0012",
  },
  {
    id: "mn-3",
    type: "PARTS",
    text: "Front brake pads for SR-0013 are currently unavailable.",
    time: "1 hour ago",
    read: false,
    jobId: "SR-0013",
  },
  {
    id: "mn-4",
    type: "ADMIN MESSAGE",
    text: "Please inspect the front disc before installing new pads.",
    time: "Yesterday",
    read: true,
    jobId: "SR-0013",
  },
];

export function statusColor(status) {
  switch (status) {
    case "In Progress":
      return { bg: "#E5E7EB", text: "#374151" };
    case "Waiting for Parts":
      return { bg: "#FEF3C7", text: "#92400E" };
    case "Ready for Quality Check":
      return { bg: "#DBEAFE", text: "#1D4ED8" };
    case "Completed":
      return { bg: "#DCFCE7", text: "#166534" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280" };
  }
}

export function availabilityColor(availability) {
  switch (availability) {
    case "Available":
      return { bg: "#DCFCE7", text: "#166534" };
    case "Low Stock":
      return { bg: "#FEF3C7", text: "#92400E" };
    default:
      return { bg: "#FEE2E2", text: "#991B1B" };
  }
}
