// H:\DMA Hamim\DMA-Web-App\src\data\farmManagementData.ts

export interface FarmCardItem {
  id: string;
  name: string;
  bengaliName: string;
  iconName: string; // e.g., 'financial_management.png'
  shortDesc: string;
  shortDescBn: string;
  fullContent: string;
  fullContentBn: string;
}

export const farmManagementData: FarmCardItem[] = [
  {
    id: "software",
    name: "Management Software",
    bengaliName: "খামার ব্যবস্থাপনা সফটওয়্যার",
    iconName: "ras_aquaculture.png",
    shortDesc: "Centralized platform for farm operations optimization.",
    shortDescBn: "খামার পরিচালনা সহজ ও সুচারু করার কেন্দ্রীভূত প্লাটফর্ম।",
    fullContent: "Centralized farm management software acts as the nervous system of modern aquaculture. It integrates IoT sensor telemetry, feed inventory, biometrics data, and staff logs into a single dashboard. This allows for predictive harvest planning, real-time threshold alert escalation, and overall digital operational visibility, securing a strategic move for long-term farm success.",
    fullContentBn: "কেন্দ্রীভূত খামার ব্যবস্থাপনা সফটওয়্যার আধুনিক জলচাষের কেন্দ্রবিন্দু হিসেবে কাজ করে। এটি আইওটি সেন্সর ডেটা, খাদ্য মজুদ, জৈবিক তথ্য এবং কর্মীদের লগ এক প্ল্যাটফর্মে সংহত করে। এটি ফসল কাটার পূর্বাভাস, রিয়েল-টাইম অ্যালার্ট এবং সামগ্রিক কার্যক্রমের স্বচ্ছতা নিশ্চিত করে দীর্ঘমেয়াদী সাফল্য অর্জন করতে সাহায্য করে।"
  },
  {
    id: "medicinal",
    name: "Medicinal Records",
    bengaliName: "সাপ্তাহিক ওষুধ সংক্রান্ত রেকর্ড",
    iconName: "financial_management.png",
    shortDesc: "Ensures fish health and environmental safety via usage tracking.",
    shortDescBn: "সঠিক ওষুধ ব্যবহারের ইতিহাস সংরক্ষণের মাধ্যমে মাছের সুরক্ষা নিশ্চিতকরণ।",
    fullContent: "Maintaining meticulous records of probiotics, disinfectants, and therapeutic treatments is critical. Tracking dosages, manufacturer batches, application dates, and withdrawal periods prevents antibiotic resistance and chemical accumulation. This ensures both final product safety for human consumption and compliance with standard international environmental regulations.",
    fullContentBn: "প্রোবায়োটিক, জীবাণুনাশক এবং অন্যান্য ওষুধের সতর্ক ব্যবহারের রেকর্ড রাখা অত্যন্ত জরুরি। সঠিক ডোজ, প্রয়োগের তারিখ এবং প্রত্যাহার সময়কাল (Withdrawal period) ট্র্যাক করে অ্যান্টিবায়োটিক রেজিস্ট্যান্স এবং কেমিক্যাল জমার ঝুঁকি কমানো যায়। এটি মানুষের খাওয়ার জন্য নিরাপদ মাছ চাষ এবং আন্তর্জাতিক পরিবেশগত নিয়মাবলী মেনে চলতে সাহায্য করে।"
  },
  {
    id: "financial",
    name: "Financial Management",
    bengaliName: "খামারের আর্থিক ব্যবস্থাপনা",
    iconName: "financial_management.png",
    shortDesc: "Cost control, budgeting, and financial transparency.",
    shortDescBn: "ব্যয় নিয়ন্ত্রণ, বাজেট তৈরি এবং সঠিক আর্থিক হিসাবের সহজ সমাধান।",
    fullContent: "Successful aquaculture relies heavily on budget control and cashflow visibility. Recording capital expenditures (capex) such as aerators and ponds, alongside operational costs (opex) like feed, energy, and labor, is vital. Meticulous tracking calculates net production cost per kilogram, allowing farmers to adjust prices and maximize market profitability.",
    fullContentBn: "সফল জলচাষ মূলত সঠিক বাজেট এবং ক্যাশফ্লোর উপর নির্ভর করে। স্থায়ী ব্যয় (এয়ারেটর, পুকুর খনন) এবং দৈনিক পরিচালনা ব্যয় (খাবার, বিদ্যুৎ, শ্রমিক) হিসাব করে প্রতি কেজি মাছের প্রকৃত উৎপাদন খরচ নির্ধারণ করা সম্ভব হয়। এটি বাজারে দরদাম নির্ধারণে খামারিকে সঠিক সিদ্ধান্ত নিতে সাহায্য করে।"
  },
  {
    id: "culture_systems",
    name: "Fish Culture Systems",
    bengaliName: "মাছ চাষের পদ্ধতিসমূহ",
    iconName: "ras_aquaculture.png",
    shortDesc: "Comparison of Earthen Ponds, Cage Culture, Raceway, and RAS.",
    shortDescBn: "মাটির পুকুর, খাঁচা চাষ, রেসওয়ে এবং আরএএস পদ্ধতির তুলনামূলক বিশ্লেষণ।",
    fullContent: "Aquaculture employs diverse structures depending on species and density. Earthen ponds offer natural biological cycles but low densities. Cage culture utilizes open water reservoirs. Raceways use continuous flow-through currents, while RAS (Recirculating Aquaculture Systems) filters and recycles 95% of water, facilitating high densities in controlled indoor environments.",
    fullContentBn: "মাছের প্রজাতি এবং ঘনত্বের উপর নির্ভর করে বিভিন্ন পদ্ধতিতে চাষ করা হয়। প্রচলিত মাটির পুকুর প্রাকৃতিক জীবনচক্র বজায় রাখলেও ঘনত্ব কম থাকে। খাঁচা চাষ উন্মুক্ত জলাশয় ব্যবহার করে। রেসওয়ে সিস্টেমে অবিরাম পানির প্রবাহ থাকে, অন্যদিকে আরএএস (RAS) পদ্ধতিতে ৯৫% পানি রি-সাইকেল করে ঘরের ভেতর নিয়ন্ত্রিত পরিবেশে মাছ চাষ করা যায়।"
  },
  {
    id: "feed_system",
    name: "Feed Management System",
    bengaliName: "খাদ্য ব্যবস্থাপনা পদ্ধতি",
    iconName: "financial_management.png",
    shortDesc: "Optimizing feed (50-70% of costs) via data-driven decisions.",
    shortDescBn: "মোট খরচের ৫০-৭০% খাদ্য বাবদ ব্যয় কমাতে ডেটা-চালিত সঠিক সিদ্ধান্ত।",
    fullContent: "Feed accounts for 50-70% of total operational costs in intensive aquaculture. An optimized Feed Management System uses biomass calculation, water temperature variables, and FCR models to deliver the exact feed quantity. Overfeeding results in high feed costs and fast water pollution, whereas underfeeding limits optimal growth rates.",
    fullContentBn: "নিবিড় মাছ চাষে মোট খরচের ৫০-৭০% খাদ্য বাবদ ব্যয় হয়। উন্নত খাদ্য ব্যবস্থাপনা সিস্টেম মাছের মোট ওজন, পানির তাপমাত্রা এবং এফসিআর (FCR) বিশ্লেষণ করে সঠিক পরিমাপে খাদ্য প্রদান নিশ্চিত করে। অতিরিক্ত খাবার দিলে অপচয় হয় ও পানি দূষিত হয়, আবার কম খাবার দিলে মাছের আশানুরূপ বৃদ্ধি ব্যাহত হয়।"
  },
  {
    id: "ras",
    name: "RAS Aquaculture",
    bengaliName: "আরএএস জলচাষ ব্যবস্থা (RAS)",
    iconName: "ras_aquaculture.png",
    shortDesc: "High-density indoor production in controlled environments.",
    shortDescBn: "নিয়ন্ত্রিত ইনডোর পরিবেশে উচ্চ ঘনত্বে মাছ চাষের উন্নত পদ্ধতি।",
    fullContent: "Recirculating Aquaculture Systems (RAS) filter water mechanically and biologically to remove waste, ammonia, and CO2 before oxygenating and returning it to culture tanks. Operating indoor RAS allows total control over temperature, light, biosecurity, and water chemistry. This minimizes water usage and footprint, enabling organic, high-density production near urban markets.",
    fullContentBn: "রিসার্কুলেটিং অ্যাকোয়াকালচার সিস্টেম (RAS) যান্ত্রিক এবং জৈব ফিল্টারিংয়ের মাধ্যমে বর্জ্য, অ্যামোনিয়া এবং কার্বন ডাই অক্সাইড দূর করে পানিতে অক্সিজেন মিশিয়ে পুনরায় চাষের ট্যাংকে সরবরাহ করে। ইনডোর আরএএস ব্যবস্থাপনায় তাপমাত্রা, আলো, পানির প্যারামিটার সম্পূর্ণরূপে নিয়ন্ত্রণ করা যায়, যার ফলে শহরের আশেপাশেই কম জমিতে উচ্চ ঘনত্বে মাছ চাষ সম্ভব হয়।"
  },
  {
    id: "ipras",
    name: "IPRAS System",
    bengaliName: "আইপিআরএএস জলচাষ পদ্ধতি (IPRAS)",
    iconName: "ras_aquaculture.png",
    shortDesc: "Sustainable flow-through channels for high productivity.",
    shortDescBn: "নদীর মত প্রবাহমান চ্যানেলে টেকসই ও উচ্চ উৎপাদনশীল পদ্ধতি।",
    fullContent: "In-Pond Raceway Systems (IPRAS) construct concrete channels inside traditional earthen ponds. High-volume pumps pull water continuously through the channel, mimicking river currents. Solid waste is gathered at the raceway tail-end for manure extraction, combining high-density stocking with simplified pond waste treatment.",
    fullContentBn: "ইন-পন্ড রেসওয়ে সিস্টেম (IPRAS) মাটির পুকুরের ভেতর আরসিসি বা প্লাস্টিকের কৃত্রিম প্রবাহ পথ তৈরি করে কাজ করে। বড় পাম্পের সাহায্যে পানিকে সবসময় চ্যানেলের মধ্যে দিয়ে নদীর মত প্রবাহিত রাখা হয়। এতে বর্জ্য সহজে এক জায়গায় জমা করে নিষ্কাশন করা যায় এবং পুকুরের স্বাভাবিক পরিবেশ বজায় রেখে বেশি মাছ উৎপাদন করা সম্ভব হয়।"
  },
  {
    id: "sme_loan",
    name: "SME Loan Solutions",
    bengaliName: "ক্ষুদ্র ও মাঝারি উদ্যোগ ঋণ সমাধান",
    iconName: "financial_management.png",
    shortDesc: "Expert guidance for obtaining short-term small/medium loans.",
    shortDescBn: "সহজ শর্তে কৃষি ও বাণিজ্যিক ব্যাংক ঋণ পাওয়ার সঠিক দিকনির্দেশনা।",
    fullContent: "Financing is essential for expansion. SME Loan Solutions provide structured advisory services to guide farmers through local commercial bank procedures. We assist in preparing project feasibility briefs, land lease profiles, license certificates, and bio-security records required to secure agricultural credit at lower interest rates.",
    fullContentBn: "খামার সম্প্রসারণের জন্য অর্থায়ন খুবই গুরুত্বপূর্ণ। এসএমই লোন সলিউশন খামারিদের সহজ শর্তে বাণিজ্যিক ব্যাংক ঋণের আবেদন প্রক্রিয়া সম্পন্ন করতে সাহায্য করে। আমরা ঋণের জন্য প্রয়োজনীয় ফিজিবিলিটি রিপোর্ট, জমির দলিল/লিজ পেপার, ট্রেড লাইসেন্স ও বায়োসিকিউরিটি নথিপত্র তৈরিতে সম্পূর্ণ কারিগরি পরামর্শ দিয়ে থাকি।"
  },
  {
    id: "equipment_guide",
    name: "Aqua Equipment Guide",
    bengaliName: "জলচাষ সরঞ্জাম নির্দেশিকা",
    iconName: "ras_aquaculture.png",
    shortDesc: "Comprehensive checklist for pumps, filters, and backup power.",
    shortDescBn: "পাম্প, মেকানিক্যাল ফিল্টার এবং বিকল্প বিদ্যুৎ ব্যবস্থার নির্দেশিকা।",
    fullContent: "Selecting and maintaining high-quality farm equipment is the primary safeguard against emergency failures. This guide outlines parameters for paddlewheel aerators, root blowers, submersible pumps, filtration systems, and backup generators. Regular inspection intervals prevent biological system crashes due to load-shedding or motor burnouts.",
    fullContentBn: "উন্নত মানের জলচাষের সরঞ্জাম সঠিক নিয়মে পরিচালনা ও রক্ষণাবেক্ষণ করা খামারের অন্যতম নিরাপত্তা কবচ। এই নির্দেশিকায় প্যাডেল হুইল এয়ারেটর, রুট ব্লোয়ার, সাবমার্সিবল পাম্প, ফিল্টার এবং ব্যাকআপ জেনারেটরের সঠিক স্পেসিফিকেশন ও নিয়মিত রক্ষণাবেক্ষণের নিয়মাবলী আলোচনা করা হয়েছে।"
  },
  {
    id: "high_density",
    name: "High Density Farming",
    bengaliName: "উচ্চ ঘনত্বে মাছ চাষ",
    iconName: "ras_aquaculture.png",
    shortDesc: "Maximizing biomass per cubic meter safely with telemetry.",
    shortDescBn: "আইওটি ডিভাইসের সহায়তায় প্রতি ঘনমিটারে সর্বোচ্চ মাছ উৎপাদনের কৌশল।",
    fullContent: "Stocking fish at high densities requires optimal feed nutrition, disease prevention, and high-frequency water quality monitoring. Using online telemetry tools prevents sudden oxygen drops or ammonia spikes. Ensuring continuous water exchange and biofiltration rates maximizes biomass output per cubic meter safely.",
    fullContentBn: "উচ্চ ঘনত্বে পোনা ছাড়লে উন্নত মানের পুষ্টিকর খাদ্য সরবরাহ, রোগ প্রতিরোধ এবং পানির গুণমান সার্বক্ষণিক মনিটর করা আবশ্যক। লাইভ আইওটি ডিভাইস ব্যবহারের মাধ্যমে হঠাৎ দ্রবীভূত অক্সিজেন কমে যাওয়া বা অ্যামোনিয়া বাড়ার ঝুঁকি ঠেকানো যায়। পর্যাপ্ত পানি পরিবর্তন ও সঠিক ফিল্টারিং প্রতি ঘনমিটারে নিরাপদ মাছ চাষ নিশ্চিত করে।"
  },
  {
    id: "water_quality",
    name: "Water Quality Management",
    bengaliName: "পানির গুণগত মান নিয়ন্ত্রণ",
    iconName: "ras_aquaculture.png",
    shortDesc: "Advanced techniques for managing pH, dissolved oxygen, and TDS.",
    shortDescBn: "পিএইচ, দ্রবীভূত অক্সিজেন এবং লবণাক্ততা ব্যবস্থাপনার আধুনিক কৌশল।",
    fullContent: "Water is the medium of life for aquaculture. Managing chemical cycles involves keeping pH balanced, maintaining dissolved oxygen above 5 mg/L, and ensuring total dissolved solids (TDS) match the requirements of the cultivated species. Proper management prevents gill disease and physiological stress.",
    fullContentBn: "পানিই মাছের প্রাণ। চাষকৃত মাছের সুস্থতার জন্য পানির পিএইচ (pH) ব্যালেন্স রাখা, দ্রবীভূত অক্সিজেন ৫ মিলিগ্রাম/লিটারের উপরে রাখা এবং টিডিএস (TDS) মাছের প্রজাতি অনুযায়ী বজায় রাখা অত্যন্ত প্রয়োজন। এটি মাছের ফুলকা রোগ প্রতিরোধ ও শারীরবৃত্তীয় চাপ কমায়।"
  },
  {
    id: "biofloc",
    name: "Biofloc Technology",
    bengaliName: "বায়োফ্লক প্রযুক্তি (BFT)",
    iconName: "ras_aquaculture.png",
    shortDesc: "Converting waste into nutritious feed using bacterial flocs.",
    shortDescBn: "ব্যাকটেরিয়াল ফ্লকের সাহায্যে বর্জ্যকে মাছের পুষ্টিকর খাদ্যে রূপান্তর।",
    fullContent: "Biofloc Technology (BFT) operates on the principle of carbon-nitrogen balance to stimulate heterotrophic bacteria. These bacteria consume nitrogenous waste (ammonia) and convert it into microbial protein flocs, which serve as highly nutritious feed for filter-feeding fish, minimizing input costs.",
    fullContentBn: "বায়োফ্লক প্রযুক্তি মূলত কার্বন ও নাইট্রোজেনের অনুপাত নিয়ন্ত্রণ করে হেটেরোট্রফিক ব্যাকটেরিয়ার বৃদ্ধি ঘটায়। এই উপকারী ব্যাকটেরিয়া ক্ষতিকর অ্যামোনিয়াকে শোষণ করে ব্যাকটেরিয়াল প্রোটিনে রূপান্তর করে, যা মাছের পুষ্টিকর খাদ্য হিসেবে ব্যবহৃত হয় এবং খাদ্যের খরচ কমায়।"
  },
  {
    id: "biosecurity",
    name: "Biosecurity Guidelines",
    bengaliName: "বায়োসিকিউরিটি নির্দেশিকা",
    iconName: "financial_management.png",
    shortDesc: "Preventing pathogens entry using nets, disinfection, and quarantine.",
    shortDescBn: "পাখি ও ক্ষতিকর পরজীবী প্রবেশ ঠেকাতে নিরাপত্তা ও কোয়ারেন্টাইন নিয়ম।",
    fullContent: "Biosecurity encompasses all steps designed to prevent the introduction of pathogens into a farm. It requires bird nets, disinfection footbaths at entries, quarantine tanks for new fingerlings, and strictly controlled visitors access to minimize viral and parasitic outbreak risks.",
    fullContentBn: "বায়োসিকিউরিটি হল খামারে রোগজীবাণু বা ক্ষতিকর ভাইরাস প্রবেশ প্রতিরোধ করার সামগ্রিক নিরাপত্তা নিয়ম। পাখির জাল ব্যবহার করা, খামারের প্রবেশপথে ফুটবাথ বা জীবাণুনাশক রাখা, এবং নতুন পোনা ছাড়ার আগে কোয়ারেন্টাইন ট্যাংক ব্যবহার করা এর অন্যতম প্রধান অংশ।"
  },
  {
    id: "aeration",
    name: "Aeration Systems Guide",
    bengaliName: "এয়ারেশন ব্যবস্থা নির্দেশিকা",
    iconName: "ras_aquaculture.png",
    shortDesc: "Setting optimal thresholds for paddlewheels and nano bubbles.",
    shortDescBn: "প্যাডেল হুইল এবং ন্যানো বাবল এয়ারেটরের কার্যকারিতা ও টাইমিং।",
    fullContent: "Active aeration is mandatory for commercial stocking densities. Paddlewheels oxygenate the upper layers, while nano bubble tubes diffuse fine micro-bubbles at the pond floor. Correct positioning and smart timer settings ensure balanced oxygen distribution and avoid bottom sludge accumulation.",
    fullContentBn: "বাণিজ্যিক খামারে কৃত্রিম অক্সিজেন বা এয়ারেশন ব্যবস্থা থাকা বাধ্যতামূলক। প্যাডেল হুইল পানির উপরের স্তরে অক্সিজেন বাড়ায় এবং ন্যানো বাবল টিউব নিচে অতি ক্ষুদ্র বাবল ছড়িয়ে দেয়। সঠিক পজিশনিং ও আইওটি ভিত্তিক টাইমার ব্যবহার করে বিদ্যুৎ খরচ বাঁচিয়ে পানিতে অক্সিজেনের ব্যালেন্স রাখা যায়।"
  },
  {
    id: "hatchery",
    name: "Hatchery Rearing Phase",
    bengaliName: "হ্যাচারি ও পোনা প্রতিপালন ধাপ",
    iconName: "ras_aquaculture.png",
    shortDesc: "Delicate nursery setup and larval feeding protocols.",
    shortDescBn: "হ্যাচারিতে রেণু পোনা থেকে ধানি পোনা প্রতিপালনের নার্সারি গাইড।",
    fullContent: "The hatchery phase requires supreme water filtration and live food feeds like Artemia cysts or rotifers. Keeping salinity and water flow speeds strictly optimized ensures high survival rates of sensitive fry before they are transferred into the outdoor rearing ponds.",
    fullContentBn: "হ্যাচারি ধাপে রেণু পোনার বেঁচে থাকার জন্য উন্নত মানের ওয়াটার ফিল্টারিং এবং লাইভ ফুড (যেমন আরটেমিয়া বা রটিফার) খাওয়ানো প্রয়োজন। পোনা বাইরে ছাড়ার আগে পানির লবণাক্ততা এবং তাপমাত্রা নিখুঁতভাবে বজায় রাখতে হ্যাচারিতে বিশেষ নার্সারি গাইড অনুসরণ করতে হয়।"
  },
  {
    id: "mitigation",
    name: "Diseases Mitigation Rules",
    bengaliName: "রোগ প্রতিরোধ ও প্রতিকার নিয়ম",
    iconName: "financial_management.png",
    shortDesc: "Early diagnosis protocols for bacterial and viral diseases.",
    shortDescBn: "ক্ষত, পাখনা পচা ও অন্যান্য ভাইরাসের লক্ষণ দেখে করণীয় পদক্ষেপ।",
    fullContent: "Disease mitigation focuses on prompt identification and quarantine. Early symptoms like erratic swimming, scale loss, or gill discoloration must trigger isolation and diagnostic tests. Periodic application of water conditioners prevents pathogen multiplication.",
    fullContentBn: "রোগের লক্ষণ দেখার সাথে সাথে আক্রান্ত মাছ পৃথক করা ও পানি শোধন করা উচিত। মাছের অস্বাভাবিক সাঁতার, আঁশ উঠে যাওয়া বা ফুলকার রঙ পরিবর্তন রোগ সংক্রমণের লক্ষণ। পানির সঠিক গুণমান বজায় রাখা ও মাঝে মাঝে স্যানিটাইজার ব্যবহার করা রোগ ছড়ানো বন্ধ করে।"
  },
  {
    id: "sampling",
    name: "Growth Sampling Protocols",
    bengaliName: "মাছের বৃদ্ধি ও গড় ওজন পরীক্ষা",
    iconName: "financial_management.png",
    shortDesc: "Bi-weekly netting schedule to calculate average body weight.",
    shortDescBn: "প্রতি ১৫ দিনে গড় ওজন মেপে খাদ্য পরিমাণ সমন্বয় পদ্ধতি।",
    fullContent: "Netting and sampling a portion of the stock every 15 days is critical. Weighing a batch of 50 fish provides the Average Body Weight (ABW), which is multiplied by the estimated survival rate to recalculate total biomass and adjust daily feed rations accurately.",
    fullContentBn: "প্রতি ১৫ দিন পর পর জাল টেনে মাছের গড় ওজন (ABW) বের করা অত্যন্ত জরুরি। আনুমানিক ৫০টি মাছ মেপে গড় ওজনের সাথে টিকে থাকা মাছের সংখ্যার গুণ করে পুকুরের মোট মাছের ভর (Biomass) বের করা হয়, যা সঠিক খাদ্য বরাদ্দ নিশ্চিত করতে সহায়তা করে।"
  },
  {
    id: "post_harvest",
    name: "Post-Harvest Handling",
    bengaliName: "মাছ আহরণ ও বাজারজাতকরণ",
    iconName: "financial_management.png",
    shortDesc: "Cold chain logistics and handling rules to keep fish fresh.",
    shortDescBn: "মাছ তাজা রাখতে কোল্ড চেইন লজিস্টিকস এবং আহরণ পরবর্তী নিয়মাবলী।",
    fullContent: "Post-harvest handling determines the final market value. Fish should be harvested during cool early morning hours, washed in clean running water, and immediately layered in crushed ice inside insulated boxes. Maintaining the cold chain preserves freshness and commands premium pricing.",
    fullContentBn: "মাছ ধরার পর সঠিক হ্যান্ডলিং এর উপর মাছের বাজার মূল্য অনেকাংশে নির্ভর করে। ভোরের ঠান্ডা আবহাওয়ায় মাছ ধরা, পরিষ্কার পানিতে ধোয়া এবং তাজা রাখতে সাথে সাথে ইনসুলেটেড বক্সে বরফ দিয়ে পরিবহন করা প্রয়োজন। এতে মাছের গুণগত মান ও তাজা ভাব বজায় থাকে।"
  }
];
