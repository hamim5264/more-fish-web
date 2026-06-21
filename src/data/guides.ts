// H:\DMA Hamim\DMA-Web-App\src\data\guides.ts

export interface GuideItem {
  title: string;
  desc: string;
}

export interface DiseaseItem {
  id: string;
  name: string;
  bengaliName: string;
  category: 'bacterial_viral' | 'parasitic' | 'environmental';
  symptoms: string[];
  treatment: string;
  preventive: string;
}

export const guidesData = {
  en: {
    pond: {
      title: "Pond Management",
      selection: {
        title: "Pond Selection Criteria",
        items: [
          { title: "Optimal Sunlight", desc: "Ensure a minimum of 6–8 hours of direct sunlight daily to encourage natural plankton growth." },
          { title: "Raised Banks", desc: "Build raised, sturdy banks to prevent agricultural runoff and flooding during heavy rains." },
          { title: "Water Controls", desc: "Install proper inlet and outlet structures with meshes to regulate water level and prevent wild fish entry." }
        ]
      },
      preparation: {
        title: "Pond Preparation Steps",
        items: [
          { title: "1. Drying & Liming", desc: "Dry the pond bed for 7–10 days until cracks appear. Apply quicklime or agricultural lime at 200–500 kg/ha to disinfect the soil and stabilize pH." },
          { title: "2. Fertilization", desc: "Apply cow dung (organic manure), Urea, and TSP (Triple Superphosphate) to stimulate natural phytoplankton and zooplankton bloom." },
          { title: "3. Water Filling & Aeration", desc: "Fill the water gradually (initially up to 3–4 feet). Setup and test aerator systems to secure optimal dissolved oxygen levels before stocking." }
        ]
      },
      cycle: {
        title: "Farming Cycle Steps",
        items: [
          { title: "Pond Selection", desc: "Select a suitable clay-loam soil location with a reliable water source." },
          { title: "Soil & Water Prep", desc: "Dry, lime, fertilize, fill water, and wait for green plankton to appear." },
          { title: "Seed Stocking", desc: "Purchase certified disease-free fingerlings, acclimate them, and release during cool hours." },
          { title: "Feeding & Monitoring", desc: "Feed supplementary diet twice daily, monitor parameters via IoT devices, and clean waste." },
          { title: "Growth Sampling", desc: "Perform bi-weekly net testing to measure average body weight and adjust feed ration." },
          { title: "Harvesting & Sale", desc: "Carry out partial or complete harvesting, maintain water quality during netting, and transport to market." }
        ]
      }
    },
    feed: {
      title: "Feed Management",
      types: {
        title: "Types of Feed",
        natural: {
          title: "Natural Feed (Algae & Plankton)",
          desc: "Phytoplankton (microscopic green algae) and Zooplankton (rotifers, daphnia) grown naturally via fertilization. Essential source of proteins and micronutrients for young fry."
        },
        supplementary: {
          title: "Supplementary Feed (Pellets & Powder)",
          desc: "Formulated feeds containing protein, lipids, carbohydrates, and minerals. Available as floating pellets (excellent for surface/mid-water feeders and monitoring feed intake) or sinking pellets (best for bottom feeders)."
        }
      },
      schedule: {
        title: "Feeding Schedule",
        desc: "Feed the fish twice daily. The first feeding is in the morning (around 8:00 AM - 9:00 AM) after dissolved oxygen starts rising. The second feeding is in the late afternoon (around 4:00 PM - 5:00 PM) before sunset. Avoid feeding at night when oxygen levels drop naturally."
      },
      methods: {
        title: "Feeding Methods",
        items: [
          { title: "Broadcasting (Hand Throwing)", desc: "Scattering feed evenly across the pond surface. Simple, but can lead to feed wastage if not distributed carefully." },
          { title: "Feeding Trays & Cages", desc: "Placing feed in suspended trays or submerged cages. Helps inspect how much food is consumed and check fish appetite." },
          { title: "Floating vs Sinking Logic", desc: "Use floating feed to observe feeding behavior and adjust quantity. Sinking feed is cheaper but harder to monitor and can pollute the pond bottom if overfed." }
        ]
      },
      calculator: {
        title: "Daily Feed Calculator",
        stageLabel: "Growth Stage",
        weightLabel: "Total Fish Biomass (kg)",
        calculateBtn: "Calculate Feed",
        resultTitle: "Estimated Daily Feed Quantity",
        resultDesc: "Based on scientific standards. Divide this total into morning and afternoon feedings.",
        stages: [
          { name: "Fry / Fingerlings (8–10% of body weight)", rate: 0.09, desc: "Require high protein powder or micro-pellets. Feed 3-4 times daily if possible." },
          { name: "Medium Size (4–5% of body weight)", rate: 0.045, desc: "Standard growing phase. Feed twice daily using 1.2mm - 2mm pellets." },
          { name: "Market Size (2–3% of body weight)", rate: 0.025, desc: "Finishing phase. Feed twice daily with larger floating pellets." }
        ]
      }
    }
  },
  bn: {
    pond: {
      title: "পুকুর ব্যবস্থাপনা",
      selection: {
        title: "পুকুর নির্বাচনের মানদণ্ড",
        items: [
          { title: "পর্যাপ্ত সূর্যালোক", desc: "প্রাকৃতিক প্লাঙ্কটন বৃদ্ধির জন্য প্রতিদিন কমপক্ষে ৬-৮ ঘণ্টা সরাসরি সূর্যালোক প্রয়োজন।" },
          { title: "উঁচু পাড়", desc: "ভারী বৃষ্টির সময় বন্যার পানি এবং কৃষি জমির ক্ষতিকারক রান-অফ প্রবেশ রোধ করতে উঁচু ও মজবুত পাড় তৈরি করুন।" },
          { title: "পানি নিয়ন্ত্রণ ব্যবস্থা", desc: "পানির স্তর নিয়ন্ত্রণ এবং বন্য বা অনাকাঙ্ক্ষিত মাছের প্রবেশ রোধ করতে জালসহ সঠিক ইনলেট এবং আউটলেট তৈরি করুন।" }
        ]
      },
      preparation: {
        title: "পুকুর প্রস্তুতকরণের ধাপসমূহ",
        items: [
          { title: "১. শুকানো এবং চুন প্রয়োগ", desc: "পুকুরের তলদেশ ৭-১০ দিন শুকিয়ে ফাটল ধরান। মাটির জীবাণু ধ্বংস ও পিএইচ (pH) স্থিতিশীল করতে প্রতি হেক্টরে ২০০-৫০০ কেজি চুন প্রয়োগ করুন।" },
          { title: "২. সার প্রয়োগ", desc: "প্রাকৃতিক ফাইটোপ্লাঙ্কটন এবং জুপ্লাঙ্কটন তৈরির জন্য গোবর (জৈব সার), ইউরিয়া এবং টিএসপি (TSP) সার প্রয়োগ করুন।" },
          { title: "৩. পানি সরবরাহ ও এয়ারেশন", desc: "ধীরে ধীরে পানি দিয়ে পুকুর ভরুন (শুরুতে ৩-৪ ফুট)। পোনা ছাড়ার আগে দ্রবীভূত অক্সিজেন নিশ্চিত করতে এয়ারেটর সিস্টেম পরীক্ষা ও সেটআপ করুন।" }
        ]
      },
      cycle: {
        title: "চাষের চক্রের ধাপসমূহ",
        items: [
          { title: "পুকুর নির্বাচন", desc: "উপযুক্ত দোআঁশ বা এঁটেল মাটির স্থান এবং নির্ভরযোগ্য পানির উৎস নির্বাচন করুন।" },
          { title: "মাটি ও পানি প্রস্তুত", desc: "শুকানো, চুন ও সার প্রয়োগ করে সবুজ প্লাঙ্কটন তৈরি হওয়া পর্যন্ত অপেক্ষা করুন।" },
          { title: "পোনা অবমুক্তি", desc: "অনুমোদিত খামার থেকে রোগমুক্ত পোনা কিনে এনে অভ্যস্ত (Acclimate) করার পর ঠান্ডা সময়ে ছেড়ে দিন।" },
          { title: "খাদ্য ও পর্যবেক্ষণ", desc: "দিনে দুবার পরিপূরক খাদ্য দিন, আইওটি (IoT) ডিভাইসের মাধ্যমে প্যারামিটার এবং বর্জ্য পর্যবেক্ষণ করুন।" },
          { title: "বৃদ্ধির নমুনা পরীক্ষা", desc: "প্রতি ১৫ দিন পর পর জাল টেনে মাছের গড় ওজন (ABW) মেপে খাদ্য বরাদ্দ সমন্বয় করুন।" },
          { title: "মাছ আহরণ ও বিক্রি", desc: "আংশিক বা সম্পূর্ণ মাছ আহরণ করুন, জাল টানার সময় পানির গুণমান বজায় রাখুন এবং বাজারে পরিবহন করুন।" }
        ]
      }
    },
    feed: {
      title: "খাদ্য ব্যবস্থাপনা",
      types: {
        title: "খাদ্যের প্রকারভেদ",
        natural: {
          title: "প্রাকৃতিক খাদ্য (শৈবাল ও প্লাঙ্কটন)",
          desc: "পুকুরে সার প্রয়োগের মাধ্যমে উৎপন্ন ফাইটোপ্লাঙ্কটন (অণুবীক্ষণিক শৈবাল) এবং জুপ্লাঙ্কটন। এটি পোনার জন্য প্রোটিন এবং মাইক্রোনিউট্রিয়েন্টের চমৎকার উৎস।"
        },
        supplementary: {
          title: "পরিপূরক খাদ্য (পেলট ও পাউডার)",
          desc: "প্রোটিন, লিপিড, কার্বোহাইড্রেট এবং খনিজ সমৃদ্ধ কৃত্রিম খাদ্য। ভাসমান পেলট (খাদ্য গ্রহণ ও অপচয় পর্যবেক্ষণে সেরা) বা ডুবন্ত পেলট (তলদেশের মাছের জন্য সেরা) হিসেবে পাওয়া যায়।"
        }
      },
      schedule: {
        title: "খাদ্য প্রদানের সময়সূচী",
        desc: "দিনে দুবার মাছকে খাবার দিন। প্রথমবার সকালে (সকাল ৮:০০ - ৯:০০ টার দিকে) যখন দ্রবীভূত অক্সিজেনের মাত্রা বাড়তে শুরু করে। দ্বিতীয়বার বিকেলে (বিকেল ৪:০০ - ৫:০০ টার দিকে) সূর্যাস্তের আগে। রাতে খাবার দেয়া পরিহার করুন, কারণ এ সময় অক্সিজেন কমে যায়।"
      },
      methods: {
        title: "খাবার দেওয়ার পদ্ধতিসমূহ",
        items: [
          { title: "ছিটিয়ে দেওয়া (Broadcasting)", desc: "পুকুরের চারদিকে সমানভাবে খাবার ছিটিয়ে দেওয়া। সহজ পদ্ধতি, তবে সচেতনভাবে না ছিটানো হলে খাবারের অপচয় হতে পারে।" },
          { title: "খাদ্য ট্রে এবং খাঁচা (Trays & Cages)", desc: "ঝোলানো ট্রে বা ডুবানো খাঁচায় খাবার দেওয়া। এর ফলে মাছ কী পরিমাণ খাবার খাচ্ছে এবং তাদের ক্ষুধা কেমন তা সহজে দেখা যায়।" },
          { title: "ভাসমান বনাম ডুবন্ত ফিড লজিক", desc: "মাছের আচরণ ও খাওয়ার পরিমাণ পর্যবেক্ষণ করতে ভাসমান খাবার ব্যবহার করুন। ডুবন্ত খাবারের দাম কম হলেও এর অপচয় পুকুরের তলদেশ দূষিত করতে পারে।" }
        ]
      },
      calculator: {
        title: "দৈনিক খাদ্য ক্যালকুলেটর",
        stageLabel: "মাছের বৃদ্ধির ধাপ",
        weightLabel: "মোট মাছের বায়োমাস (কেজি)",
        calculateBtn: "খাদ্যের পরিমাণ হিসাব করুন",
        resultTitle: "আনুমানিক দৈনিক খাদ্যের চাহিদা",
        resultDesc: "বৈজ্ঞানিক মানদণ্ডের উপর ভিত্তি করে হিসাব করা হয়েছে। এই মোট পরিমাণকে সকাল ও বিকেলে ভাগ করে দিন।",
        stages: [
          { name: "পোনা / ফিঙ্গারলিংস (দেহের ওজনের ৮–১০%)", rate: 0.09, desc: "উচ্চ প্রোটিনযুক্ত পাউডার বা মাইক্রো-পেলট প্রয়োজন। সম্ভব হলে দিনে ৩-৪ বার খাওয়ান।" },
          { name: "মাঝারি আকার (দেহের ওজনের ৪–৫%)", rate: 0.045, desc: "স্বাভাবিক বৃদ্ধির ধাপ। ১.২ মিমি - ২ মিমি সাইজের পেলট দিনে দুবার খাওয়ান।" },
          { name: "বাজারজাত আকার (দেহের ওজনের ২–৩%)", rate: 0.025, desc: "চূড়ান্ত ধাপ। বড় ভাসমান পেলট দিনে দুবার খাওয়ান।" }
        ]
      }
    }
  }
};

