export const INDUSTRIES = [
  "Accountants", "Accounting Services", "Advertising Agencies", "Aerospace Companies", "Agriculture", "Air Conditioning Services", "Airport Services", "Architects", "Art Galleries", "Associations", "Attorneys", "Audio Visual Services", "Auto Repair", "Automation Services", "Automotive Dealers", "Aviation Services", "Bail Bonds", "Bakeries", "Banks", "Barber Shops", "Bars", "Beauty Salons", "Beverage Companies", "Bicycle Shops", "Biotechnology", "Bookkeeping", "Breweries", "Business Consulting", "Car Rental", "Car Wash", "Cargo Services", "Catering", "Chemical Companies", "Child Care", "Chiropractors", "Cleaning Services", "Clothing Stores", "Commercial Real Estate", "Computer Repair", "Construction", "Consultants", "Contractors", "Counseling Services", "Courier Services", "Data Analytics", "Day Care", "Dental Clinics", "Dentists", "Dry Cleaning", "Education", "Electrical Services", "Electronics Stores", "Employment Agencies", "Engineering Services", "Entertainment", "Event Planning", "Exterminators", "Family Law", "Financial Advisors", "Financial Planning", "Fitness Centers", "Flooring Services", "Florists", "Food Processing", "Furniture Stores", "Gaming Companies", "Garden Centers", "Gas Stations", "General Contractors", "Graphic Design", "Gyms", "Hair Salons", "Handyman Services", "Hardware Stores", "Healthcare", "Heating & AC", "Home Builders", "Home Improvement", "Hospitals", "Hotels", "Insurance Agencies", "Interior Design", "Investment Firms", "IT Services", "Janitorial Services", "Jewelry Stores", "Kitchen & Bath", "Landscaping", "Law Firms", "Lawyers", "Libraries", "Lighting Services", "Limousine Services", "Locksmiths", "Logistics", "Manufacturing", "Marketing Agencies", "Massage Therapy", "Medical Clinics", "Mental Health", "Mortgage Brokers", "Moving Companies", "Museums", "Music Stores", "Nail Salons", "Non-Profit Organizations", "Nursing Homes", "Office Supplies", "Optometrists", "Orthodontists", "Painting Services", "Paving Services", "Pest Control", "Pet Services", "Pharmacies", "Photography", "Physical Therapy", "Plumbers", "Plumbing Services", "Printing Services", "Psychologists", "Public Relations", "Real Estate", "Real Estate Agencies", "Recruiting Agencies", "Relocation Services", "Remodeling Services", "Restaurants", "Retail Stores", "Roofing Services", "Security Systems", "Self Storage", "Shipping Services", "Sign Companies", "Software Development", "Solar Energy", "Spas", "Sporting Goods", "Staffing Services", "Tailors", "Tattoo Parlors", "Tax Preparation", "Telecommunications", "Title Companies", "Towing Services", "Transportation", "Travel Agencies", "Trucking Companies", "Upholstery", "Venture Capital", "Veterinarians", "Video Production", "Warehousing", "Waste Management", "Web Design", "Web Development", "Wedding Services", "Wellness Centers", "Window Cleaning", "Yoga Studios"
];

