export const MONTHS = ["2026-08", "2026-07", "2026-06", "2026-05", "2026-04"];

export const monthLabel = (m) =>
  new Date(`${m}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

export const dateLabel = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { day: "2-digit", month: "short", weekday: "short" });

export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const EMPLOYEES = [
  { _id: "e1", name: "Arjun Mehta", role: "Field Executive", lifetimePoints: 4820, monthly: [
    { month: "2026-08", points: 320, fine: 250, bonus: 1500, leaveDates: ["2026-08-03"] },
    { month: "2026-07", points: 410, fine: 0, bonus: 2200, leaveDates: ["2026-07-11", "2026-07-12"] },
    { month: "2026-06", points: 275, fine: 500, bonus: 800, leaveDates: ["2026-06-05", "2026-06-19", "2026-06-20"] },
    { month: "2026-05", points: 390, fine: 150, bonus: 1800, leaveDates: [] },
    { month: "2026-04", points: 355, fine: 0, bonus: 1200, leaveDates: ["2026-04-14"] },
  ]},
  { _id: "e2", name: "Priya Nair", role: "Property Manager", lifetimePoints: 6120, monthly: [
    { month: "2026-08", points: 465, fine: 0, bonus: 2600, leaveDates: [] },
    { month: "2026-07", points: 430, fine: 200, bonus: 2100, leaveDates: ["2026-07-22"] },
    { month: "2026-06", points: 480, fine: 0, bonus: 2800, leaveDates: ["2026-06-09"] },
    { month: "2026-05", points: 300, fine: 750, bonus: 600, leaveDates: ["2026-05-02", "2026-05-03", "2026-05-04"] },
    { month: "2026-04", points: 410, fine: 100, bonus: 1700, leaveDates: ["2026-04-25"] },
  ]},
  { _id: "e3", name: "Rahul Verma", role: "Watchman Supervisor", lifetimePoints: 3980, monthly: [
    { month: "2026-08", points: 240, fine: 400, bonus: 700, leaveDates: ["2026-08-01", "2026-08-02"] },
    { month: "2026-07", points: 315, fine: 150, bonus: 1100, leaveDates: ["2026-07-17"] },
    { month: "2026-06", points: 360, fine: 0, bonus: 1500, leaveDates: [] },
    { month: "2026-05", points: 285, fine: 300, bonus: 900, leaveDates: ["2026-05-28"] },
    { month: "2026-04", points: 330, fine: 0, bonus: 1300, leaveDates: ["2026-04-08", "2026-04-09"] },
  ]},
  { _id: "e4", name: "Sneha Kulkarni", role: "Support Executive", lifetimePoints: 5240, monthly: [
    { month: "2026-08", points: 380, fine: 100, bonus: 1900, leaveDates: ["2026-08-06"] },
    { month: "2026-07", points: 395, fine: 0, bonus: 2000, leaveDates: [] },
    { month: "2026-06", points: 340, fine: 250, bonus: 1400, leaveDates: ["2026-06-13", "2026-06-14"] },
    { month: "2026-05", points: 420, fine: 0, bonus: 2400, leaveDates: ["2026-05-21"] },
    { month: "2026-04", points: 290, fine: 550, bonus: 700, leaveDates: ["2026-04-02", "2026-04-30"] },
  ]},
  { _id: "e5", name: "Imran Sheikh", role: "Field Executive", lifetimePoints: 2760, monthly: [
    { month: "2026-08", points: 210, fine: 300, bonus: 500, leaveDates: ["2026-08-04", "2026-08-05"] },
    { month: "2026-07", points: 260, fine: 150, bonus: 900, leaveDates: ["2026-07-09"] },
    { month: "2026-06", points: 295, fine: 0, bonus: 1200, leaveDates: [] },
    { month: "2026-05", points: 245, fine: 400, bonus: 600, leaveDates: ["2026-05-15", "2026-05-16"] },
    { month: "2026-04", points: 310, fine: 0, bonus: 1000, leaveDates: ["2026-04-18"] },
  ]},
];