export const diseasesCatalog: DiseaseItem[] = [
  {
    id: "dropsy",
    name: "Dropsy",
    bengaliName: "উদরী রোগ (ড্রপসি)",
    category: "bacterial_viral",
    symptoms: ["Abdominal swelling", "Pinecone-like protruding scales", "Lethargy and loss of balance"],
    treatment: "Isolate affected fish immediately. Feed Vitamin C enriched feed to boost immunity. Disinfect the pond water using potassium permanganate or mild disinfectants.",
    preventive: "Maintain water quality. Avoid high organic load and high stocking density."
  },
  {
    id: "ulcer",
    name: "Epizootic Ulcerative Syndrome (EUS)",
    bengaliName: "ক্ষত রোগ (লাল ক্ষত)",
    category: "bacterial_viral",
    symptoms: ["Red spots or open wounds on skin", "Bleeding skin patches", "Loss of scales", "Sluggish swimming"],
    treatment: "Apply Potassium Permanganate (KMnO₄) at 2-3 ppm or BKC at 1 liter per acre. Feed Oxytetracycline medicated food (50-75mg/kg fish weight) for 7 days.",
    preventive: "Apply agricultural lime (100 kg/acre) before winter season starts to prevent pathogens."
  },
  {
    id: "gill_rot",
    name: "Gill Rot",
    bengaliName: "ফুলকা পচা রোগ",
    category: "bacterial_viral",
    symptoms: ["Difficulty breathing / piping at surface", "White or brownish coating on gills", "Pale or spotted gills"],
    treatment: "Perform partial water exchange. Apply Lime (100 kg/acre) to stabilize water and disinfection. Use BKC 80% or specialized water sanitizers.",
    preventive: "Keep ammonia below 0.05 ppm. High ammonia destroys gill membranes."
  },
  {
    id: "fin_rot",
    name: "Tail & Fin Rot",
    bengaliName: "পাখনা ও লেজ পচা রোগ",
    category: "bacterial_viral",
    symptoms: ["Frayed or disintegrating fins", "Redness at base of fins", "Lethargy and hiding behaviour"],
    treatment: "Isolate sick fish. Treat the pond with copper sulfate (0.5 to 1 ppm) or disinfectants. Mix Vitamin C and minerals with feed.",
    preventive: "Avoid rough handling during netting. Prevent overstocking and oxygen stress."
  },
  {
    id: "anchor_parasite",
    name: "Anchor Worm (Lernaea)",
    bengaliName: "অ্যাঙ্কর পরজীবী (উকুন রোগ)",
    category: "parasitic",
    symptoms: ["Thread-like worms attached to skin/fins", "Red spots at attachment points", "Fish rubbing body against sides"],
    treatment: "Manually extract worms from infected specimens if feasible. Treat the pond with antiparasitic medicine like Ivermectin or specialized organophosphates under consultancy.",
    preventive: "Quarantine wild stock and test fingerlings before releasing into the culture pond."
  },
  {
    id: "ammonia",
    name: "Ammonia Toxicity",
    bengaliName: "অ্যামোনিয়া গ্যাস সমস্যা",
    category: "environmental",
    symptoms: ["Brownish/murky water", "Fish gasping for air near surface", "Mass sudden mortality"],
    treatment: "Reduce or stop feeding immediately. Perform 30-50% water exchange. Apply Zeolite (10-15 kg/acre) or Yucca extract to bind free ammonia.",
    preventive: "Perform regular bottom cleaning. Use bio-filters and maintain stable pH (pH above 8.5 increases toxic NH₃ concentration)."
  },
  {
    id: "oxygen_deficiency",
    name: "Oxygen Deficiency (Hypoxia)",
    bengaliName: "অক্সিজেন স্বল্পতা",
    category: "environmental",
    symptoms: ["Fish piping/gasping at water surface in early morning", "Lethargy", "Gathering near inlet pipe"],
    treatment: "Turn on all paddlewheel aerators immediately. Pump in fresh oxygenated water. Apply oxygen tablets (sodium percarbonate) across the pond.",
    preventive: "Do not overstock or overfeed. Keep weed growth under control. Ensure proper aeration during cloudy days."
  },
  {
    id: "green_water",
    name: "Algal Bloom (Green Water)",
    bengaliName: "শেওলা ব্লুম (সবুজ পানি)",
    category: "environmental",
    symptoms: ["Deep dark green pea-soup water color", "Oxygen crash during night", "Gill clogging in fish"],
    treatment: "Apply Copper Sulfate (0.1-0.2 ppm) placed in cloth bags at water inlet. Stop fertilization. Perform partial water change from bottom.",
    preventive: "Control feed waste and phosphate runoff into the pond. Monitor Secchi disc visibility (keep between 30-40 cm)."
  }
];
