import { supabase } from './supabase';

/**
 * Complete real IPL 2025 player dataset.
 * Each player object has:
 *  name        → string
 *  role        → 'batsman' | 'bowler' | 'allrounder' | 'wk'
 *  base_price  → number in Lakhs (e.g. 200 = ₹2 Cr, 150 = ₹1.5 Cr, 75 = ₹75 L, 30 = ₹30 L)
 *  country     → string
 *  ipl_team    → string (IPL 2025 team they were sold to, or 'Unsold')
 *  sold_price  → number in Lakhs (actual IPL 2025 auction price, 0 if unsold)
 */

export const IPL_2025_PLAYERS = [

  // ─── MARQUEE / ₹200L BASE PRICE ───────────────────────────────────────────

  { name: "Rishabh Pant",        role: "wk",          base_price: 200, country: "India",       ipl_team: "Lucknow Super Giants",   sold_price: 2700 },
  { name: "Shreyas Iyer",        role: "batsman",     base_price: 200, country: "India",       ipl_team: "Punjab Kings",           sold_price: 2675 },
  { name: "KL Rahul",            role: "wk",          base_price: 200, country: "India",       ipl_team: "Delhi Capitals",         sold_price: 1400 },
  { name: "Arshdeep Singh",      role: "bowler",      base_price: 200, country: "India",       ipl_team: "Punjab Kings",           sold_price: 1800 },
  { name: "Yuzvendra Chahal",    role: "bowler",      base_price: 200, country: "India",       ipl_team: "Punjab Kings",           sold_price: 1800 },
  { name: "Mohammed Shami",      role: "bowler",      base_price: 200, country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 1000 },
  { name: "Mitchell Starc",      role: "bowler",      base_price: 200, country: "Australia",   ipl_team: "Delhi Capitals",         sold_price: 1100 },
  { name: "Jofra Archer",        role: "bowler",      base_price: 200, country: "England",     ipl_team: "Mumbai Indians",         sold_price: 1700 },
  { name: "Jos Buttler",         role: "wk",          base_price: 200, country: "England",     ipl_team: "Gujarat Titans",         sold_price: 1500 },
  { name: "Kagiso Rabada",       role: "bowler",      base_price: 200, country: "South Africa",ipl_team: "Gujarat Titans",         sold_price: 1000 },
  { name: "Liam Livingstone",    role: "allrounder",  base_price: 200, country: "England",     ipl_team: "Royal Challengers Bengaluru", sold_price: 800 },
  { name: "Venkatesh Iyer",      role: "allrounder",  base_price: 200, country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 2325 },
  { name: "Ishan Kishan",        role: "wk",          base_price: 200, country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 1100 },
  { name: "Mukesh Kumar",        role: "bowler",      base_price: 200, country: "India",       ipl_team: "Delhi Capitals",         sold_price: 200  },
  { name: "Bhuvneshwar Kumar",   role: "bowler",      base_price: 200, country: "India",       ipl_team: "Royal Challengers Bengaluru", sold_price: 1000 },
  { name: "Prasidh Krishna",     role: "bowler",      base_price: 200, country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 825  },
  { name: "T. Natarajan",        role: "bowler",      base_price: 200, country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 1050 },
  { name: "Devdutt Padikkal",    role: "batsman",     base_price: 200, country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 1400 },
  { name: "Washington Sundar",   role: "allrounder",  base_price: 200, country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 325  },
  { name: "Shardul Thakur",      role: "allrounder",  base_price: 200, country: "India",       ipl_team: "Chennai Super Kings",    sold_price: 325  },
  { name: "Mohammed Siraj",      role: "bowler",      base_price: 200, country: "India",       ipl_team: "Royal Challengers Bengaluru", sold_price: 1200 },
  { name: "Harshal Patel",       role: "bowler",      base_price: 200, country: "India",       ipl_team: "Punjab Kings",           sold_price: 1000 },
  { name: "Krunal Pandya",       role: "allrounder",  base_price: 200, country: "India",       ipl_team: "Mumbai Indians",         sold_price: 550  },
  { name: "Avesh Khan",          role: "bowler",      base_price: 200, country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 200  },

  // ─── ₹150L BASE PRICE ─────────────────────────────────────────────────────

  { name: "David Miller",        role: "batsman",     base_price: 150, country: "South Africa",ipl_team: "Rajasthan Royals",       sold_price: 1000 },
  { name: "Rachin Ravindra",     role: "allrounder",  base_price: 150, country: "New Zealand", ipl_team: "Chennai Super Kings",    sold_price: 425  },
  { name: "Rovman Powell",       role: "batsman",     base_price: 150, country: "West Indies", ipl_team: "Delhi Capitals",         sold_price: 150  },
  { name: "Ajinkya Rahane",      role: "batsman",     base_price: 150, country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 150  },
  { name: "Nitish Rana",         role: "allrounder",  base_price: 150, country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 150  },
  { name: "Trent Boult",         role: "bowler",      base_price: 150, country: "New Zealand", ipl_team: "Mumbai Indians",         sold_price: 1250 },

  // ─── ₹125L BASE PRICE ─────────────────────────────────────────────────────

  { name: "Gerald Coetzee",      role: "bowler",      base_price: 125, country: "South Africa",ipl_team: "Kolkata Knight Riders",  sold_price: 125  },
  { name: "Marco Jansen",        role: "allrounder",  base_price: 125, country: "South Africa",ipl_team: "Sunrisers Hyderabad",    sold_price: 125  },

  // ─── ₹100L BASE PRICE ─────────────────────────────────────────────────────

  { name: "Jitesh Sharma",       role: "wk",          base_price: 100, country: "India",       ipl_team: "Royal Challengers Bengaluru", sold_price: 1100 },
  { name: "Rahul Chahar",        role: "bowler",      base_price: 100, country: "India",       ipl_team: "Chennai Super Kings",    sold_price: 100  },
  { name: "Akash Singh",         role: "bowler",      base_price: 100, country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 100  },
  { name: "Shahbaz Ahamad",      role: "allrounder",  base_price: 100, country: "India",       ipl_team: "Royal Challengers Bengaluru", sold_price: 525 },
  { name: "Jason Holder",        role: "allrounder",  base_price: 100, country: "West Indies", ipl_team: "Rajasthan Royals",       sold_price: 100  },
  { name: "Kyle Jamieson",       role: "allrounder",  base_price: 100, country: "New Zealand", ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Jaydev Unadkat",      role: "bowler",      base_price: 100, country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Manish Pandey",       role: "batsman",     base_price: 100, country: "India",       ipl_team: "Unsold",                 sold_price: 0    },

  // ─── ₹75L BASE PRICE ──────────────────────────────────────────────────────

  { name: "Rohit Sharma",        role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Mumbai Indians",         sold_price: 75   },
  { name: "MS Dhoni",            role: "wk",          base_price: 75,  country: "India",       ipl_team: "Chennai Super Kings",    sold_price: 75   },
  { name: "Virat Kohli",         role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Royal Challengers Bengaluru", sold_price: 75 },
  { name: "Sunil Narine",        role: "allrounder",  base_price: 75,  country: "West Indies", ipl_team: "Kolkata Knight Riders",  sold_price: 75   },
  { name: "Hardik Pandya",       role: "allrounder",  base_price: 75,  country: "India",       ipl_team: "Mumbai Indians",         sold_price: 75   },
  { name: "Rishabh Pant",        role: "wk",          base_price: 75,  country: "India",       ipl_team: "Lucknow Super Giants",   sold_price: 2700 },
  { name: "Shubman Gill",        role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Gujarat Titans",         sold_price: 75   },
  { name: "Yashasvi Jaiswal",    role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 75   },
  { name: "Sanju Samson",        role: "wk",          base_price: 75,  country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 75   },
  { name: "Pat Cummins",         role: "allrounder",  base_price: 75,  country: "Australia",   ipl_team: "Sunrisers Hyderabad",    sold_price: 75   },
  { name: "Travis Head",         role: "batsman",     base_price: 75,  country: "Australia",   ipl_team: "Sunrisers Hyderabad",    sold_price: 75   },
  { name: "Heinrich Klaasen",    role: "wk",          base_price: 75,  country: "South Africa",ipl_team: "Sunrisers Hyderabad",    sold_price: 75   },
  { name: "Rashid Khan",         role: "bowler",      base_price: 75,  country: "Afghanistan", ipl_team: "Gujarat Titans",         sold_price: 75   },
  { name: "Mohammed Shami",      role: "bowler",      base_price: 75,  country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 1000 },
  { name: "Axar Patel",          role: "allrounder",  base_price: 75,  country: "India",       ipl_team: "Delhi Capitals",         sold_price: 75   },
  { name: "N. Tilak Varma",      role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Mumbai Indians",         sold_price: 75   },
  { name: "Surya Kumar Yadav",   role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Mumbai Indians",         sold_price: 75   },
  { name: "Ruturaj Gaikwad",     role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Chennai Super Kings",    sold_price: 75   },
  { name: "Deepak Chahar",       role: "bowler",      base_price: 75,  country: "India",       ipl_team: "Chennai Super Kings",    sold_price: 75   },
  { name: "Prithvi Shaw",        role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Sarfaraz Khan",       role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Rishabh Pant",        role: "wk",          base_price: 75,  country: "India",       ipl_team: "Lucknow Super Giants",   sold_price: 2700 },
  { name: "Phil Salt",           role: "batsman",     base_price: 75,  country: "England",     ipl_team: "Kolkata Knight Riders",  sold_price: 75   },
  { name: "Tim David",           role: "allrounder",  base_price: 75,  country: "Singapore",   ipl_team: "Mumbai Indians",         sold_price: 75   },
  { name: "Finn Allen",          role: "wk",          base_price: 75,  country: "New Zealand", ipl_team: "Royal Challengers Bengaluru", sold_price: 75 },
  { name: "Glenn Phillips",      role: "batsman",     base_price: 75,  country: "New Zealand", ipl_team: "Gujarat Titans",         sold_price: 75   },
  { name: "Noor Ahmad",          role: "bowler",      base_price: 75,  country: "Afghanistan", ipl_team: "Chennai Super Kings",    sold_price: 75   },
  { name: "Kuldeep Yadav",       role: "bowler",      base_price: 75,  country: "India",       ipl_team: "Delhi Capitals",         sold_price: 75   },
  { name: "Mitchell Marsh",      role: "allrounder",  base_price: 75,  country: "Australia",   ipl_team: "Lucknow Super Giants",   sold_price: 225  },
  { name: "Nicholas Pooran",     role: "wk",          base_price: 75,  country: "West Indies", ipl_team: "Lucknow Super Giants",   sold_price: 75   },
  { name: "Josh Hazlewood",      role: "bowler",      base_price: 75,  country: "Australia",   ipl_team: "Royal Challengers Bengaluru", sold_price: 1225 },
  { name: "Jacob Bethell",       role: "allrounder",  base_price: 75,  country: "England",     ipl_team: "Royal Challengers Bengaluru", sold_price: 260 },
  { name: "Riyan Parag",         role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 75   },
  { name: "Aiden Markram",       role: "allrounder",  base_price: 75,  country: "South Africa",ipl_team: "Sunrisers Hyderabad",    sold_price: 75   },
  { name: "Angkrish Raghuvanshi",role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 75   },
  { name: "Rinku Singh",         role: "batsman",     base_price: 75,  country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 75   },
  { name: "Will Jacks",          role: "allrounder",  base_price: 75,  country: "England",     ipl_team: "Royal Challengers Bengaluru", sold_price: 75 },

  // ─── ₹50L BASE PRICE ──────────────────────────────────────────────────────

  { name: "Vaibhav Sooryavanshi",role: "batsman",     base_price: 50,  country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 110  },
  { name: "Mayank Markande",     role: "bowler",      base_price: 50,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Navdeep Saini",       role: "bowler",      base_price: 50,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Manav Suthar",        role: "bowler",      base_price: 50,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },

  // ─── ₹30L BASE PRICE ──────────────────────────────────────────────────────

  { name: "Jasprit Bumrah",      role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Rohit Sharma",        role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Shashank Singh",      role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Punjab Kings",           sold_price: 30   },
  { name: "Smaran Ravichandran", role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Abhinandan Singh",    role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Nitish Kumar Reddy",  role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 30   },
  { name: "Vyshak Vijaykumar",   role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Royal Challengers Bengaluru", sold_price: 30 },
  { name: "Rahul Tewatia",       role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Gujarat Titans",         sold_price: 30   },
  { name: "Salil Arora",         role: "wk",          base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Nehal Wadhera",       role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Punjab Kings",           sold_price: 30   },
  { name: "Abdul Samad",         role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 30   },
  { name: "Anshul Kamboj",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Chennai Super Kings",    sold_price: 30   },
  { name: "Mohsin Khan",         role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Dewald Brevis",       role: "batsman",     base_price: 30,  country: "South Africa",ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Mohammad Izhar",      role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Harnoor Pannu",       role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Romario Shepherd",    role: "allrounder",  base_price: 30,  country: "West Indies", ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Raj Angad Bawa",      role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Kanishk Chouhan",     role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "George Linde",        role: "bowler",      base_price: 30,  country: "South Africa",ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Kwena Maphaka",       role: "bowler",      base_price: 30,  country: "South Africa",ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Prashant Veer",       role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Rehan Ahmed",         role: "bowler",      base_price: 30,  country: "England",     ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Aniket Verma",        role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Karun Nair",          role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Akeal Hosein",        role: "bowler",      base_price: 30,  country: "West Indies", ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Shimron Hetmyer",     role: "batsman",     base_price: 30,  country: "West Indies", ipl_team: "Rajasthan Royals",       sold_price: 30   },
  { name: "Matthew William Short",role:"allrounder",  base_price: 30,  country: "Australia",   ipl_team: "Delhi Capitals",         sold_price: 30   },
  { name: "Daksh Kamra",         role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Ashok Sharma",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Harpreet Brar",       role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Punjab Kings",           sold_price: 30   },
  { name: "Arshin Kulkarni",     role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Vicky Ostwal",        role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 30   },
  { name: "Ajay Mandal",         role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Ishant Sharma",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Rahul Tripathi",      role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Kumar Kushagra",      role: "wk",          base_price: 30,  country: "India",       ipl_team: "Delhi Capitals",         sold_price: 30   },
  { name: "Jacob Duffy",         role: "bowler",      base_price: 30,  country: "New Zealand", ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Ravindra Jadeja",     role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Chennai Super Kings",    sold_price: 30   },
  { name: "Quinton de Kock",     role: "wk",          base_price: 30,  country: "South Africa",ipl_team: "Kolkata Knight Riders",  sold_price: 30   },
  { name: "Ayush Badoni",        role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Yudhvir Singh Charak",role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Priyansh Arya",       role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Punjab Kings",           sold_price: 30   },
  { name: "Connor Esterhuizen",  role: "batsman",     base_price: 30,  country: "South Africa",ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Anrich Nortje",       role: "bowler",      base_price: 30,  country: "South Africa",ipl_team: "Delhi Capitals",         sold_price: 30   },
  { name: "Sushant Mishra",      role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Arjun Tendulkar",     role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Kartik Tyagi",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Rajat Patidar",       role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Royal Challengers Bengaluru", sold_price: 30 },
  { name: "Naman Tiwari",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Xavier Bartlett",     role: "bowler",      base_price: 30,  country: "Australia",   ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Sai Sudharsan",       role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Gujarat Titans",         sold_price: 30   },
  { name: "Vishal Nishad",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Satvik Deswal",       role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Vihaan Malhotra",     role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Mukesh Choudhary",    role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Chennai Super Kings",    sold_price: 30   },
  { name: "Gurnoor Singh Brar",  role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Punjab Kings",           sold_price: 30   },
  { name: "Lhuan-dre Pretorious",role: "wk",          base_price: 30,  country: "South Africa",ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Tripurana Vijay",     role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Akshat Raghuwanshi",  role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Vishnu Vinod",        role: "wk",          base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Anukul Roy",          role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Vipraj Nigam",        role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Praful Hinge",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Ramandeep Singh",     role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 30   },
  { name: "Shahrukh Khan",       role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 30   },
  { name: "Keshav Maharaj",      role: "bowler",      base_price: 30,  country: "South Africa",ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Musheer Khan",        role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Ravi Bishnoi",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Sameer Rizvi",        role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Lockie Ferguson",     role: "bowler",      base_price: 30,  country: "New Zealand", ipl_team: "Gujarat Titans",         sold_price: 30   },
  { name: "Brijesh Sharma",      role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Josh Inglis",         role: "wk",          base_price: 30,  country: "Australia",   ipl_team: "Punjab Kings",           sold_price: 30   },
  { name: "Sarthak Ranjan",      role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Navdeep Saini",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Ashutosh Sharma",     role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Punjab Kings",           sold_price: 30   },
  { name: "Sandeep Sharma",      role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Ryan Rickelton",      role: "wk",          base_price: 30,  country: "South Africa",ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Matt Henry",          role: "bowler",      base_price: 30,  country: "New Zealand", ipl_team: "Kolkata Knight Riders",  sold_price: 30   },
  { name: "Amit Kumar",          role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Onkar Tarmale",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Pravin Dubey",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 30   },
  { name: "Jayant Yadav",        role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Vaibhav Arora",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 30   },
  { name: "Sahil Parakh",        role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Aman Rao Perala",     role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Auqib Nabi",          role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Anuj Rawat",          role: "wk",          base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Adam Milne",          role: "bowler",      base_price: 30,  country: "New Zealand", ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Cooper Connolly",     role: "allrounder",  base_price: 30,  country: "Australia",   ipl_team: "Rajasthan Royals",       sold_price: 30   },
  { name: "Ashwani Kumar",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Lungisani Ngidi",     role: "bowler",      base_price: 30,  country: "South Africa",ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Shivam Dube",         role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Chennai Super Kings",    sold_price: 30   },
  { name: "Dilshan Madushanka",  role: "bowler",      base_price: 30,  country: "Sri Lanka",   ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Cameron Green",       role: "allrounder",  base_price: 30,  country: "Australia",   ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Yash Thakur",         role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Aman Khan",           role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Mayank Yadav",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Pyla Avinash",        role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 30   },
  { name: "Dushmantha Chameera", role: "bowler",      base_price: 30,  country: "Sri Lanka",   ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Nishant Sindhu",      role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Gujarat Titans",         sold_price: 30   },
  { name: "Kulwant Khejroliya",  role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Kamindu Mendis",      role: "allrounder",  base_price: 30,  country: "Sri Lanka",   ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Mayank Rawat",        role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Spencer Johnson",     role: "bowler",      base_price: 30,  country: "Australia",   ipl_team: "Gujarat Titans",         sold_price: 30   },
  { name: "Suyash Sharma",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 30   },
  { name: "Eshan Malinga",       role: "bowler",      base_price: 30,  country: "Sri Lanka",   ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Gurjapneet Singh",    role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Varun Chakaravarthy", role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Kolkata Knight Riders",  sold_price: 30   },
  { name: "Sherfane Rutherford", role: "batsman",     base_price: 30,  country: "West Indies", ipl_team: "Gujarat Titans",         sold_price: 30   },
  { name: "Yuzvendra Chahal",    role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Punjab Kings",           sold_price: 1800 },
  { name: "Prabhsimran Singh",   role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Punjab Kings",           sold_price: 30   },
  { name: "M. Siddharth",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Raghu Sharma",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Ishan Kishan",        role: "wk",          base_price: 30,  country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 1100 },
  { name: "Urvil Patel",         role: "wk",          base_price: 30,  country: "India",       ipl_team: "Gujarat Titans",         sold_price: 30   },
  { name: "Marcus Stoinis",      role: "allrounder",  base_price: 30,  country: "Australia",   ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Sakib Hussain",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Luke Wood",           role: "bowler",      base_price: 30,  country: "England",     ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Yash Dayal",          role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Royal Challengers Bengaluru", sold_price: 30 },
  { name: "Akash Madhwal",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Mukul Choudhary",     role: "wk",          base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Suryansh Shedge",     role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Yash Raj Punja",      role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Tristan Stubbs",      role: "wk",          base_price: 30,  country: "South Africa",ipl_team: "Sunrisers Hyderabad",    sold_price: 30   },
  { name: "Harsh Dubey",         role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 30   },
  { name: "Tejasvi Singh",       role: "wk",          base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Himmat Singh",        role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Shreyas Gopal",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Allah Ghazanfar",     role: "bowler",      base_price: 30,  country: "Afghanistan", ipl_team: "Mumbai Indians",         sold_price: 30   },
  { name: "Abishek Porel",       role: "wk",          base_price: 30,  country: "India",       ipl_team: "Delhi Capitals",         sold_price: 30   },
  { name: "Kuldeep Sen",         role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Corbin Bosch",        role: "allrounder",  base_price: 30,  country: "South Africa",ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Tim Seifert",         role: "wk",          base_price: 30,  country: "New Zealand", ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Zak Foulkes",         role: "allrounder",  base_price: 30,  country: "England",     ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Prince Yadav",        role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Mitch Owen",          role: "allrounder",  base_price: 30,  country: "Australia",   ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Mitchell Starc",      role: "bowler",      base_price: 30,  country: "Australia",   ipl_team: "Delhi Capitals",         sold_price: 1100 },
  { name: "Prashant Solanki",    role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Madhav Tiwari",       role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Krains Fuletra",      role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Zeeshan Ansari",      role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Vignesh Puthur",      role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Saurabh Dubey",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Nitish Rana",         role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 150  },
  { name: "Jitesh Sharma",       role: "wk",          base_price: 30,  country: "India",       ipl_team: "Royal Challengers Bengaluru", sold_price: 1100 },
  { name: "Sai Kishore",         role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Gujarat Titans",         sold_price: 30   },
  { name: "Swapnil Singh",       role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Shivang Kumar",       role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Danish Malewar",      role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Dasun Shanaka",       role: "allrounder",  base_price: 30,  country: "Sri Lanka",   ipl_team: "Gujarat Titans",         sold_price: 30   },
  { name: "Abhishek Sharma",     role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Sunrisers Hyderabad",    sold_price: 30   },
  { name: "Donovan Ferreira",    role: "wk",          base_price: 30,  country: "South Africa",ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Nandre Burger",       role: "bowler",      base_price: 30,  country: "South Africa",ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Matthew Breetzke",    role: "batsman",     base_price: 30,  country: "South Africa",ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Dhruv Jurel",         role: "wk",          base_price: 30,  country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 30   },
  { name: "Digvesh Singh",       role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Lucknow Super Giants",   sold_price: 30   },
  { name: "Krish Bhagat",        role: "allrounder",  base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Rasikh Dar",          role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Kartik Sharma",       role: "wk",          base_price: 30,  country: "India",       ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Pathum Nissanka",     role: "batsman",     base_price: 30,  country: "Sri Lanka",   ipl_team: "Chennai Super Kings",    sold_price: 30   },
  { name: "Shubham Dubey",       role: "batsman",     base_price: 30,  country: "India",       ipl_team: "Rajasthan Royals",       sold_price: 30   },
  { name: "Blessing Muzarabani", role: "bowler",      base_price: 30,  country: "Zimbabwe",    ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Azmatullah Omarzai",  role: "allrounder",  base_price: 30,  country: "Afghanistan", ipl_team: "Unsold",                 sold_price: 0    },
  { name: "Arshdeep Singh",      role: "bowler",      base_price: 30,  country: "India",       ipl_team: "Punjab Kings",           sold_price: 1800 },
  { name: "Pathum Nissanka",     role: "batsman",     base_price: 30,  country: "Sri Lanka",   ipl_team: "Chennai Super Kings",    sold_price: 30   },
];

/**
 * Recommended Supabase ALTER TABLE command if columns don't exist:
 * ALTER TABLE players ADD COLUMN IF NOT EXISTS ipl_team text DEFAULT 'Unsold';
 * ALTER TABLE players ADD COLUMN IF NOT EXISTS sold_price bigint DEFAULT 0;
 */

/**
 * Seeds players into Supabase 'players' table:
 * 1. Checks if count > 0 -> skips if yes
 * 2. Inserts all players in one call
 * 3. Returns inserted data or throws on error
 */
export async function seedPlayers() {
  try {
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking players table count:', countError);
      throw countError;
    }

    if (count > 0) {
      console.log(`ℹ️ Players table already contains data (${count} players). Skipping seed.`);
      return [];
    }

    const { data, error } = await supabase
      .from('players')
      .insert(IPL_2025_PLAYERS)
      .select();

    if (error) {
      console.error('Error seeding players:', error);
      throw error;
    }

    console.log(`✅ Seeded ${data.length} IPL 2025 players`);
    return data;
  } catch (err) {
    console.error('Failed to seed players:', err);
    throw err;
  }
}
