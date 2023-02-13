const department = [
  {
    id: 0,
    label: "Corporate",
  },
  {
    id: 10,
    label: "Corporate Common",
  },
  {
    id: 11,
    label: "Corporate Planning",
  },
  {
    id: 20,
    label: "Office of the President/CEO",
  },
  {
    id: 30,
    label: "Office of the Vice-President/COO",
  },
  {
    id: 40,
    label: "Office Administration",
  },
  {
    id: 42,
    label: "Community Relations",
  },
  {
    id: 43,
    label: "Permits and Licenses",
  },
  {
    id: 100,
    label: "Finance",
  },
  {
    id: 110,
    label: "Finance Common",
  },
  {
    id: 120,
    label: "Cost and Budget",
  },
  {
    id: 130,
    label: "Accounting Services",
  },
  {
    id: 140,
    label: "Inventory Group",
  },
  {
    id: 150,
    label: "Retail Inventory Management",
  },
  {
    id: 160,
    label: "Sales and Inv. Services - F&B",
  },
  {
    id: 200,
    label: "Human Resources",
  },
  {
    id: 210,
    label: "Human Resources Common",
  },
  {
    id: 220,
    label: "Salary Administration",
  },
  {
    id: 230,
    label: "Benefits Administration",
  },
  {
    id: 231,
    label: "Mandatories",
  },
  {
    id: 232,
    label: "Medical",
  },
  {
    id: 233,
    label: "Dental Clinic",
  },
  {
    id: 234,
    label: "Labor Relations",
  },
  {
    id: 240,
    label: "Training & Development",
  },
  {
    id: 250,
    label: "Recruitment",
  },
  {
    id: 300,
    label: "Treasury",
  },
  {
    id: 400,
    label: "Audit",
  },
  {
    id: 500,
    label: "Property Management Group",
  },
  {
    id: 510,
    label: "Property Management Common",
  },
  {
    id: 520,
    label: "Buildings & Construction",
  },
  {
    id: 530,
    label: "Machineries & Equipment",
  },
  {
    id: 540,
    label: "Engineering Services & Warehousing",
  },
  {
    id: 600,
    label: "Purchasing",
  },
  {
    id: 700,
    label: "Management Information System",
  },
  {
    id: 701,
    label: "Management Information System Common",
  },
  {
    id: 710,
    label: "Hardware and Maintenance",
  },
  {
    id: 711,
    label: "System Support",
  },
  {
    id: 712,
    label: "System Infrastructure",
  },
  {
    id: 713,
    label: "Mobile and Web Development",
  },
  {
    id: 714,
    label: "Data and Admin",
  },
  {
    id: 715,
    label: "Process Automation",
  },
  {
    id: 716,
    label: "Enterprise Systems and Applications",
  },
  {
    id: 717,
    label: "System Analysis and Design",
  },
  {
    id: 800,
    label: "Tax Documentation",
  },
  {
    id: 900,
    label: "Technical Services and Quality Assurance",
  },
  {
    id: 920,
    label: "Biolab Services",
  },
  {
    id: 2000,
    label: "Feedmill Operations",
  },
  {
    id: 2100,
    label: "Feedmill Production",
  },
  {
    id: 2101,
    label: "Feedmill RM Warehouse",
  },
  {
    id: 2102,
    label: "Feedmill FG Warehouse",
  },
  {
    id: 2103,
    label: "Feedmill Logistics",
  },
  {
    id: 2104,
    label: "Feedmill QARD",
  },
  {
    id: 2105,
    label: "Feedmill Services",
  },
  {
    id: 2200,
    label: "Pharmacy",
  },
  {
    id: 2250,
    label: "Research & Development (Feedmill)",
  },
  {
    id: 2300,
    label: "TSQA - Animal Production",
  },
  {
    id: 3000,
    label: "Broiler Operations",
  },
  {
    id: 3100,
    label: "Broiler Farms",
  },
  {
    id: 3120,
    label: "Broiler Farms - Area 1",
  },
  {
    id: 3130,
    label: "Broiler Farms - Area 2",
  },
  {
    id: 3200,
    label: "Hatchery Farms",
  },
  {
    id: 3300,
    label: "Broiler Breeding Farms",
  },
  {
    id: 3320,
    label: "Layer Farms",
  },
  {
    id: 3330,
    label: "Native Chicken Breeder Farms",
  },
  {
    id: 4000,
    label: "Swine Operations",
  },
  {
    id: 4100,
    label: "Swine Production Common",
  },
  {
    id: 4200,
    label: "Swine Breeder Farms",
  },
  {
    id: 4300,
    label: "Swine Fattener Farms",
  },
  {
    id: 5000,
    label: "Meatshop Administration",
  },
  {
    id: 6001,
    label: "Meatshop Production",
  },
  {
    id: 6002,
    label: "Central Depot Services & Control",
  },
  {
    id: 6003,
    label: "Plant Maintenance",
  },
  {
    id: 6004,
    label: "Sanitation",
  },
  {
    id: 6100,
    label: "Basic Process",
  },
  {
    id: 6200,
    label: "Further Process",
  },
  {
    id: 6300,
    label: "Value Added Products",
  },
  {
    id: 6400,
    label: "Warehouse",
  },
  {
    id: 6500,
    label: "Logistics",
  },
  {
    id: 6510,
    label: "Logistics - Production - Basic",
  },
  {
    id: 6520,
    label: "Logistics - Production - Further",
  },
  {
    id: 6600,
    label: "Inventory, Planning & Preparation",
  },
  {
    id: 7000,
    label: "Sales Department",
  },
  {
    id: 7001,
    label: "Sales and Marketing Services",
  },
  {
    id: 7002,
    label: "Marketing",
  },
  {
    id: 7003,
    label: "Logistics - Production - Store",
  },
  {
    id: 7004,
    label: "Research & Development",
  },
  {
    id: 7005,
    label: "TSQA - Meatshop",
  },
  {
    id: 7006,
    label: "Employee Transport Services",
  },
  {
    id: 7007,
    label: "FO - Retail",
  },
  {
    id: 7008,
    label: "Brand Marketing Management",
  },
  {
    id: 7009,
    label: "Business Development Management",
  },
  {
    id: 7010,
    label: "Trade Marketing",
  },
  {
    id: 7011,
    label: "Consumer Insight & Research",
  },
  {
    id: 7100,
    label: "HRI",
  },
  {
    id: 7200,
    label: "General Trade Distributorship",
  },
  {
    id: 7201,
    label: "SFO",
  },
  {
    id: 7203,
    label: "Corporate Key Accounts",
  },
  {
    id: 7204,
    label: "Franchise - (Franchisee)",
  },
  {
    id: 7205,
    label: "Food & Beverages - A",
  },
  {
    id: 7206,
    label: "Food & Beverages - B",
  },
  {
    id: 7207,
    label: "Modern Trade Distributorship",
  },
  {
    id: 7211,
    label: "SFO 1",
  },
  {
    id: 7212,
    label: "SFO 2",
  },
  {
    id: 7213,
    label: "SFO 3",
  },
  {
    id: 7301,
    label: "Region A",
  },
  {
    id: 7302,
    label: "Region B",
  },
  {
    id: 7303,
    label: "Region C",
  },
  {
    id: 7310,
    label: "Area 1",
  },
  {
    id: 7320,
    label: "Area 2",
  },
  {
    id: 7330,
    label: "Area 3",
  },
  {
    id: 7340,
    label: "Area 4",
  },
  {
    id: 7350,
    label: "Area 5",
  },
  {
    id: 7360,
    label: "Area 6",
  },
  {
    id: 7370,
    label: "Area 7",
  },
  {
    id: 7380,
    label: "Area 8",
  },
  {
    id: 7390,
    label: "Area 9",
  },
  {
    id: 7400,
    label: "Area 10",
  },
  {
    id: 7410,
    label: "Area 11",
  },
  {
    id: 7420,
    label: "Area 12",
  },
  {
    id: 7430,
    label: "Area 13",
  },
  {
    id: 7440,
    label: "Area 14",
  },
];

module.exports = department;
