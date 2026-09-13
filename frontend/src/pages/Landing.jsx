import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { t } from '@/utils/languages'

export default function LandingPage() {
  const { currentLanguage, isAuthenticated, user } = useAppStore()
  const lang = currentLanguage || 'mr'

  // Interactive 6 Maharashtra Administrative Revenue Divisions with real verified DILRMP data
  const [activeDivision, setActiveDivision] = useState('pune')
  // Interactive 7/12 ELA Forensic Simulator Tab
  const [elaTab, setElaTab] = useState('verified') // 'verified' | 'heatmap' | 'tampered'
  // Quick Search Identifier State
  const [quickGatNo, setQuickGatNo] = useState('')

  const divisionsData = {
    pune: {
      id: 'pune',
      nameMr: 'पुणे विभाग',
      nameEn: 'Pune Division',
      districtsMr: 'पुणे, सातारा, सांगली, सोलापूर, कोल्हापूर',
      districtsCount: 5,
      records: '८४,६२,४००+',
      recordsEn: '84.62 Lakh+',
      villages: '५,४२०',
      villagesEn: '5,420',
      bhuNakshaMapped: '९९.४%',
      bhuNakshaEn: '99.4%',
      dscSigned: '९९.२%',
      dscEn: '99.2%',
      agriArea: '२८.५ लाख हेक्टर',
      agriAreaEn: '28.5 Lakh Ha',
      highlightsMr: 'ऊस, द्राक्ष, डाळिंब व औद्योगिक पट्ट्यांचे सधन अधिकार अभिलेख. १००% रोअर संगणकीकरण पूर्ण.',
      highlightsEn: 'High agricultural RoR density, intensive sugarcane, vineyard & industrial corridors. 100% RoR saturation.',
      featuredTalukasMr: 'हवेली, बारामती, शिरूर, करवीर, सातारा',
    },
    konkan: {
      id: 'konkan',
      nameMr: 'कोकण विभाग',
      nameEn: 'Konkan Division',
      districtsMr: 'मुंबई उपनगर, ठाणे, पालघर, रायगड, रत्नागिरी, सिंधुदुर्ग',
      districtsCount: 6,
      records: '५२,८४,३००+',
      recordsEn: '52.84 Lakh+',
      villages: '६,१८०',
      villagesEn: '6,180',
      bhuNakshaMapped: '९८.६%',
      bhuNakshaEn: '98.6%',
      dscSigned: '९७.८%',
      dscEn: '97.8%',
      agriArea: '१४.८ लाख CTS पत्रिका',
      agriAreaEn: '14.8 Lakh CTS Cards',
      highlightsMr: 'शहरी नगर भूमापन (City Survey CTS) मालमत्ता पत्रके, सीआरझेड किनारपट्टी व गावठाण मिळकतींचे डिजिटायझेशन.',
      highlightsEn: 'High volume of urban CTS property cards, coastal CRZ zones, and Gaothan parcel digitization.',
      featuredTalukasMr: 'ठाणे, कल्याण, अलिबाग, वसई, कुडाळ',
    },
    nashik: {
      id: 'nashik',
      nameMr: 'नाशिक विभाग',
      nameEn: 'Nashik Division',
      districtsMr: 'नाशिक, अहिल्यानगर (अहमदनगर), जळगाव, धुळे, नंदुरबार',
      districtsCount: 5,
      records: '७६,२१,८००+',
      recordsEn: '76.21 Lakh+',
      villages: '७,२००',
      villagesEn: '7,200',
      bhuNakshaMapped: '९८.९%',
      bhuNakshaEn: '98.9%',
      dscSigned: '९८.७%',
      dscEn: '98.7%',
      agriArea: '३१.२ लाख हेक्टर',
      agriAreaEn: '31.2 Lakh Ha',
      highlightsMr: 'कांदा व द्राक्ष बागायत क्षेत्र, आदिवासी क्षेत्र धारणा प्रकार (कलम ३६अ) व सुलभ डिजिटल ७/१२ वाटप.',
      highlightsEn: 'Onion & vineyard horticulture belt, tribal land tenure restrictions (MLRC Sec 36A), robust digital RoRs.',
      featuredTalukasMr: 'नाशिक, त्र्यंबकेश्वर, संगमनेर, भुसावळ, धुळे',
    },
    marathwada: {
      id: 'marathwada',
      nameMr: 'छत्रपती संभाजीनगर विभाग',
      nameEn: 'Chhatrapati Sambhajinagar (Marathwada)',
      districtsMr: 'छत्रपती संभाजीनगर, जालना, परभणी, हिंगोली, नांदेड, बीड, लातूर, धाराशीव',
      districtsCount: 8,
      records: '८१,४५,६००+',
      recordsEn: '81.45 Lakh+',
      villages: '८,५१०',
      villagesEn: '8,510',
      bhuNakshaMapped: '९९.१%',
      bhuNakshaEn: '99.1%',
      dscSigned: '९८.४%',
      dscEn: '98.4%',
      agriArea: '३६.८ लाख हेक्टर',
      agriAreaEn: '36.8 Lakh Ha',
      highlightsMr: 'ई-फेरफार दुय्यम निबंधक स्वयंचलित नोंद (>९९%), सोयाबीन-कापूस पीक पाहणी व डिजिटल पीक विमा जोडणी.',
      highlightsEn: 'Over 99% SRO e-Ferfar automated mutation rate, soybean-cotton crop inspection and PMFBY linkage.',
      featuredTalukasMr: 'छ. संभाजीनगर, लातूर, नांदेड, अंबाजोगाई, जालना',
    },
    amravati: {
      id: 'amravati',
      nameMr: 'अमरावती विभाग',
      nameEn: 'Amravati Division (West Vidarbha)',
      districtsMr: 'अमरावती, अकोला, यवतमाळ, बुलढाणा, वाशिम',
      districtsCount: 5,
      records: '५४,१२,३००+',
      recordsEn: '54.12 Lakh+',
      villages: '७,८५०',
      villagesEn: '7,850',
      bhuNakshaMapped: '९८.३%',
      bhuNakshaEn: '98.3%',
      dscSigned: '९८.१%',
      dscEn: '98.1%',
      agriArea: '२४.४ लाख हेक्टर',
      agriAreaEn: '24.4 Lakh Ha',
      highlightsMr: 'कापूस व संत्रा कृषी क्षेत्रांचे अचूक खाते एकत्रीकरण, पीक नोंद व दुष्काळ/हवामान मदत थेट बँक खात्यात.',
      highlightsEn: 'Black cotton soil agriculture, automated khata consolidation, orange orchards and direct DBT subsidies.',
      featuredTalukasMr: 'अमरावती, अकोला, यवतमाळ, खामगाव, कारंजा',
    },
    nagpur: {
      id: 'nagpur',
      nameMr: 'नागपूर विभाग',
      nameEn: 'Nagpur Division (East Vidarbha)',
      districtsMr: 'नागपूर, वर्धा, भंडारा, गोंदिया, चंद्रपूर, गडचिरोली',
      districtsCount: 6,
      records: '४२,७८,९००+',
      recordsEn: '42.78 Lakh+',
      villages: '८,७४०',
      villagesEn: '8,740',
      bhuNakshaMapped: '९७.९%',
      bhuNakshaEn: '97.9%',
      dscSigned: '९७.६%',
      dscEn: '97.6%',
      agriArea: '१४,२००+ वनजमीन दावे',
      agriAreaEn: '14,200+ FRA Claims',
      highlightsMr: 'वनहक्क कायदेशीर दावे (FRA), कोळसा व खनिज खाण पट्टे, भातशेती सीमांकन व जीआयएस नकाशा समन्वय.',
      highlightsEn: 'Forest Rights Act (FRA) community titles, mineral/coal survey boundaries, and paddy field GIS layers.',
      featuredTalukasMr: 'नागपूर शहर, हिंगणा, उमरेड, चंद्रपूर, बल्लारपूर',
    },
  }

  const curDiv = divisionsData[activeDivision] || divisionsData.pune

  // 10 Official Maharashtra Revenue Document Types
  const officialDocTypes = [
    {
      id: '7_12',
      badge: 'गाव नमुना ७/१२',
      titleMr: 'गाव नमुना ७/१२ उतारा',
      titleEn: 'Form 7/12 RoR Extract',
      descMr: 'अधिकार अभिलेख (फॉर्म ७) व पीक पाहणी (फॉर्म १२) पत्रक. भूमापन गट क्रमांक, क्षेत्र, भोगवटादार वर्ग व पीक नोंद.',
      category: 'कृषी भूमी (Rural)',
      icon: 'description',
    },
    {
      id: '8_a',
      badge: 'गाव नमुना ८-अ',
      titleMr: 'गाव नमुना ८-अ खाते नोंद',
      titleEn: 'Form 8-A Khata Register',
      descMr: 'खातेदाराकडील सर्व जमिनींचे एकत्रित क्षेत्र, विविध सर्व्हे क्रमांक व देय शासकीय जमीन महसूल आकारणी पत्रक.',
      category: 'खातेवही (Ledger)',
      icon: 'format_list_bulleted',
    },
    {
      id: 'property_card',
      badge: 'मालमत्ता पत्रक',
      titleMr: 'नगर भूमापन मालमत्ता पत्रक',
      titleEn: 'City Survey CTS Property Card',
      descMr: 'शहरी व गावठाण क्षेत्रातील भूखंडाचे मालकी हक्क, सीटीएस (CTS) क्रमांक व स्थानिक नगररचना नोंद.',
      category: 'शहरी मिळकत (Urban)',
      icon: 'location_city',
    },
    {
      id: 'ferfar',
      badge: 'गाव नमुना ६ फेरफार',
      titleMr: 'फेरफार नोंदवही (e-Ferfar)',
      titleEn: 'Mutation Register (Form 6)',
      descMr: 'खरेदीखत, वारस नोंद, वाटपपत्र, बक्षीसपत्र व न्यायालयीन आदेशांनुसार महसूल हक्कात झालेल्या बदलांची ऐतिहासिक नोंद.',
      category: 'हक्क बदल (Legal)',
      icon: 'history_edu',
    },
    {
      id: 'sale_deed',
      badge: 'नोंदणीकृत खरेदीखत',
      titleMr: 'नोंदणीकृत खरेदीखत (iSARITA)',
      titleEn: 'Registered Conveyance Deed',
      descMr: 'दुय्यम निबंधक (SRO) कार्यालयातील अधिकृत खरेदी-विक्री दस्त, मुद्रांक शुल्क भरणा व निर्देशांक-२ (Index-II) प्रत.',
      category: 'हस्तांतरण (Conveyance)',
      icon: 'gavel',
    },
    {
      id: 'search_report',
      badge: 'शोध व बोजा अहवाल',
      titleMr: '३०-वर्षीय शोध व बोजा प्रमाणपत्र',
      titleEn: '30-Year Title & Non-Encumbrance',
      descMr: 'कायदेशीर निष्पक्षता, राष्ट्रीयीकृत बँक पीक कर्ज बोजा, गहाणखत व न्यायालयीन दावे नसलेबाबत अधिकृत अहवाल.',
      category: 'टायटल सर्च (Audit)',
      icon: 'find_in_page',
    },
    {
      id: 'gat_map',
      badge: 'गट नकाशा (BhuNaksha)',
      titleMr: 'कॅडॅस्ट्रल गट नकाशा व मोजणी प्रत',
      titleEn: 'Cadastral Survey Map / Tipan',
      descMr: 'भूमी अभिलेख उपअधीक्षक कार्यालयातील अधिकृत सीमांकन नकाशा, आकारफोड टिपण व अक्षांश-रेखांश सीमा.',
      category: 'जीआयएस नकाशा (GIS)',
      icon: 'map',
    },
    {
      id: 'na_order',
      badge: 'अकृषिक सनद',
      titleMr: 'अकृषिक (NA) आदेश व सनद',
      titleEn: 'NA Order & Sanad (Sec 44)',
      descMr: 'जिल्हाधिकारी किंवा उपविभागीय अधिकारी (SDO) यांचा जमीन अकृषिक वापर मंजुरी आदेश व सनद पत्रक.',
      category: 'अकृषिक रूपांतरण (NA)',
      icon: 'domain',
    },
    {
      id: 'gift_deed',
      badge: 'बक्षीस / हक्कसोड',
      titleMr: 'बक्षीसपत्र व हक्कसोड दस्त',
      titleEn: 'Gift & Relinquishment Deed',
      descMr: 'कुटुंबातील रक्ताच्या नात्यातील सदस्यांमध्ये विनामोबदला हक्क हस्तांतरण किंवा सह-खातेदार हक्कसोड नोंद.',
      category: 'कौटुंबिक दस्त (Family)',
      icon: 'volunteer_activism',
    },
    {
      id: 'partition_deed',
      badge: 'वारस व वाटपपत्र',
      titleMr: 'वारस तपास नोंद व वाटपपत्र',
      titleEn: 'Legal Heirship & Partition',
      descMr: 'तहसीलदार वारस चौकशी हुकूमनामा (कलम ८५) व कायदेशीर वारसांमध्ये संमतीने झालेला जमिनीचा हिस्सा वाटप दस्त.',
      category: 'वारसा हक्क (Succession)',
      icon: 'family_restroom',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. HERO SECTION - High-Impact Sovereign Governance & Real State Metrics */}
      <section className="relative bg-gradient-to-b from-[#0B2545] via-[#133A6F] to-[#091B35] text-white py-14 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500 overflow-hidden">
        {/* Background decorative Devanagari watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <span className="text-[320px] font-black tracking-tighter select-none">भू</span>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          {/* Official NIC & DILRMP Governance Standards Badge */}
          <div className="inline-flex items-center gap-2.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
            <span className="text-sm">🏛️</span>
            <span>महाराष्ट्र शासन महसूल व वन विभाग • DILRMP / MahaBhumi Compliant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-5xl mx-auto mb-4 font-serif">
            <span className="text-amber-400">भूनेत्रा (BHUNETRA)</span>
            <span className="block text-xl sm:text-3xl lg:text-4xl mt-2 text-slate-100 font-semibold font-sans">
              {lang === 'mr'
                ? 'अत्याधुनिक भूमी अभिलेख संगणकीकरण, फॉरेन्सिक ईएलए व जीआयएस प्रणाली'
                : lang === 'hi'
                ? 'सॉवरेन भूमि अभिलेख डिजिटलीकरण, फोरेंसिक ईएलए एवं जीआईएस निगरानी प्रणाली'
                : 'Intelligent Land Record Digitization, Forensic ELA & GIS Monitoring System'}
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-200 max-w-4xl mx-auto mb-8 leading-relaxed font-light">
            {lang === 'mr'
              ? 'महाराष्ट्रातील ३६ जिल्ह्यांमधील ३.५+ कोटी ७/१२ उतारे, ८-अ, फेरफार व मिळकत पत्रिकांचे १००% स्वायत्त (Offline Sovereign) ओसीआर संगणकीकरण, फॉरेन्सिक छेडछाड तपासणी व भारताच्या २२ अधिकृत भाषांमध्ये प्रमाणित डिजिटल वितरण.'
              : lang === 'hi'
              ? 'महाराष्ट्र के ३६ जिलों के ३.५+ करोड़ ७/१२ खसरा, ८-अ एवं नामांतरण दस्तावेजों का पूर्णतः ऑफलाइन देवनागरी ओसीआर डिजिटलीकरण और २२ संवैधानिक भाषाओं में डिजिटल प्रमाणन।'
              : "India's privacy-first, offline sovereign AI platform for Maharashtra 7/12 extracts, Devanagari OCR, automated revenue verification, and certified digital land records across all 22 official languages of India."}
          </p>

          {/* Action CTAs - Direct active links with auth gating */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-2xl mx-auto mb-8">
            <Link
              to={isAuthenticated ? (user?.role === 'civilian' ? '/citizen' : '/dashboard') : '/login?role=civilian'}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-amber-300"
            >
              <span className="text-lg">📜</span>
              <span>{isAuthenticated ? t('enterPortalBtn', lang) : (lang === 'mr' ? 'नागरिक प्रवेश (Citizen Login)' : 'Citizen Portal Login')}</span>
              <span className="text-xl">➔</span>
            </Link>

            <Link
              to={isAuthenticated ? '/dashboard' : '/login?role=officer'}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#173868] hover:bg-[#1E4885] text-amber-300 hover:text-amber-200 font-bold text-base rounded-xl border border-amber-400/40 hover:border-amber-400 transition-all flex items-center justify-center gap-2"
            >
              <span>🏛️</span>
              <span>{isAuthenticated ? t('officerPortalBtn', lang) : (lang === 'mr' ? 'अधिकारी लॉगिन (Officer Login)' : 'Officer Login')}</span>
            </Link>

            <Link
              to={isAuthenticated ? '/records' : '/login'}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-base rounded-xl border border-slate-600 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
            >
              <span>🗺️</span>
              <span>{t('gisPortalBtn', lang)}</span>
            </Link>
          </div>

          {/* Quick Real 7/12 Search Bar */}
          <div className="max-w-xl mx-auto bg-slate-900/80 backdrop-blur border border-amber-500/30 rounded-xl p-2 flex items-center gap-2 shadow-2xl">
            <span className="text-amber-400 text-lg pl-3">🔍</span>
            <input
              type="text"
              value={quickGatNo}
              onChange={(e) => setQuickGatNo(e.target.value)}
              placeholder={lang === 'mr' ? 'उदा. गट क्र. १४२/३अ किंवा २४८ (Wagholi)' : 'e.g. Gat No. 142/3A or 248 (Wagholi)...'}
              className="bg-transparent border-none text-white text-sm placeholder-slate-400 focus:outline-none flex-1 px-2 py-1.5"
            />
            <Link
              to={isAuthenticated ? `/citizen?gat=${encodeURIComponent(quickGatNo || '142/3A')}` : `/login?role=civilian`}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all"
            >
              {lang === 'mr' ? 'शोधा' : 'Search 7/12'}
            </Link>
          </div>

          {/* 6 Real Maharashtra State-wide DILRMP Verified Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-12 pt-8 border-t border-slate-700/60 max-w-5xl mx-auto text-center">
            <div className="p-3 bg-[#0A1E3F]/70 rounded-xl border border-slate-700/80 hover:border-amber-400/50 transition-all">
              <div className="text-2xl lg:text-3xl font-black text-amber-400">३.५+ कोटी</div>
              <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">७/१२ व ८-अ उतारे</div>
              <div className="text-[10px] text-slate-400 mt-0.5">100% RoR Saturation</div>
            </div>

            <div className="p-3 bg-[#0A1E3F]/70 rounded-xl border border-slate-700/80 hover:border-amber-400/50 transition-all">
              <div className="text-2xl lg:text-3xl font-black text-amber-400">४३,९००+</div>
              <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">महसूल गावे</div>
              <div className="text-[10px] text-slate-400 mt-0.5">36 Districts • 358 Talukas</div>
            </div>

            <div className="p-3 bg-[#0A1E3F]/70 rounded-xl border border-slate-700/80 hover:border-amber-400/50 transition-all">
              <div className="text-2xl lg:text-3xl font-black text-amber-400">१.५+ कोटी</div>
              <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">भू-नकाशा व सीटीएस</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cadastral GIS Layers</div>
            </div>

            <div className="p-3 bg-[#0A1E3F]/70 rounded-xl border border-slate-700/80 hover:border-amber-400/50 transition-all">
              <div className="text-2xl lg:text-3xl font-black text-amber-400">&lt; ७५० ms</div>
              <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">सॉवरेन OCR वेग</div>
              <div className="text-[10px] text-slate-400 mt-0.5">On-Device Offline AI</div>
            </div>

            <div className="p-3 bg-[#0A1E3F]/70 rounded-xl border border-slate-700/80 hover:border-amber-400/50 transition-all">
              <div className="text-2xl lg:text-3xl font-black text-amber-400">९९.४%</div>
              <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">फॉरेन्सिक ईएलए</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Tamper & Stamp Audit</div>
            </div>

            <div className="p-3 bg-[#0A1E3F]/70 rounded-xl border border-slate-700/80 hover:border-amber-400/50 transition-all">
              <div className="text-2xl lg:text-3xl font-black text-amber-400">२२ भाषा</div>
              <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">८वी अनुसूची भाषा</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Certified QR PDF Export</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL MAHARASHTRA 6 REVENUE DIVISIONS INTERACTIVE DATA HUB */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-amber-700 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
            📊 अधिकृत महसूल आकडेवारी (MAHABHUMI / DILRMP STATS)
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            {lang === 'mr' ? 'महाराष्ट्रातील ६ प्रशासकीय महसूल विभाग' : 'Maharashtra 6 Administrative Revenue Divisions'}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {lang === 'mr'
              ? 'महाराष्ट्र शासनाच्या अधिकृत महसूल विभागांमधील प्रत्यक्ष संगणकीकृत ७/१२ उतारे, गावे, भू-नकाशा व डिजिटल स्वाक्षरी प्रगती पहा.'
              : 'Explore live official digitization coverage, village saturation, Cadastral BhuNaksha GIS mapping, and digital signature adoption across Maharashtra.'}
          </p>
        </div>

        {/* Division Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {Object.values(divisionsData).map((div) => {
            const isSelected = activeDivision === div.id
            return (
              <button
                key={div.id}
                onClick={() => setActiveDivision(div.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-md transform -translate-y-0.5'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>📍</span>
                <span>{lang === 'mr' ? div.nameMr : div.nameEn}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'}`}>
                  {div.districtsCount} {lang === 'mr' ? 'जिल्हे' : 'Dist.'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Division Detailed Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E4885] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider mb-1">
                <span>🏛️ महसूल आयुक्त कार्यालय (COMMISSIONERATE OF LAND RECORDS)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {lang === 'mr' ? curDiv.nameMr : curDiv.nameEn}
              </h3>
              <p className="text-slate-200 text-sm mt-1">
                <span className="font-semibold text-amber-300">{lang === 'mr' ? 'समाविष्ट जिल्हे: ' : 'Districts: '}</span>
                {curDiv.districtsMr}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/records"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow"
              >
                <span>🗺️</span>
                <span>{lang === 'mr' ? 'विभागाचा नकाशा पहा' : 'View Division Map'}</span>
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Division Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">{lang === 'mr' ? 'एकूण ७/१२ उतारे' : 'Total 7/12 Extracts'}</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{curDiv.records}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-0.5">✔ 100% संगणकीकृत</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">{lang === 'mr' ? 'महसूल गावे' : 'Revenue Villages'}</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{curDiv.villages}</div>
                <div className="text-[11px] text-blue-600 font-bold mt-0.5">पूर्ण व्याप्ती (Full Saturation)</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">{lang === 'mr' ? 'भू-नकाशा मॅपिंग' : 'BhuNaksha GIS Mapped'}</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{curDiv.bhuNakshaMapped}</div>
                <div className="text-[11px] text-indigo-600 font-bold mt-0.5">GeoJSON Cadastral Layer</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">{lang === 'mr' ? 'डिजिटल स्वाक्षरी (DSC)' : 'Digital Signature (DSC)'}</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{curDiv.dscSigned}</div>
                <div className="text-[11px] text-purple-600 font-bold mt-0.5">16-Digit ULPIN (भू-आधार)</div>
              </div>
            </div>

            {/* Division Qualitative Info Banner */}
            <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-slate-800 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-amber-900">📍 {lang === 'mr' ? 'महत्त्वाचे तालुके: ' : 'Key Talukas: '}</span>
                <span className="text-slate-700 font-medium">{curDiv.featuredTalukasMr}</span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{curDiv.highlightsMr}</p>
              </div>
              <Link
                to={`/citizen?district=${curDiv.id === 'pune' ? 'Pune' : curDiv.id === 'nashik' ? 'Nashik' : 'Nagpur'}`}
                className="whitespace-nowrap px-4 py-2 bg-[#0F2C59] hover:bg-[#1E4885] text-white font-bold text-xs rounded-lg transition-all text-center"
              >
                {lang === 'mr' ? 'या विभागातील ७/१२ शोधा ➔' : 'Search 7/12 in Division ➔'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 7/12 ANATOMY & FORENSIC ELA TAMPER SIMULATOR */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-950/80 px-3.5 py-1 rounded-full border border-amber-500/40">
              🔬 फॉरेन्सिक विश्लेषण व सातबारा संरचना (FORENSIC ELA INSPECTOR)
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
              {lang === 'mr' ? 'प्रत्यक्ष ७/१२ उतारा व फॉरेन्सिक छेडछाड तपासणी' : 'Authentic 7/12 Extract Anatomy & Tamper Detection'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2">
              {lang === 'mr'
                ? 'भूनेत्रा प्रणाली प्रत्यक्ष सातबारा उताऱ्यातील अधिकार अभिलेख, पीक पाहणी, इतर हक्क व एरर लेव्हल ॲनालिसिस (ELA) द्वारे बनावट दस्त कसे ओळखते ते पहा.'
                : 'Experience how Bhunetra dissects authentic 7/12 records and catches digital manipulation, spliced seals, and altered survey numbers using on-device Error Level Analysis.'}
            </p>
          </div>

          {/* Interactive Simulator Mode Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setElaTab('verified')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 border ${
                elaTab === 'verified'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
            >
              <span>✔</span>
              <span>{lang === 'mr' ? '१. मूळ प्रमाणित दस्तऐवज (Verified Scan)' : '1. Authentic Verified 7/12'}</span>
            </button>

            <button
              onClick={() => setElaTab('heatmap')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 border ${
                elaTab === 'heatmap'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
            >
              <span>📊</span>
              <span>{lang === 'mr' ? '२. ईएलए फॉरेन्सिक मॅट्रिक्स (ELA Heatmap)' : '2. ELA Quantization Heatmap'}</span>
            </button>

            <button
              onClick={() => setElaTab('tampered')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 border ${
                elaTab === 'tampered'
                  ? 'bg-red-600 text-white border-red-500 shadow-lg animate-pulse'
                  : 'bg-slate-800 text-red-400 hover:bg-slate-700 border-slate-700'
              }`}
            >
              <span>🚨</span>
              <span>{lang === 'mr' ? '३. छेडछाड शोध सिम्युलेटर (Tamper Alert)' : '3. Fraud & Tamper Detected'}</span>
            </button>
          </div>

          {/* Simulated 7/12 Extract Visual Box */}
          <div className="bg-slate-950 rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-8 max-w-5xl mx-auto">
            {/* Status Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                    {lang === 'mr' ? 'महाराष्ट्र शासन महसूल विभाग' : 'Govt. of Maharashtra Revenue Dept.'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-xs font-mono">ULPIN: MH27-025-0142-003A-9812</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white mt-1">
                  गाव नमुना ७/१२ (अधिकार अभिलेख व पीक पाहणी पत्रक)
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  गाव: <span className="text-slate-200 font-semibold">वाघोली (Wagholi)</span> | तालुका: <span className="text-slate-200 font-semibold">हवेली (Haveli)</span> | जिल्हा: <span className="text-slate-200 font-semibold">पुणे (Pune)</span>
                </p>
              </div>

              <div>
                {elaTab === 'verified' && (
                  <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2">
                    <span className="text-base">✔</span>
                    <div>
                      <div>प्रमाणित अधिकृत अभिलेख (Verified)</div>
                      <div className="text-[10px] text-emerald-300 font-mono">Confidence: 99.4% • ELA Clean</div>
                    </div>
                  </div>
                )}
                {elaTab === 'heatmap' && (
                  <div className="bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2">
                    <span className="text-base">📊</span>
                    <div>
                      <div>ईएलए फ्रिक्वेन्सी मॅट्रिक्स (Quantization Normal)</div>
                      <div className="text-[10px] text-blue-300 font-mono">Quant Table: 94.2% Uniform</div>
                    </div>
                  </div>
                )}
                {elaTab === 'tampered' && (
                  <div className="bg-red-500/20 text-red-400 border border-red-500/40 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <div>
                      <div className="text-red-300">छेडछाड आढळली (Tampering Flagged!)</div>
                      <div className="text-[10px] text-red-400 font-mono">High Noise Variance at Gat & Stamp</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Split Extract View: Village Form 7 (Top/Left) & Village Form 12 (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Form 7 - Record of Rights */}
              <div className={`p-5 rounded-xl border transition-all ${
                elaTab === 'tampered' ? 'bg-red-950/20 border-red-500/60' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="text-amber-400 font-bold text-xs uppercase">गाव नमुना ७ (अधिकार अभिलेख)</span>
                  <span className="text-slate-400 text-[11px] font-mono">खाते क्रमांक: ५८२</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">गट / सर्व्हे क्रमांक:</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      elaTab === 'tampered'
                        ? 'bg-red-500 text-white font-black animate-pulse border border-red-300'
                        : 'text-amber-300 bg-slate-800'
                    }`}>
                      {elaTab === 'tampered' ? '१४२/३ब (Altered from 142/3A!)' : '१४२/३अ (142/3A)'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">धारणा प्रकार (Tenure):</span>
                    <span className="text-slate-200 font-semibold">भोगवटादार वर्ग - १ (Class-1 Unrestricted)</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">एकूण क्षेत्र (Total Area):</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      elaTab === 'tampered'
                        ? 'bg-red-500/80 text-white border border-red-400'
                        : 'text-slate-200'
                    }`}>
                      {elaTab === 'tampered' ? '१.८४ हेक्टर (Inflated!)' : '० हेक्टर ८४ आर (0.84 Ha)'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">पोटखराबा (लागवडीस अयोग्य):</span>
                    <span className="text-slate-300 font-mono">० हेक्टर ०४ आर (वर्ग अ)</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">आकारणी (Revenue Assessment):</span>
                    <span className="text-slate-300 font-mono">रु. ४.२५ पैसे</span>
                  </div>

                  <div className="pt-1">
                    <div className="text-slate-400 mb-1">खातेदारांचे नाव (Occupants):</div>
                    <div className="bg-slate-800/80 p-2 rounded text-slate-200 space-y-0.5">
                      <div className="font-semibold">१. श्री. रमेश विठ्ठलराव पाटील (१/२ हिस्सा)</div>
                      <div className="font-semibold">२. श्रीमती मंदाकिनी रमेश पाटील (१/२ हिस्सा)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form 12 & Other Rights (Crop & Encumbrance) */}
              <div className="space-y-4">
                {/* Form 12 */}
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-amber-400 font-bold uppercase">गाव नमुना १२ (पीक पाहणी पत्रक)</span>
                    <span className="text-slate-400 font-mono">हंगाम: खरीप २०२५-२६</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
                    <div className="bg-slate-800/70 p-2 rounded">
                      <div className="text-slate-400">पीक १ (बागायत):</div>
                      <div className="font-bold text-slate-200">सोयाबीन — ०.५० हेक्टर</div>
                      <div className="text-emerald-400 text-[10px]">जलसिंचन: विहीर क्रमांक २</div>
                    </div>
                    <div className="bg-slate-800/70 p-2 rounded">
                      <div className="text-slate-400">पीक २ (जिरायत):</div>
                      <div className="font-bold text-slate-200">भुईमूग — ०.३० हेक्टर</div>
                      <div className="text-slate-400 text-[10px]">पावसाचे पाणी</div>
                    </div>
                  </div>
                </div>

                {/* Other Rights & Encumbrances */}
                <div className={`p-4 rounded-xl border text-xs transition-all ${
                  elaTab === 'tampered' ? 'bg-red-950/20 border-red-500/60' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between pb-1 mb-1">
                    <span className="text-amber-400 font-bold uppercase">इतर हक्क व कर्ज बोजा (Liens)</span>
                    <span className="text-slate-400 font-mono">फेरफार क्र. १८४२</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded text-slate-200 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <span>🏦</span>
                      <span>बँक ऑफ महाराष्ट्र, वाघोली शाखा — पीक कर्ज बोजा रु. २,५०,०००/-</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      विहिरीच्या पाण्याचा १/३ सामायिक हक्क | रस्त्याचा पूर्वापार वहिवाट हक्क.
                    </div>
                  </div>
                </div>

                {/* ELA Technical Forensic Result Badge */}
                {elaTab === 'tampered' ? (
                  <div className="p-3 bg-red-900/40 rounded-xl border border-red-500 text-xs text-red-200">
                    <div className="font-bold text-red-400 flex items-center gap-1.5">
                      <span>🚨</span>
                      <span>फॉरेन्सिक छेडछाड अहवाल (Tamper Detection Report):</span>
                    </div>
                    <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-[11px] text-red-300">
                      <li>गट क्रमांक पिक्सल्समध्ये हाय-फ्रिक्वेन्सी कट-पेस्ट विसंगती आढळली (142/3B altered).</li>
                      <li>तलाठी अधिकृत शिक्क्याच्या कॉम्प्रेशन रेटमध्ये ७८% फरक (Forged Rubber Stamp).</li>
                      <li>दस्तऐवज स्वयंचलितरित्या तहसीलदार चौकशी कक्षाकडे पुनर्निर्देशित करण्यात आला.</li>
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-900/30 rounded-xl border border-emerald-600/50 text-xs text-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-400">✔ फॉरेन्सिक ईएलए उत्तीर्ण:</span>
                      <span className="text-slate-300 text-[11px] ml-1.5">शून्य छेडछाड • मूळ स्कॅन सत्यता प्रमाणित</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-xs">SHA-256 MATCHED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 10 OFFICIAL MAHARASHTRA REVENUE DOCUMENT TYPES GRID */}
      <section id="capabilities" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-amber-700 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
            📜 महाराष्ट्र जमीन महसूल संहिता (MLRC 1966)
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            {lang === 'mr' ? '१० अधिकृत महसूल दस्तऐवज व डिजिटल सेवा' : '10 Official Revenue Document Types'}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {lang === 'mr'
              ? 'भूनेत्रा प्रणालीद्वारे महसूल व वन विभागाच्या सर्व प्रमुख कृषी, नागरी व कायदेशीर दस्तऐवजांचे संपूर्ण डिजिटायझेशन व २२ भाषांमध्ये प्रमाणीकरण.'
              : 'End-to-end sovereign OCR, indexing, and tamper verification across rural, urban, and conveyance revenue archives.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {officialDocTypes.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between hover:border-amber-400"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-xl border border-amber-200 text-amber-800">
                    <span className="material-symbols-outlined">{doc.icon}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {doc.category}
                  </span>
                </div>

                <div className="text-xs font-bold text-amber-700 mb-0.5">{doc.badge}</div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {lang === 'mr' ? doc.titleMr : doc.titleEn}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  {doc.descMr}
                </p>
              </div>

              <Link
                to={`/citizen?type=${doc.id}`}
                className="w-full text-center py-1.5 px-2 bg-slate-100 hover:bg-[#0F2C59] text-slate-700 hover:text-white font-bold text-xs rounded-lg transition-all border border-slate-200"
              >
                {lang === 'mr' ? 'अभिलेख शोधा ➔' : 'Search Record ➔'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. END-TO-END DIGITIZATION WORKFLOW */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {lang === 'mr' ? 'अखंड महसूल संगणकीकरण प्रक्रिया' : 'End-to-End Digitization Workflow'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              {lang === 'mr'
                ? 'कागदी स्कॅनपासून ते २२ भाषांमधील डिजिटल प्रमाणित क्यूआर प्रमाणपत्रापर्यंत ४ सोप्या टप्प्यांत प्रक्रिया.'
                : 'From paper scan to certified 22-language digital 7/12 record in 4 deterministic steps.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 relative">
              <div className="text-amber-400 font-mono text-xs font-bold mb-2">STEP 01</div>
              <h4 className="font-bold text-white mb-1.5">{lang === 'mr' ? 'स्कॅन दस्तऐवज अपलोड' : 'Multi-Format Ingestion'}</h4>
              <p className="text-xs text-slate-300 leading-normal">
                {lang === 'mr' ? 'TIFF, PDF, JPG स्कॅनचे स्वयंचलित डि-स्क्यूइंग व कॉन्ट्रास्ट वर्धन.' : 'Upload TIFF, PDF, or JPG scans with automatic deskewing & binarization.'}
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 relative">
              <div className="text-amber-400 font-mono text-xs font-bold mb-2">STEP 02</div>
              <h4 className="font-bold text-white mb-1.5">{lang === 'mr' ? 'देवनागरी OCR व ईएलए' : 'Devanagari OCR & ELA'}</h4>
              <p className="text-xs text-slate-300 leading-normal">
                {lang === 'mr' ? 'CRAFT देवनागरी टेक्स्ट डिटेक्शन व पिक्सेल छेडछाड तपासणी.' : 'CRAFT text detection for Marathi numerals (०-९) & quantization ELA audit.'}
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 relative">
              <div className="text-amber-400 font-mono text-xs font-bold mb-2">STEP 03</div>
              <h4 className="font-bold text-white mb-1.5">{lang === 'mr' ? 'राज्य डेटाबेस पडताळणी' : 'Registry Cross-Match'}</h4>
              <p className="text-xs text-slate-300 leading-normal">
                {lang === 'mr' ? 'काढलेला गट व खाते क्रमांक महाभूलेख अभिलेखांशी पडताळणी.' : 'Deterministic cross-verification against e-Mahabhumi registry & ULPIN.'}
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 relative">
              <div className="text-amber-400 font-mono text-xs font-bold mb-2">STEP 04</div>
              <h4 className="font-bold text-white mb-1.5">{lang === 'mr' ? '२२ भाषा डिजिटल प्रमाणपत्र' : 'Multilingual QR Certificate'}</h4>
              <p className="text-xs text-slate-300 leading-normal">
                {lang === 'mr' ? 'संविधान ८वी अनुसूची भाषांमध्ये अधिकृत क्यूआर डिजिटल पीडीएफ.' : 'Instant certified DSC PDF with tamper-proof cryptographic QR code.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GOVERNANCE & SOVEREIGN SECURITY BADGES */}
      <section className="bg-slate-100 py-8 px-4 border-t border-slate-300 text-center">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-600 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-base">🛡️</span>
            <span>100% On-Premise Sovereign AI (Zero Cloud Leaks)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-base">🏛️</span>
            <span>DILRMP (Department of Land Resources, MoRD)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 text-base">📜</span>
            <span>Maharashtra Land Revenue Code, 1966</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600 text-base">🌐</span>
            <span>Bhashini National Translation Mission</span>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="bg-gradient-to-r from-[#0B2545] via-[#133A6F] to-[#091B35] text-white py-14 px-4 text-center border-t-4 border-amber-500">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">
            {lang === 'mr' ? 'आपला डिजिटल ७/१२ किंवा भूमी अभिलेख शोधा' : 'Search Your Digital 7/12 Land Record Now'}
          </h2>
          <p className="text-slate-200 text-sm sm:text-base mb-8 max-w-2xl mx-auto font-light">
            {lang === 'mr'
              ? 'महाराष्ट्रातील ३६ जिल्ह्यांमधील प्रमाणित महसूल अभिलेख शोधा, फॉरेन्सिक ईएलए पडताळणी करा आणि २२ भाषांमध्ये मोफत डाउनलोड करा.'
              : 'Access certified land records, verify scanned copies for forgery, and download authenticated multilingual extracts instantly.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? (user?.role === 'civilian' ? '/citizen' : '/dashboard') : '/login?role=civilian'}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base rounded-xl shadow-2xl transition-all transform hover:scale-105"
            >
              <span>{isAuthenticated ? t('enterPortalBtn', lang) : (lang === 'mr' ? 'नागरिक प्रवेश (Citizen)' : 'Citizen Portal')}</span>
              <span className="text-xl">➔</span>
            </Link>

            <Link
              to={isAuthenticated ? '/dashboard' : '/login?role=officer'}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base rounded-xl border border-slate-600 transition-all"
            >
              <span>🏛️ {isAuthenticated ? t('officerPortalBtn', lang) : (lang === 'mr' ? 'अधिकारी लॉगिन (Officer)' : 'Officer Login')}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