export const GEOGRAPHY: { [country: string]: string[] } = {
  // GCC
  "United Arab Emirates": [
    "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"
  ],
  "Saudi Arabia": [
    "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Hofuf", "Taif", "Tabuk", "Buraydah", "Qatif", "Abha"
  ],
  "Kuwait": ["Kuwait City", "Jahra", "Al Ahmadi", "Hawalli", "Mubarak Al-Kabeer"],
  "Qatar": ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Lusail"],
  "Bahrain": ["Manama", "Riffa", "Muharraq", "Hamad Town", "Isa Town"],
  "Oman": ["Muscat", "Salalah", "Seeb", "Bawshar", "Sohar", "Suwayq"],
  
  // Arabic (Non-GCC)
  "Egypt": [
    "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Mansoura", "Tanta", "Asyut", "Ismailia", "Fayyum"
  ],
  "Jordan": ["Amman", "Zarqa", "Irbid", "Aqaba", "Salt", "Madaba"],
  "Lebanon": ["Beirut", "Tripoli", "Sidon", "Tyre", "Byblos", "Jounieh"],
  "Morocco": ["Casablanca", "Rabat", "Marrakesh", "Fes", "Tangier", "Agadir"],
  "Tunisia": ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabes"],
  "Algeria": ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna"],
  "Iraq": ["Baghdad", "Basra", "Mosul", "Erbil", "Kirkuk", "Najaf"],
  "Palestine": ["Gaza City", "Ramallah", "Hebron", "Nablus", "Jericho", "Jenin"],
  "Libya": ["Tripoli", "Benghazi", "Misrata", "Bayda", "Zawiya", "Tobruk"],
  "Syria": ["Damascus", "Aleppo", "Homs", "Latakia", "Hama", "Tartus"],
  "Sudan": ["Khartoum", "Omdurman", "Port Sudan", "Kassala", "El Obeid"],

  // International
  "United States": [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington D.C.", "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis"
  ],
  "United Kingdom": [
    "London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Sheffield", "Edinburgh", "Bristol", "Leicester", "Cardiff", "Belfast", "Coventry", "Nottingham", "Newcastle", "Southampton", "Reading", "Derby", "Oxford", "Cambridge", "Brighton"
  ],
  "Canada": [
    "Toronto", "Montreal", "Vancouver", "Ottawa", "Calgary", "Edmonton", "Quebec City", "Winnipeg", "Hamilton", "Kitchener", "London", "Victoria", "Halifax", "Oshawa", "Windsor", "Saskatoon", "Regina"
  ],
  "Australia": [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Logan City", "Geelong", "Hobart", "Townsville", "Cairns", "Darwin"
  ],
  "Germany": [
    "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Dusseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg", "Bochum"
  ],
  "France": [
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Saint-Etienne", "Le Havre", "Toulon", "Grenoble"
  ],
  "Italy": [
    "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania", "Venice", "Verona", "Messina", "Padua", "Trieste", "Brescia"
  ],
  "Spain": [
    "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Malaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Cordoba", "Valladolid", "Vigo", "Gijon", "L'Hospitalet"
  ],
  "Japan": [
    "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kyoto", "Kawasaki", "Saitama", "Hiroshima", "Sendai", "Chiba", "Kitakyushu"
  ],
  "India": [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal"
  ],
  "Brazil": [
    "Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Goiania", "Belem", "Porto Alegre"
  ],
  "Mexico": [
    "Mexico City", "Ecatepec", "Guadalajara", "Puebla", "Juarez", "Tijuana", "Leon", "Zapopan", "Monterrey", "Nezahualcoyotl", "Chihuahua", "Merida"
  ],
  "South Africa": [
    "Johannesburg", "Cape Town", "Ethekwini", "Ekurhuleni", "Tshwane", "Nelson Mandela Bay", "Buffalo City", "Mangaung", "Msunduzi"
  ],
  "Netherlands": [
    "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen", "Enschede"
  ],
  "Singapore": ["Singapore"],
  "New Zealand": [
    "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Napier-Hastings", "Dunedin", "Palmerston North"
  ],
  "Ireland": [
    "Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk", "Swords", "Bray", "Navan"
  ],
  "Sweden": [
    "Stockholm", "Gothenburg", "Malmo", "Uppsala", "Vasteras", "Orebro", "Linkoping", "Helsingborg", "Jonkoping", "Norrkoping"
  ],
  "Norway": [
    "Oslo", "Bergen", "Stavanger", "Trondheim", "Fredrikstad", "Drammen", "Porsgrunn", "Kristiansand", "Tromso"
  ]
};

const GCC_LIST = ["United Arab Emirates", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman"];
const ARABIC_LIST = [
  "Egypt", "Jordan", "Lebanon", "Morocco", "Tunisia", "Algeria", "Iraq", 
  "Palestine", "Libya", "Syria", "Sudan"
];

const INTERNATIONAL_LIST = Object.keys(GEOGRAPHY).filter(c => !GCC_LIST.includes(c) && !ARABIC_LIST.includes(c)).sort();

export const COUNTRIES = [...GCC_LIST, ...ARABIC_LIST, ...INTERNATIONAL_LIST];
