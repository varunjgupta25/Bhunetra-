import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GramSetu database with 50+ realistic rural products...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.document.deleteMany();
  await prisma.productBatch.deleteMany();
  await prisma.product.deleteMany();
  await prisma.entrepreneurProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Core system users
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Anil Deshmukh (Verification Lead)',
      email: 'admin@ruralroute.in',
      phone: '+91 98220 11223',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const logisticsPartner = await prisma.user.create({
    data: {
      name: 'MahaRural Logistics (Shri. Ganesh Transport)',
      email: 'logistics@ruralroute.in',
      phone: '+91 94230 44556',
      passwordHash,
      role: 'LOGISTICS',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      phone: '+91 98190 77889',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  // Entrepreneur Profiles
  const e1User = await prisma.user.create({
    data: { name: 'Savita Gaikwad', email: 'savita@ruralroute.in', phone: '+91 98501 23456', passwordHash, role: 'ENTREPRENEUR' },
  });
  const p1 = await prisma.entrepreneurProfile.create({
    data: {
      userId: e1User.id,
      businessName: 'Sahyadri Organic Strawberry Collective',
      village: 'Mahabaleshwar Rural',
      district: 'Satara',
      description: 'Women-led self-help collective producing 100% natural organic strawberry preserves, syrups, and dried fruit snacks from Sahyadri.',
      verificationStatus: 'VERIFIED',
      contactPhone: '+91 98501 23456',
    },
  });

  const e2User = await prisma.user.create({
    data: { name: 'Ramesh Chaugule', email: 'ramesh@gramsetu.in', phone: '+91 97633 45678', passwordHash, role: 'ENTREPRENEUR' },
  });
  const p2 = await prisma.entrepreneurProfile.create({
    data: {
      userId: e2User.id,
      businessName: 'Kolhapuri Royal Heritage Crafts',
      village: 'Kagal',
      district: 'Kolhapur',
      description: '3rd generation artisan family crafting authentic handmade vegetable-tanned Kolhapuri footwear and leathercraft.',
      verificationStatus: 'VERIFIED',
      contactPhone: '+91 97633 45678',
    },
  });

  const e3User = await prisma.user.create({
    data: { name: 'Sujata Sawant', email: 'sujata@gramsetu.in', phone: '+91 94211 88990', passwordHash, role: 'ENTREPRENEUR' },
  });
  const p3 = await prisma.entrepreneurProfile.create({
    data: {
      userId: e3User.id,
      businessName: 'Konkan Krushi Udyog SHG',
      village: 'Ratnagiri Rural',
      district: 'Ratnagiri',
      description: 'Coastal Konkan women enterprise specializing in pure Kokum extract, Alphonso mango preserves, and authentic spices.',
      verificationStatus: 'VERIFIED',
      contactPhone: '+91 94211 88990',
    },
  });

  const e4User = await prisma.user.create({
    data: { name: 'Anandrao Patil', email: 'anandrao@gramsetu.in', phone: '+91 99221 33445', passwordHash, role: 'ENTREPRENEUR' },
  });
  const p4 = await prisma.entrepreneurProfile.create({
    data: {
      userId: e4User.id,
      businessName: 'Solapur Handloom Weavers Producer Co.',
      village: 'Mohol',
      district: 'Solapur',
      description: 'Cooperative of 40 traditional weavers producing GI-tagged Solapuri towels, blankets, and pure cotton handloom sarees.',
      verificationStatus: 'VERIFIED',
      contactPhone: '+91 99221 33445',
    },
  });

  const e5User = await prisma.user.create({
    data: { name: 'Sunita Kadam', email: 'sunita@gramsetu.in', phone: '+91 91580 66778', passwordHash, role: 'ENTREPRENEUR' },
  });
  const p5 = await prisma.entrepreneurProfile.create({
    data: {
      userId: e5User.id,
      businessName: 'Sangli Organic Haldi Farmers Union',
      village: 'Walwa',
      district: 'Sangli',
      description: 'Farmer Producer Company growing high-curcumin Salem and Rajapuri organic turmeric using natural Vedic farming techniques.',
      verificationStatus: 'VERIFIED',
      contactPhone: '+91 91580 66778',
    },
  });

  const e6User = await prisma.user.create({
    data: { name: 'Bapurao Bhoyar', email: 'bapurao@gramsetu.in', phone: '+91 98234 11889', passwordHash, role: 'ENTREPRENEUR' },
  });
  const p6 = await prisma.entrepreneurProfile.create({
    data: {
      userId: e6User.id,
      businessName: 'Vidarbha Natural Forest Honey & Bamboo SHG',
      village: 'Pench Buffer Zone',
      district: 'Nagpur',
      description: 'Tribal community initiative harvesting raw unprocessed wild forest honey and crafting sustainable bamboo artifacts.',
      verificationStatus: 'VERIFIED',
      contactPhone: '+91 98234 11889',
    },
  });

  // Product Data Array (50+ items)
  const rawProducts = [
    // --- Food Processing & Preserves ---
    {
      pId: p1.id,
      title: 'Mahabaleshwar Natural Strawberry Preserve',
      description: 'Handcrafted in small batches using sun-ripened Mahabaleshwar strawberries and natural unrefined cane sugar. Free from artificial colorings.',
      category: 'Food Processing & Preserves',
      price: 240, stock: 85, originVillage: 'Mahabaleshwar', originDistrict: 'Satara',
      story: 'Sourced directly from 12 smallholder farm families in Satara. Our women self-help group boils fresh strawberries within 4 hours of harvest.',
      imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-STRAW-01', qrId: 'STAW-SATARA-88219'
    },
    {
      pId: p3.id,
      title: 'Pure Konkan Wild Kokum Agal (Unsoured Extract)',
      description: 'Traditional unsalted pure extract of wild Kokum fruits from Konkan coast. Ideal for authentic Solkadhi and cooling summer drinks.',
      category: 'Food Processing & Preserves',
      price: 180, stock: 120, originVillage: 'Ratnagiri', originDistrict: 'Ratnagiri',
      story: 'Wild harvested from coastal hill forests by women SHGs. Kokum is naturally rich in anti-oxidants and digestive enzymes.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-KOKM-02', qrId: 'RATN-KOKM-55310'
    },
    {
      pId: p3.id,
      title: 'Ratnagiri Devgad Alphonso Mango Pulp (Aamras)',
      description: '100% Pure GI-tagged Alphonso Mango Pulp with zero added sugar or artificial preservatives. Canning done in certified rural lab.',
      category: 'Food Processing & Preserves',
      price: 450, stock: 95, originVillage: 'Devgad', originDistrict: 'Ratnagiri',
      story: 'Harvested from sea-breeze nourished Alphonso orchards along coastal Maharashtra.',
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-MANGO-03', qrId: 'RATN-MNGO-77102'
    },
    {
      pId: p1.id,
      title: 'Mahabaleshwar Fresh Mulberry & Raspberry Jam Duo',
      description: 'Rich berry conserve packed with whole mulberries and hill raspberries, kettle-cooked over firewood.',
      category: 'Food Processing & Preserves',
      price: 290, stock: 60, originVillage: 'Mahabaleshwar', originDistrict: 'Satara',
      story: 'Prepared by Sahyadri SHG using traditional copper kettles.',
      imageUrl: 'https://images.unsplash.com/photo-1568569350060-e8563f588957?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-BERRY-04', qrId: 'SAT-BERR-11092'
    },
    {
      pId: p3.id,
      title: 'Authentic Konkani Kaphala Raw Mango Pickle (Kachha Aam)',
      description: 'Spicy stone-ground raw Alphonso mango pickle steeped in cold-pressed mustard oil and aromatic spices.',
      category: 'Food Processing & Preserves',
      price: 210, stock: 140, originVillage: 'Dapoli', originDistrict: 'Ratnagiri',
      story: 'Recipe passed down over 4 generations of coastal home cooks.',
      imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-PCKL-05', qrId: 'RAT-PICK-44910'
    },
    {
      pId: p5.id,
      title: 'Sangli Organic Kolhapuri Red Chili Powder (Bedgi Mild)',
      description: 'Sun-dried Bedgi chili powder offering vibrant deep red color and aromatic mild pungency.',
      category: 'Food Processing & Preserves',
      price: 260, stock: 110, originVillage: 'Walwa', originDistrict: 'Sangli',
      story: 'Stemless hand-picked chilies ground in slow wooden pounding mills.',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-CHIL-06', qrId: 'SNG-CHIL-99201'
    },
    {
      pId: p5.id,
      title: 'Handmade Kolhapuri Kanda Lahsun Masala (Garlic Onion Spice)',
      description: 'The iconic fiery Maharashtrian curry spice mix containing roasted onion, garlic, coconut, and 18 spices.',
      category: 'Food Processing & Preserves',
      price: 220, stock: 175, originVillage: 'Shirol', originDistrict: 'Kolhapur',
      story: 'Roasted over traditional charcoal flames for an unmistakable smoky depth.',
      imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-KLHM-07', qrId: 'KOL-KLHM-33190'
    },
    {
      pId: p3.id,
      title: 'Konkan Sun-Dried Jackfruit Chips (Fanas Chips)',
      description: 'Crispy salted chips made from unripened raw jackfruit slices fried in cold-pressed coconut oil.',
      category: 'Food Processing & Preserves',
      price: 150, stock: 130, originVillage: 'Ratnagiri', originDistrict: 'Ratnagiri',
      story: 'Sourced from backyard jackfruit trees grown without any chemical inputs.',
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-JACK-08', qrId: 'RAT-JACK-88312'
    },
    {
      pId: p1.id,
      title: 'Organic Amla Candy & Sweet Dried Gooseberry',
      description: 'Sun-cured Wild Amla pieces sweetened with organic jaggery powder. High natural Vitamin C content.',
      category: 'Food Processing & Preserves',
      price: 190, stock: 90, originVillage: 'Wai', originDistrict: 'Satara',
      story: 'Harvested by tribal self-help groups from the foothills of Pratapgad fort.',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-AMLA-09', qrId: 'SAT-AMLA-10293'
    },
    {
      pId: p5.id,
      title: 'Kolhapur Organic Sugarcane Jaggery Powder (Gud)',
      description: 'Chemical-free unrefined natural jaggery powder boiled from fresh sugarcane juice without clarifiers.',
      category: 'Food Processing & Preserves',
      price: 130, stock: 200, originVillage: 'Karveer', originDistrict: 'Kolhapur',
      story: 'Crafted in authentic village Gur-hal (jaggery units) along the Panchganga river basin.',
      imageUrl: 'https://images.unsplash.com/photo-1610450919865-c33a92b23a78?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-JAGP-10', qrId: 'KOL-JAGP-55410'
    },

    // --- Organic Agro Produce ---
    {
      pId: p5.id,
      title: 'Sangli GI-Tagged High Curcumin Raw Turmeric Powder (500g)',
      description: 'Single-origin pure Rajapuri turmeric powder containing >5.2% natural curcumin. Tested for zero lead chromate.',
      category: 'Organic Agro Produce',
      price: 280, stock: 150, originVillage: 'Walwa', originDistrict: 'Sangli',
      story: 'Cultivated in rich alluvial soil along the Krishna river banks by 25 organic smallholders.',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-HALD-11', qrId: 'SNG-HALD-77210'
    },
    {
      pId: p6.id,
      title: 'Vidarbha Raw Unfiltered Wild Forest Honey (500g)',
      description: 'Sustainably wild-harvested raw honey gathered by Gond tribal honey hunters in Pench forest buffer reserve.',
      category: 'Organic Agro Produce',
      price: 490, stock: 75, originVillage: 'Ramtek', originDistrict: 'Nagpur',
      story: 'Extracted using non-lethal squeeze methods preserving bee hives and natural forest pollen.',
      imageUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-HNY-12', qrId: 'NGP-HNY-88401'
    },
    {
      pId: p5.id,
      title: 'Indrayani Fragrant Aromatic Brown Rice (Unpolished 1kg)',
      description: 'Heirloom native Indrayani rice variety known for its pleasant floral aroma and sticky texture when cooked.',
      category: 'Organic Agro Produce',
      price: 160, stock: 180, originVillage: 'Maval', originDistrict: 'Pune',
      story: 'Grown naturally without synthetic fertilizers using rainwater harvesting ponds.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-RICE-13', qrId: 'PUN-RICE-66319'
    },
    {
      pId: p5.id,
      title: 'Ajara Ghansal Aromatic Rice (Heritage Native Grain)',
      description: 'Rare native micro-grain aromatic rice grown exclusively in Ajara valley. Exceptionally light and digestible.',
      category: 'Organic Agro Produce',
      price: 210, stock: 95, originVillage: 'Ajara', originDistrict: 'Kolhapur',
      story: 'Preserved by women seed-keepers of Kolhapur hill tracts.',
      imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-GHAN-14', qrId: 'KOL-GHAN-99204'
    },
    {
      pId: p5.id,
      title: 'Organic Whole Black Sesame Seeds (Kala Til 250g)',
      description: 'Unbleached natural black sesame seeds stone-cleaned and packed raw. Rich in calcium and iron.',
      category: 'Organic Agro Produce',
      price: 140, stock: 120, originVillage: 'Koregaon', originDistrict: 'Satara',
      story: 'Harvested from rainfed organic plots in Central Satara.',
      imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a6405bb?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-TIL-15', qrId: 'SAT-TIL-33109'
    },
    {
      pId: p5.id,
      title: 'Traditional Cold-Pressed Wood-Pressed Groundnut Oil (1L)',
      description: 'Extracted using traditional wooden Lakdi Ghani at low speed to retain natural aroma, Vitamin E, and antioxidants.',
      category: 'Organic Agro Produce',
      price: 320, stock: 80, originVillage: 'Phaltan', originDistrict: 'Satara',
      story: 'Zero heat treatment or chemical refining; 100% pure sun-dried seeds used.',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-OIL-16', qrId: 'SAT-OIL-10928'
    },
    {
      pId: p5.id,
      title: 'Cold-Pressed Safflower Oil (Kardai Oil 1L)',
      description: 'Authentic Maharashtrian Kardai Tel crushed in bull-driven wooden ghani mill.',
      category: 'Organic Agro Produce',
      price: 340, stock: 65, originVillage: 'Solapur Rural', originDistrict: 'Solapur',
      story: 'Promoted by Solapur drought-resilient farmer groups.',
      imageUrl: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-KARD-17', qrId: 'SOL-KARD-77301'
    },
    {
      pId: p5.id,
      title: 'Organic Sprouted Ragi Flour (Nachni Atta 1kg)',
      description: 'Sprouted and sun-dried finger millet stone-milled into fine flour. Ideal for healthy porridge and bhakri.',
      category: 'Organic Agro Produce',
      price: 150, stock: 140, originVillage: 'Patan', originDistrict: 'Satara',
      story: 'Sourced from hill tribe rain-fed farms in Sahyadri ridges.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-RAGI-18', qrId: 'SAT-RAGI-55201'
    },
    {
      pId: p5.id,
      title: 'Nashik Organic Thompson Seedless Raisins (Manuka 500g)',
      description: 'Naturally sun-cured golden raisins dried on shade-covered wooden racks on Nashik vineyard farms.',
      category: 'Organic Agro Produce',
      price: 270, stock: 110, originVillage: 'Dindori', originDistrict: 'Nashik',
      story: 'Free from sulfur dioxide wash or chemical oil glazing.',
      imageUrl: 'https://images.unsplash.com/photo-1595415273766-b371b2d424b9?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-RAIS-19', qrId: 'NSK-RAIS-88203'
    },
    {
      pId: p5.id,
      title: 'Traditional Organic Jowar Grain (Maldandi 35)',
      description: 'Premium drought-hardy GI-tagged Maldandi Jowar sorghum grain for fluffy, light rotis.',
      category: 'Organic Agro Produce',
      price: 110, stock: 220, originVillage: 'Mohol', originDistrict: 'Solapur',
      story: 'Solapur region’s staple ancient grain cultivated with zero chemical spray.',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-JOW-20', qrId: 'SOL-JOW-33100'
    },

    // --- Handicrafts & Leatherwork ---
    {
      pId: p2.id,
      title: 'Authentic Handcrafted Leather Kolhapuri Chappal',
      description: 'Traditional vegetable-tanned leather footwear handcrafted with hand-braided straps and intricate stitch patterns.',
      category: 'Handicrafts & Leatherwork',
      price: 1450, stock: 30, originVillage: 'Kagal', originDistrict: 'Kolhapur',
      story: 'Crafted using centuries-old heritage techniques passed down across three generations in Kolhapur.',
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-KOLH-21', qrId: 'KOLH-CRAFT-90412'
    },
    {
      pId: p2.id,
      title: 'Handmade Kolhapuri Braided Leather Belt',
      description: 'Full-grain buffalo leather belt hand-plaited by Master Artisans with brass buckle finish.',
      category: 'Handicrafts & Leatherwork',
      price: 890, stock: 45, originVillage: 'Shirol', originDistrict: 'Kolhapur',
      story: 'Tanned using bark of Babul and Myrobalan fruit extracts without chromium chemicals.',
      imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-BELT-22', qrId: 'KOL-BELT-11203'
    },
    {
      pId: p2.id,
      title: 'Hand-Carved Wooden Lacquerware Toys Set (Sawantwadi Art)',
      description: 'Non-toxic wooden play animals and tops turned on hand-lathes and painted with natural vegetable dyes.',
      category: 'Handicrafts & Leatherwork',
      price: 750, stock: 40, originVillage: 'Sawantwadi', originDistrict: 'Sindhudurg',
      story: 'Heritage Sawantwadi royal craft legacy preserved by Konkan artisan families.',
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-TOYS-23', qrId: 'SND-TOYS-55410'
    },
    {
      pId: p6.id,
      title: 'Handcrafted Bamboo Fruit Basket & Utility Tray',
      description: 'Hand-woven bamboo mesh basket treated with natural neem oil for insect resistance.',
      category: 'Handicrafts & Leatherwork',
      price: 420, stock: 65, originVillage: 'Melghat', originDistrict: 'Amravati',
      story: 'Woven by Korku tribal artisans using sustainable forest bamboo shoots.',
      imageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-BAMB-24', qrId: 'AMR-BAMB-88319'
    },
    {
      pId: p2.id,
      title: 'Traditional Brass Dhokra Cast Oil Diya Lamp',
      description: 'Lost-wax cast brass oil oil burner made by rural metalsmiths featuring traditional peacock motif.',
      category: 'Handicrafts & Leatherwork',
      price: 980, stock: 25, originVillage: 'Bhor', originDistrict: 'Pune',
      story: 'Handcrafted using ancient lost-wax bronze casting methods.',
      imageUrl: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-LAMP-25', qrId: 'PUN-LAMP-99102'
    },
    {
      pId: p2.id,
      title: 'Terracotta Handcrafted Eco-Friendly Clay Water Bottle (1L)',
      description: 'Natural red clay water pitcher naturally cools water through porous evaporation. Lead-free verified.',
      category: 'Handicrafts & Leatherwork',
      price: 390, stock: 85, originVillage: 'Kumbharwada', originDistrict: 'Kolhapur',
      story: 'Hand-turned on potter wheel by traditional potter families.',
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-CLAY-26', qrId: 'KOL-CLAY-22390'
    },
    {
      pId: p6.id,
      title: 'Hand-Woven Natural Jute & Cotton Floor Chatai Mat',
      description: 'Eco-friendly handloom runner mat woven with golden jute fiber and recycled cotton thread.',
      category: 'Handicrafts & Leatherwork',
      price: 680, stock: 50, originVillage: 'Warora', originDistrict: 'Chandrapur',
      story: 'Crafted by rural women empowerment centers in Vidarbha.',
      imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-JUTE-27', qrId: 'CHN-JUTE-77102'
    },
    {
      pId: p2.id,
      title: 'Warli Tribal Hand-Painted Wall Hanging Canvas',
      description: 'Original Warli folk art depicting village harvest celebrations painted using rice-paste on mud canvas.',
      category: 'Handicrafts & Leatherwork',
      price: 1250, stock: 20, originVillage: 'Jawhar', originDistrict: 'Palghar',
      story: 'Painted by indigenous Warli artists preserving ancestral tribal motifs.',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-WARL-28', qrId: 'PAL-WARL-44109'
    },

    // --- Handloom Textiles & Sarees ---
    {
      pId: p4.id,
      title: 'GI-Tagged Solapur Pure Cotton Jacquard Chaddar (Bedsheet)',
      description: 'Heavyweight Jacquard weave pure cotton Solapuri blanket with classic geometric border pattern.',
      category: 'Handloom Textiles & Sarees',
      price: 850, stock: 110, originVillage: 'Mohol', originDistrict: 'Solapur',
      story: 'Famous worldwide for durable weave density and vibrant fast colors.',
      imageUrl: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-SOLA-29', qrId: 'SOL-CHAD-33901'
    },
    {
      pId: p4.id,
      title: 'Handwoven Paithani Silk Saree with Zari Peacock Pallu',
      description: 'Pure Yeola Paithani silk saree featuring kaleidoscope woven border and opulent gold zari motif.',
      category: 'Handloom Textiles & Sarees',
      price: 12500, stock: 12, originVillage: 'Yeola', originDistrict: 'Nashik',
      story: 'Woven continuously over 25 days by master handloom weavers in Yeola.',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-PAITH-30', qrId: 'NSK-PAITH-10294'
    },
    {
      pId: p4.id,
      title: 'Traditional Ichalkaranji Cotton Nauvari Saree (9 Yards)',
      description: '100% breathable fine cotton 9-yard drape saree styled with authentic Kashta border.',
      category: 'Handloom Textiles & Sarees',
      price: 1850, stock: 35, originVillage: 'Ichalkaranji', originDistrict: 'Kolhapur',
      story: 'Woven in the historic textile hub of Ichalkaranji, known as the Manchester of Maharashtra.',
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-NAUV-31', qrId: 'KOL-NAUV-88210'
    },
    {
      pId: p4.id,
      title: 'Nagpuri Handloom Tussar Silk Dupatta',
      description: 'Rich textured natural Tussar silk scarf with hand-printed tribal flora art.',
      category: 'Handloom Textiles & Sarees',
      price: 2400, stock: 25, originVillage: 'Umred', originDistrict: 'Nagpur',
      story: 'Sourced from Vidarbha wild silkworm rearers and village reelers.',
      imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-TUSS-32', qrId: 'NGP-TUSS-55102'
    },
    {
      pId: p4.id,
      title: 'Hand-Embroidered Karvati Kinar Cotton Saree',
      description: 'Classic Vidarbha saw-tooth border (Karvati) handloom cotton saree woven with organic unbleached yarn.',
      category: 'Handloom Textiles & Sarees',
      price: 3100, stock: 20, originVillage: 'Bhandara Rural', originDistrict: 'Nagpur',
      story: 'Recognized for its distinct saw-edged temple border design.',
      imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-KARV-33', qrId: 'NGP-KARV-99301'
    },
    {
      pId: p4.id,
      title: 'Solapur Terry Towel Set (100% Pure Cotton - Pack of 3)',
      description: 'Super absorbent high-GSM cotton bath towels woven on traditional power looms.',
      category: 'Handloom Textiles & Sarees',
      price: 650, stock: 150, originVillage: 'Barshi', originDistrict: 'Solapur',
      story: 'Long-staple cotton yarn ensures softness even after dozens of washes.',
      imageUrl: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-TOWL-34', qrId: 'SOL-TOWL-11290'
    },

    // --- More Agro & Food Specialties ---
    {
      pId: p3.id,
      title: 'Konkan Wild Honeycomb Jamun Flower Honey (350g)',
      description: 'Monofloral dark honey collected from Jamun blossoms along Western Ghats canopy.',
      category: 'Food Processing & Preserves',
      price: 380, stock: 55, originVillage: 'Chiplun', originDistrict: 'Ratnagiri',
      story: 'Known in Ayurveda for regulating blood sugar balance.',
      imageUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-JAMH-35', qrId: 'RAT-JAMH-44102'
    },
    {
      pId: p5.id,
      title: 'Cold-Pressed Pure Coconut Oil (Edible & Hair Oil 500ml)',
      description: 'Sun-dried copra pressed without thermal heat. Unrefined & unbleached.',
      category: 'Organic Agro Produce',
      price: 240, stock: 130, originVillage: 'Malvan', originDistrict: 'Sindhudurg',
      story: 'Made from coastal Malvani coconuts harvested by local farmer families.',
      imageUrl: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-COCO-36', qrId: 'SND-COCO-66109'
    },
    {
      pId: p1.id,
      title: 'Satara Organic Ginger Powder (Sun-Dried Adrak 200g)',
      description: 'Pungent zesty dried Maharashtrian ginger powder from highland Satara soil.',
      category: 'Organic Agro Produce',
      price: 180, stock: 105, originVillage: 'Koregaon', originDistrict: 'Satara',
      story: 'Harvested at peak maturity to maximize essential gingerol oils.',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-GING-37', qrId: 'SAT-GING-88123'
    },
    {
      pId: p5.id,
      title: 'Hand-Pounded Red Kernel Rice (Unpolished Lal Chawal 1kg)',
      description: 'Nutrient-rich red bran rice cultivated in Konkan wetlands.',
      category: 'Organic Agro Produce',
      price: 140, stock: 160, originVillage: 'Kankavli', originDistrict: 'Sindhudurg',
      story: 'Rich in fiber and iron, traditional staple of Konkan farmers.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-LRICE-38', qrId: 'SND-LRIC-22310'
    },
    {
      pId: p3.id,
      title: 'Konkani Roasted Cashew Nuts (W320 Grade 250g)',
      description: 'Hand-shelled crispy roasted cashews grown in Sindhudurg orchard plantations.',
      category: 'Food Processing & Preserves',
      price: 360, stock: 90, originVillage: 'Vengurla', originDistrict: 'Sindhudurg',
      story: 'Processed in women-run rural cottage peeling units.',
      imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-CASH-39', qrId: 'SND-CASH-55201'
    },
    {
      pId: p5.id,
      title: 'Organic Moong Dal (Whole Green Gram 1kg)',
      description: 'Unpolished native green moong cultivated with bio-fertilizers in Marathwada.',
      category: 'Organic Agro Produce',
      price: 165, stock: 175, originVillage: 'Latur Rural', originDistrict: 'Aurangabad',
      story: 'Directly sourced from drought-mitigation farmer cooperatives.',
      imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-MNG-40', qrId: 'AUR-MNG-11209'
    },
    {
      pId: p5.id,
      title: 'Stone-Ground Bajra Flour (Pearl Millet Atta 1kg)',
      description: 'Freshly ground winter pearl millet flour for authentic warmth and nutrition.',
      category: 'Organic Agro Produce',
      price: 95, stock: 210, originVillage: 'Ahmednagar Rural', originDistrict: 'Ahmednagar',
      story: 'Grown on dryland Maharashtra plains using indigenous seed varieties.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-BAJR-41', qrId: 'AHM-BAJR-77310'
    },
    {
      pId: p3.id,
      title: 'Traditional Malvani Fish Curry Masala (Authentic Blend)',
      description: 'Aromatic coastal spice mix containing triphala, dried red chilies, coriander, and coconut.',
      category: 'Food Processing & Preserves',
      price: 195, stock: 145, originVillage: 'Malvan', originDistrict: 'Sindhudurg',
      story: 'Formulated by coastal homemakers collective for signature Konkan curry flavor.',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-MALV-42', qrId: 'SND-MALV-88102'
    },
    {
      pId: p1.id,
      title: 'Mahabaleshwar Dried Strawberry Slices (Snack Pack 150g)',
      description: 'Dehydrated sweet strawberry crisps with zero added sulfur or sugar.',
      category: 'Food Processing & Preserves',
      price: 220, stock: 80, originVillage: 'Mahabaleshwar', originDistrict: 'Satara',
      story: 'Solar-dried in hygiene-certified micro-factories by Sahyadri SHG.',
      imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-DSTRAW-43', qrId: 'SAT-DSTR-33201'
    },
    {
      pId: p5.id,
      title: 'Organic A2 Gir Cow Desi Ghee (Cultured Bilona Method 500ml)',
      description: 'Hand-churned butter ghee made from grass-fed Gir cow curd using traditional Bilona method.',
      category: 'Organic Agro Produce',
      price: 890, stock: 40, originVillage: 'Sangamner', originDistrict: 'Ahmednagar',
      story: 'Crafted at small-scale rural gaushala committed to native cow preservation.',
      imageUrl: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-GHEE-44', qrId: 'AHM-GHEE-99103'
    },
    {
      pId: p2.id,
      title: 'Handcrafted Copper Water Bottle with Hammered Texture (900ml)',
      description: '99.9% pure jointless copper bottle hand-hammered by Pune coppersmiths.',
      category: 'Handicrafts & Leatherwork',
      price: 820, stock: 50, originVillage: 'Tambat Ali', originDistrict: 'Pune',
      story: 'Crafted by the historic Tambat coppersmith community.',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-COPP-45', qrId: 'PUN-COPP-44109'
    },
    {
      pId: p6.id,
      title: 'Handloom Cotton Yoga Mat with Natural Rubber Grip',
      description: 'Woven unbleached cotton rug coated with anti-slip tree rubber backing.',
      category: 'Handloom Textiles & Sarees',
      price: 1150, stock: 30, originVillage: 'Wardha', originDistrict: 'Nagpur',
      story: 'Inspired by Gandhian Khadi heritage spinning in Wardha ashram villages.',
      imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-YOGA-46', qrId: 'NGP-YOGA-22104'
    },
    {
      pId: p5.id,
      title: 'Pure Organic Flaxseeds (Alsi / Jawas 250g)',
      description: 'Omega-3 rich raw golden flaxseed harvested from organic rainfed farms.',
      category: 'Organic Agro Produce',
      price: 115, stock: 140, originVillage: 'Satara Rural', originDistrict: 'Satara',
      story: 'Cleaned and sorted by local farm women collectives.',
      imageUrl: 'https://images.unsplash.com/photo-1608797178974-15b35a6405bb?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-FLAX-47', qrId: 'SAT-FLAX-77102'
    },
    {
      pId: p3.id,
      title: 'Konkan Raw Tamarind Pulp (Imli without Seeds 500g)',
      description: 'Sun-cured tart wild tamarind pressed without seeds or added salt.',
      category: 'Food Processing & Preserves',
      price: 135, stock: 155, originVillage: 'Sawantwadi', originDistrict: 'Sindhudurg',
      story: 'Harvested from century-old tamarind trees in Konkan valleys.',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-TMR-48', qrId: 'SND-TMR-33219'
    },
    {
      pId: p5.id,
      title: 'Nashik Organic Thompson Grape Seed Oil (Cold-Pressed 250ml)',
      description: 'Light culinary and skin oil extracted from dried wine grape seeds.',
      category: 'Organic Agro Produce',
      price: 450, stock: 40, originVillage: 'Niphad', originDistrict: 'Nashik',
      story: 'Zero-waste initiative converting vineyard byproduct into premium oil.',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-GRPO-49', qrId: 'NSK-GRPO-88102'
    },
    {
      pId: p2.id,
      title: 'Handmade Kolhapuri Leather Slip-on Mojari Footwear',
      description: 'Soft padded genuine leather jutti shoe featuring hand-embroidered silk threads.',
      category: 'Handicrafts & Leatherwork',
      price: 1650, stock: 25, originVillage: 'Kagal', originDistrict: 'Kolhapur',
      story: 'Combines royal court shoe aesthetics with contemporary comfort soles.',
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-MOJ-50', qrId: 'KOL-MOJ-99201'
    },
    {
      pId: p5.id,
      title: 'Organic Black Wheat Flour (Kala Gehu Atta 1kg)',
      description: 'Rare anthocyanin-rich dark wheat ground fresh for diabetic-friendly rotis.',
      category: 'Organic Agro Produce',
      price: 190, stock: 85, originVillage: 'Baramati', originDistrict: 'Pune',
      story: 'Grown under natural bio-farming guidance near Baramati research farms.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-BWHT-51', qrId: 'PUN-BWHT-11309'
    },
    {
      pId: p4.id,
      title: 'Handwoven Khan Fabric Cushion Cover Set (Pack of 2)',
      description: 'Traditional Maharashtrian Khun silk-cotton brocade fabric cushion drapes.',
      category: 'Handloom Textiles & Sarees',
      price: 520, stock: 60, originVillage: 'Guledgudd / Solapur', originDistrict: 'Solapur',
      story: 'Restoring historic 100-year-old Khun weave patterns.',
      imageUrl: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-KHAN-52', qrId: 'SOL-KHAN-55102'
    },
    {
      pId: p3.id,
      title: 'Authentic Konkan Karwanda Pickled Wild Berries',
      description: 'Tangy dark wild carissa berries pickled in spicy sesame oil.',
      category: 'Food Processing & Preserves',
      price: 170, stock: 115, originVillage: 'Ratnagiri', originDistrict: 'Ratnagiri',
      story: 'Foraged wild fruit preserved by coastal tribal women.',
      imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&q=80&w=800',
      batchNo: 'BATCH-KRW-53', qrId: 'RAT-KRW-88190'
    }
  ];

  console.log(`Inserting ${rawProducts.length} verified products into database...`);

  for (const item of rawProducts) {
    const product = await prisma.product.create({
      data: {
        entrepreneurId: item.pId,
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.price,
        stock: item.stock,
        originVillage: item.originVillage,
        originDistrict: item.originDistrict,
        story: item.story,
        status: 'VERIFIED',
        imageUrl: item.imageUrl,
      },
    });

    await prisma.productBatch.create({
      data: {
        productId: product.id,
        batchNo: item.batchNo,
        manufactureDate: '2026-08-01',
        expiryDate: '2027-08-01',
        qrId: item.qrId,
        verificationStatus: 'VERIFIED',
        notes: `GramSetu Verified Quality & QR Authenticated Batch for ${item.title}`,
      },
    });
  }

  // Documents
  await prisma.document.create({
    data: {
      ownerId: e1User.id,
      type: 'FSSAI',
      fileName: 'FSSAI_License_Sahyadri_Organic.pdf',
      storageKey: 'docs/fssai_sahyadri_2026.pdf',
      verificationStatus: 'APPROVED',
      reviewerNote: 'FSSAI License verified against state food safety portal.',
    },
  });

  await prisma.document.create({
    data: {
      ownerId: e2User.id,
      type: 'ARTISAN_CARD',
      fileName: 'Artisan_Identity_Card_Ramesh.pdf',
      storageKey: 'docs/artisan_card_ramesh.pdf',
      verificationStatus: 'APPROVED',
      reviewerNote: 'Government Artisan ID verified.',
    },
  });

  // Sample Order
  const sampleProduct = await prisma.product.findFirst();
  if (sampleProduct) {
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        totalAmount: sampleProduct.price * 2,
        paymentStatus: 'COMPLETED',
        orderStatus: 'IN_TRANSIT',
        shippingAddress: 'Flat 402, Sai Heights, Baner, Pune, Maharashtra - 411045',
        recipientName: 'Rahul Sharma',
        recipientPhone: '+91 98190 77889',
        items: {
          create: [
            {
              productId: sampleProduct.id,
              quantity: 2,
              unitPrice: sampleProduct.price,
            },
          ],
        },
      },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        partnerId: logisticsPartner.id,
        originDistrict: sampleProduct.originDistrict,
        destinationDistrict: 'Pune',
        trackingStatus: 'IN_TRANSIT',
        estimatedDelivery: '2026-09-02',
        trackingHistory: JSON.stringify([
          { status: 'PICKUP_REQUESTED', location: `${sampleProduct.originVillage}, ${sampleProduct.originDistrict}`, timestamp: '2026-08-29T10:00:00Z', note: 'Pickup scheduled with SHG' },
          { status: 'PARTNER_ASSIGNED', location: `${sampleProduct.originDistrict} Hub`, timestamp: '2026-08-29T14:30:00Z', note: 'Package assigned to MahaRural Logistics' },
          { status: 'IN_TRANSIT', location: 'State Highway Hub', timestamp: '2026-08-30T08:15:00Z', note: 'En route to Pune Regional Hub' },
        ]),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'PRODUCT_VERIFIED',
        entityType: 'Product',
        entityId: sampleProduct.id,
        details: 'Approved product listing and batch QR verification.',
      },
    });
  }

  console.log(`Seeding completed successfully! Total products created: ${rawProducts.length}`);
  console.log('Demo Credentials:');
  console.log('----------------------------------------------------');
  console.log('ADMIN:       admin@ruralroute.in     / Password123!');
  console.log('ENTREPRENEUR: savita@ruralroute.in    / Password123!');
  console.log('LOGISTICS:   logistics@ruralroute.in / Password123!');
  console.log('CUSTOMER:    rahul@gmail.com       / Password123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
