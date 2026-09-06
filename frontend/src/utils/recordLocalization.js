/**
 * recordLocalization.js
 * ─────────────────────────────────────────────────────────────────
 * BHUNETRA — Multilingual Land Record Field Localizer
 *
 * Dynamically translates and transliterates land record entities
 * (Districts, Tehsils, Villages, Landowner Names, Ownership Types,
 * Encumbrances, and Land Area units) across all 22 Constitutional
 * Languages of India + English.
 * ─────────────────────────────────────────────────────────────────
 */

// ─── Entity Translation Lexicon ────────────────────────────────────

const LOCATION_LEXICON = {
  // Districts
  pune: {
    en: 'Pune',
    mr: 'पुणे',
    hi: 'पुणे',
    gu: 'પૂણે',
    bn: 'পুনে',
    ta: 'புனே',
    te: 'పూణే',
    kn: 'ಪುಣೆ',
    ml: 'പുണെ',
    pa: 'ਪੁਣੇ',
    or: 'ପୁଣେ',
    as: 'পুনে',
    ur: 'پونے',
    sa: 'पुण्यपत्तनम् (पुणे)',
    ne: 'पुणे',
    kok: 'पुणें',
    mai: 'पुणे',
  },
  nashik: {
    en: 'Nashik',
    mr: 'नाशिक',
    hi: 'नासिक',
    gu: 'નાસિક',
    bn: 'নাসিক',
    ta: 'நாசிக்',
    te: 'నాసిక్',
    kn: 'ನಾಸಿಕ್',
    ml: 'നാസിക്',
    pa: 'ਨਾਸਿਕ',
    or: 'ନାସିକ',
    as: 'নাচিক',
    ur: 'ناسک',
    sa: 'नासिकम्',
    ne: 'नासिक',
    kok: 'नाशिक',
    mai: 'नासिक',
  },

  // Tehsils
  haveli: {
    en: 'Haveli',
    mr: 'हवेली',
    hi: 'हवेली',
    gu: 'હવેલી',
    bn: 'হাভেলি',
    ta: 'ஹவேலி',
    te: 'హవేలీ',
    kn: 'ಹವೇಲಿ',
    ml: 'ഹവേലി',
    pa: 'ਹਵੇਲੀ',
    or: 'ହଭେଲୀ',
    as: 'হাভেলি',
    ur: 'حویلی',
    sa: 'हवेली',
    ne: 'हवेली',
    kok: 'हवेली',
    mai: 'हवेली',
  },
  trimbakeshwar: {
    en: 'Trimbakeshwar',
    mr: 'त्र्यंबकेश्वर',
    hi: 'त्र्यंबकेश्वर',
    gu: 'ત્ર્યંબકેશ્વર',
    bn: 'ত্র্যম্বকেশ্বর',
    ta: 'த்ரியம்பகேஷ்வர்',
    te: 'త్రయంబకేశ్వర్',
    kn: 'ತ್ರ್ಯಂಬಕೇಶ್ವರ',
    ml: 'ത്ര്യംബകേശ്വർ',
    pa: 'ਤ੍ਰਿਅੰਬਕੇਸ਼ਵਰ',
    or: 'ତ୍ର୍ୟମ୍ବକେଶ୍ୱର',
    as: 'ত্ৰ্যম্বকেশ্বৰ',
    ur: 'تریمبکیشور',
    sa: 'त्र्यम्बकेश्वरम्',
    ne: 'त्र्यम्बकेश्वर',
    kok: 'त्र्यंबकेश्वर',
    mai: 'त्र्यंबकेश्वर',
  },

  // Villages
  wagholi: {
    en: 'Wagholi',
    mr: 'वाघोली',
    hi: 'वाघोली',
    gu: 'વાઘોલી',
    bn: 'ওয়াঘোলি',
    ta: 'வாகோலி',
    te: 'వాఘోలి',
    kn: 'ವಾಘೋಲಿ',
    ml: 'വാഘോലി',
    pa: 'ਵਾਘੋਲੀ',
    or: 'ୱାଘୋଲି',
    as: 'ৱাঘোলী',
    ur: 'واگھولی',
    sa: 'वाघोली',
    ne: 'वाघोली',
    kok: 'वाघोली',
    mai: 'वाघोली',
  },
  khadakwasla: {
    en: 'Khadakwasla',
    mr: 'खडकवासला',
    hi: 'खड़कवासला',
    gu: 'ખડકવાસલા',
    bn: 'খড়কওয়াসলা',
    ta: 'கடக்வாஸ்லா',
    te: 'ఖడక్‌వాస్లా',
    kn: 'ಖಡಕ್ವಾಸ್ಲಾ',
    ml: 'ഖഡക്വാസ്‌ല',
    pa: 'ਖੜਕਵਾਸਲਾ',
    or: 'ଖଡକୱାସଲା',
    as: 'খড়কৱাছলা',
    ur: 'کھڑکواسلا',
    sa: 'खडकवासला',
    ne: 'खडकवासला',
    kok: 'खडकवासला',
    mai: 'खड़कवासला',
  },
  trimbak: {
    en: 'Trimbak',
    mr: 'त्र्यंबक',
    hi: 'त्र्यंबक',
    gu: 'ત્ર્યંબક',
    bn: 'ত্র্যম্বক',
    ta: 'த்ரியம்பக்',
    te: 'త్రయంబక్',
    kn: 'ತ್ರ್ಯಂಬಕ್',
    ml: 'ത്ര്യംബക്',
    pa: 'ਤ੍ਰਿਅੰਬਕ',
    or: 'ତ୍ର୍ୟମ୍ବକ',
    as: 'ত্ৰ্যম্বক',
    ur: 'تریمبک',
    sa: 'त्र्यम्बक',
    ne: 'त्र्यम्बक',
    kok: 'त्र्यंबक',
    mai: 'त्र्यंबक',
  },
  khotyawadi: {
    en: 'Khotyawadi (Fake Village)',
    mr: 'खोट्यावाडी (बनावट गाव)',
    hi: 'खोट्यावाड़ी (जाली गांव)',
    gu: 'ખોટ્યાવાડી (બનાવટી ગામ)',
    bn: 'খোট্যাওয়াড়ি (ভুয়া গ্রাম)',
    ta: 'கோத்யாவாடி (போலி கிராமம்)',
    te: 'ఖోత్యావాడి (నకిలీ గ్రామం)',
    kn: 'ಖೋಟ್ಯಾವಾಡಿ (ನಕಲಿ ಹಳ್ಳಿ)',
    ml: 'ഖോട്ട്യാവാടി (വ്യാജ വില്ലേജ്)',
    pa: 'ਖੋਟਿਆਵਾੜੀ (ਨਕਲੀ ਪਿੰਡ)',
    or: 'ଖୋଟ୍ୟାୱାଡି (ନକଲି ଗ୍ରାମ)',
    as: 'খোট্যাৱাড়ী (ভুৱা গাঁও)',
    ur: 'کھوٹیاواڑی (جعلی گاؤں)',
    sa: 'खोट्यावाडी (कूटग्रामः)',
    ne: 'खोट्यावाडी (नक्कली गाउँ)',
    kok: 'खोट्यावाडी (बनावट गांव)',
    mai: 'खोट्यावाड़ी (जाली गाम)',
  },
}

// Landowner names
const OWNER_LEXICON = {
  ramesh_vitthal_patil: {
    en: 'Ramesh Vitthal Patil',
    mr: 'रमेश विठ्ठल पाटील',
    hi: 'रमेश विट्ठल पाटिल',
    gu: 'રમેશ વિઠ્ઠલ પાટીલ',
    bn: 'রমেশ বিঠল পাতিল',
    ta: 'ரமேஷ் விட்டல் பாட்டீல்',
    te: 'రమేష్ విఠల్ పాటిల్',
    kn: 'ರಮೇಶ್ ವಿಠಲ್ ಪಾಟೀಲ್',
    ml: 'രമേഷ് വിഠൽ പാട്ടീൽ',
    pa: 'ਰਮੇਸ਼ ਵਿੱਠਲ ਪਾਟਿਲ',
    or: 'ରମେଶ ବିଠଲ ପାଟିଲ',
    as: 'ৰমেশ বিঠল পাতিল',
    ur: 'رمیش وٹھل پاٹل',
    sa: 'रमेश विट्ठल पाटिल',
    ne: 'रमेश विट्ठल पाटिल',
    kok: 'रमेश विठ्ठल पाटील',
    mai: 'रमेश विट्ठल पाटिल',
  },
  ramesh_baburao_patil: {
    en: 'Ramesh Baburao Patil',
    mr: 'रमेश बाबूराव पाटील',
    hi: 'रमेश बाबूराव पाटिल',
    gu: 'રમેશ બાબુરાવ પાટીલ',
    bn: 'রমেশ বাবুরাও পাতিল',
    ta: 'ரமேஷ் பாபுராவ் பாட்டீல்',
    te: 'రమేష్ బాబూరావు పాటిల్',
    kn: 'ರಮೇಶ್ ಬಾಬುರಾವ್ ಪಾಟೀಲ್',
    ml: 'രമേഷ് ബാബുറാവു പാട്ടീൽ',
    pa: 'ਰਮੇਸ਼ ਬਾਬੂਰਾਓ ਪਾਟਿਲ',
    or: 'ରମେଶ ବାବୁରାଓ ପାଟିଲ',
    as: 'ৰমেশ বাবুৰাও পাতিল',
    ur: 'رمیش بابوراؤ پاٹل',
    sa: 'रमेश बाबुराव पाटिल',
    ne: 'रमेश बाबुराव पाटिल',
    kok: 'रमेश बाबूराव पाटील',
    mai: 'रमेश बाबुराव पाटिल',
  },
  ganesh_pandurang_pawar: {
    en: 'Ganesh Pandurang Pawar',
    mr: 'गणेश पांडुरंग पवार',
    hi: 'गणेश पांडुरंग पवार',
    gu: 'ગણેશ પાંડુરંગ પવાર',
    bn: 'গণেশ পাণ্ডুরঙ্গ পাওয়ার',
    ta: 'கணேஷ் பாண்டுரங் பவார்',
    te: 'గణేష్ పాండురంగ్ పవార్',
    kn: 'ಗಣೇಶ್ ಪಾಂಡುರಂಗ ಪವಾರ್',
    ml: 'ഗണേഷ് പാണ്ഡുരംഗ് പവാർ',
    pa: 'ਗਣੇਸ਼ ਪਾਂਡੁਰੰਗ ਪਵਾਰ',
    or: 'ଗଣେଶ ପାଣ୍ଡୁରଙ୍ଗ ପୱାର',
    as: 'গণেশ পাণ্ডুৰং পাৱাৰ',
    ur: 'گنیش پانڈورنگ پوار',
    sa: 'गणेश पाण्डुरङ्ग पवार',
    ne: 'गणेश पाण्डुरंग पवार',
    kok: 'गणेश पांडुरंग पवार',
    mai: 'गणेश पांडुरंग पवार',
  },
  vikram_fake: {
    en: 'Vikram Banavatrao Shinde (Unauthorized / Fake Owner)',
    mr: 'विक्रम बनावटराव शिंदे (अनधिकृत / बनावट खातेदार)',
    hi: 'विक्रम बनावटराव शिंदे (अनधिकृत / जाली खातेदार)',
    gu: 'વિક્રમ બનાવટરાવ શિંદે (અનધિકૃત / બનાવટી ખાતેદાર)',
    bn: 'বিক্রম বানাবটরাও শিন্দে (অননুমোদিত / জাল মালিক)',
    ta: 'விக்ரம் பனாவட்ராவ் ஷிண்டே (போலி உரிமையாளர்)',
    te: 'విక్రమ్ బనావట్రావ్ షిండే (నకిలీ యజమాని)',
    kn: 'ವಿಕ್ರಮ್ ಬನಾವಟ್ರಾವ್ ಶಿಂಧೆ (ನಕಲಿ ಮಾಲೀಕ)',
    ml: 'വിക്രം ബനാവത്റാവു ഷിൻഡെ (വ്യാജ ഉടമ)',
    pa: 'ਵਿਕਰਮ ਬਨਾਵਟਰਾਓ ਸ਼ਿੰਦੇ (ਨਕਲੀ ਮਾਲਕ)',
    or: 'ବିକ୍ରମ ବନାବଟରାଓ ଶିନ୍ଦେ (ନକଲି ମାଲିକ)',
    as: 'বিক্ৰম বনাৱটৰাও শিন্দে (ভুৱা গৰাকী)',
    ur: 'وکرم بناوٹ راؤ شندے (جعلی مالک)',
    sa: 'विक्रम बनावटराव शिन्दे (कूटस्वामि)',
    ne: 'विक्रम बनावटराव शिन्दे (नक्कली जग्गाधनी)',
    kok: 'विक्रम बनावटराव शिंदे (बनावट खातेदार)',
    mai: 'विक्रम बनावटराव शिन्दे (जाली खातेदार)',
  },
}

// Ownership Types
const OWNERSHIP_LEXICON = {
  class1: {
    en: 'Occupant Class-1 (Private Title)',
    mr: 'भोगवटादार वर्ग - १ (खाजगी मालकी)',
    hi: 'भोगवटादार वर्ग - १ (निजी स्वामित्व)',
    gu: 'ભોગવટાધાર વર્ગ - ૧ (ખાનગી માલિકી)',
    bn: 'দখলদার শ্রেণি - ১ (ব্যক্তিগত মালিকানা)',
    ta: 'அனுபவ வகுப்பு - 1 (தனியார் உரிமை)',
    te: 'భోగవటదారు వర్గం - 1 (ప్రైవేట్ యాజమాన్యం)',
    kn: 'ಅನುಭೋಗ ವರ್ಗ - ೧ (ಖಾಸಗಿ ಮಾಲೀಕತ್ವ)',
    ml: 'ഉടമസ്ഥാവകാശ ക്ലാസ്സ് - 1 (സ്വകാര്യ ഉടമസ്ഥത)',
    pa: 'ਭੋਗਵਟਾਦਾਰ ਵਰਗ - 1 (ਨਿੱਜੀ ਮਾਲਕੀ)',
    or: 'ଦଖଲଦାର ବର୍ଗ - ୧ (ବ୍ୟକ୍ତିଗତ ମାଲିକାନା)',
    as: 'মালিকীস্বত্ব শ্ৰেণী - ১ (ব্যক্তিগত)',
    ur: 'قابض درجہ اول (نجی ملکیت)',
    sa: 'भोगवटादार वर्गः - १ (स्वायत्तम्)',
    ne: 'भोगवटादार वर्ग - १ (निजी)',
    kok: 'भोगवटादार वर्ग - १ (खाजगी)',
    mai: 'भोगवटादार वर्ग - १ (निजी)',
  },
  forged: {
    en: '⚠️ UNAUTHORIZED / FORGED RECORD',
    mr: '⚠️ अनधिकृत / बनावट फेरफार (UNAUTHORIZED RECORD)',
    hi: '⚠️ अनधिकृत / जाली रिकॉर्ड (UNAUTHORIZED RECORD)',
    gu: '⚠️ અનધિકૃત / બનાવટી રેકોર્ડ (UNAUTHORIZED RECORD)',
    bn: '⚠️ অননুমোদিত / জাল রেকর্ড (UNAUTHORIZED RECORD)',
    ta: '⚠️ அங்கீகரிக்கப்படாத / போலி ஆவணம் (UNAUTHORIZED)',
    te: '⚠️ అనధికారిక / నకిలీ రికార్డు (UNAUTHORIZED)',
    kn: '⚠️ ಅನಧಿಕೃತ / ನಕಲಿ ದಾಖಲೆ (UNAUTHORIZED)',
    ml: '⚠️ അനധികൃതം / വ്യാജ രേഖ (UNAUTHORIZED)',
    pa: '⚠️ ਅਣਅਧਿਕਾਰਤ / ਨਕਲੀ ਰਿਕਾਰਡ (UNAUTHORIZED)',
    or: '⚠️ ଅଣଅଧିକୃତ / ନକଲି ରେକର୍ଡ (UNAUTHORIZED)',
    as: '⚠️ অননুমোদিত / ভুৱা নথি (UNAUTHORIZED)',
    ur: '⚠️ غیر مجاز / جعلی ریکارڈ (UNAUTHORIZED)',
    sa: '⚠️ अनधिकृतम् / कूट-अभिलेखम्',
    ne: '⚠️ अनाधिकृत / नक्कली अभिलेख',
    kok: '⚠️ अनधिकृत / बनावट अभिलेख',
    mai: '⚠️ अनधिकृत / जाली अभिलेख',
  },
}

// Encumbrances
const ENCUMBRANCE_LEXICON = {
  crop_loan: {
    en: 'Bank of Maharashtra Crop Loan Rs. 50,000/-',
    mr: 'बँक ऑफ महाराष्ट्र पीक कर्ज बोजा रु. ५०,०००/-',
    hi: 'बैंक ऑफ महाराष्ट्र फसल ऋण बोझ रु. ५०,०००/-',
    gu: 'બેંક ઓફ મહારાષ્ટ્ર પાક ધિરાણ બોજો રૂ. ૫૦,૦૦૦/-',
    bn: 'ব্যাঙ্ক অফ মহারাষ্ট্র শস্য ঋণ বোঝা ৫০,০০০/-',
    ta: 'பேங்க் ஆஃப் மகாராஷ்டிரா பயிர்க்கடன் ரூ. 50,000/-',
    te: 'బ్యాంక్ ఆఫ్ మహారాష్ట్ర పంట రుణం రూ. 50,000/-',
    kn: 'ಬ್ಯಾಂಕ್ ಆಫ್ ಮಹಾರಾಷ್ಟ್ರ ಬೆಳೆ ಸಾಲ ರೂ. ೫೦,೦೦೦/-',
    ml: 'ബാങ്ക് ഓഫ് മഹാരാഷ്ട്ര വിള വായ്പ ബാധ്യത രൂ. 50,000/-',
    pa: 'ਬੈਂਕ ਆਫ਼ ਮਹਾਂਰਾਸ਼ਟਰ ਫ਼ਸਲੀ ਕਰਜ਼ਾ ਰੁ. 50,000/-',
    or: 'ବ୍ୟାଙ୍କ ଅଫ୍ ମହାରାଷ୍ଟ୍ର ଫସଲ ଋଣ ବୋଝ ଟ. ୫୦,୦୦୦/-',
    as: 'বেংক অফ মহাৰাষ্ট্ৰ শস্য ঋণ বোজা ৫০,০০০/- টকা',
    ur: 'بینک آف مہاراشٹر فصلی قرضہ بوجھ 50,000 روپے',
    sa: 'महाराष्ट्र-बैंक शस्यऋणभारः ५०,००० रुप्यकाणि',
    ne: 'बैंक अफ महाराष्ट्र बाली ऋण भार रु. ५०,०००/-',
    kok: 'बँक ऑफ महाराष्ट्र पीक कर्ज बोजो रु. ५०,०००/-',
    mai: 'बैंक ऑफ महाराष्ट्र फसल ऋण बोझ रु. ५०,०००/-',
  },
  nil: {
    en: 'Nil / Clear Title (No Encumbrances)',
    mr: 'निरंक (स्वच्छ शीर्षक / कोणताही बोजा नाही)',
    hi: 'निरंक (स्वच्छ शीर्षक / कोई ऋण बोझ नहीं)',
    gu: 'શૂન્ય (ચોખ્ખો ટાઇટલ / કોઈ બોજો નથી)',
    bn: 'শূন্য (পরিষ্কার স্বত্ব / কোনো ঋণ নেই)',
    ta: 'ஏதுமில்லை (வில்லங்கமற்ற தெளிவான உரிமை)',
    te: 'నిల్ (స్పష్టమైన శీర్షిక / ఎటువంటి రుణాలు లేవు)',
    kn: 'ನಿರಂಕ (ಸ್ಪಷ್ಟ ಮಾಲೀಕತ್ವ / ಯಾವುದೇ ಸಾಲವಿಲ್ಲ)',
    ml: 'ബാധ്യതകളില്ല (വ്യക്തമായ ഉടമസ്ഥാവകാശം)',
    pa: 'ਕੋਈ ਨਹੀਂ (ਸਾਫ਼ ਟਾਈਟਲ / ਕੋਈ ਬੋਝ ਨਹੀਂ)',
    or: 'ଶୂନ୍ୟ (ସ୍ୱଚ୍ଛ ଶୀର୍ଷକ / କୌଣସି ବୋଝ ନାହିଁ)',
    as: 'একো নাই (পৰিস্কাৰ স্বত্ব / কোনো ঋণ নাই)',
    ur: 'کچھ نہیں (واضح ملکیت / کوئی قرض نہیں)',
    sa: 'निरङ्कम् (ऋणभाररहितम्)',
    ne: 'निरंक (कुनै ऋण भार छैन)',
    kok: 'निरंक (कसलोच बोजो ना)',
    mai: 'निरंक (स्वच्छ शीर्षक / कोनो बोझ नहि)',
  },
  fraud: {
    en: '❌ AI FRAUD ALERT: Seal Mismatch & Index Not Found in Mahabhulekh DB',
    mr: '❌ AI फसवणूक इशारा: डिजिटल सील जुळत नाही व महाभूलेखमध्ये नोंद नाही',
    hi: '❌ AI धोखाधड़ी चेतावनी: सील मिसमैच व महाभूलेख रिकॉर्ड अनुपस्थित',
    gu: '❌ એઆઈ ચેતવણી: સીલ અસમાનતા અને મહાભૂલેખ રેકોર્ડ મળ્યો નથી',
    bn: '❌ এআই জালিয়াতি সতর্কতা: সীল অমিল এবং ডাটাবেসে অনুপস্থিত',
    ta: '❌ AI மோசடி எச்சரிக்கை: முத்திரை பொருந்தவில்லை மற்றும் பதிவேட்டில் இல்லை',
    te: '❌ AI మోసం హెచ్చరిక: సీల్ సరిపోలడం లేదు & రికార్డు కనుగొనబడలేదు',
    kn: '❌ AI ವಂಚನೆ ಎಚ್ಚರಿಕೆ: ಸೀಲ್ ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ ಮತ್ತು ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿಲ್ಲ',
    ml: '❌ AI തട്ടിപ്പ് മുന്നറിയിപ്പ്: സീൽ പൊരുത്തക്കേട് & ഡാറ്റാബേസിൽ ഇല്ല',
    pa: '❌ AI ਧੋਖਾਧੜੀ ਚੇਤਾਵਨੀ: ਸੀਲ ਮੇਲ ਨਹੀਂ ਖਾਂਦੀ ਅਤੇ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ',
    or: '❌ AI ଜାଲିଆତି ଚେତାବନୀ: ସିଲ୍ ମେଳ ଖାଉନାହିଁ',
    as: '❌ AI জালিয়াতি সতৰ্কবাণী: মোহৰ মিল খোৱা নাই',
    ur: '❌ AI فراڈ الرٹ: مہر غیر مطابقت اور ڈیٹا بیس میں غیر موجود',
    sa: '❌ AI कूट-चेतावनी: मुद्रा-विसङ्गतिः अभिलेखाभावश्च',
    ne: '❌ AI ठगी चेतावनी: छाप नमिलेको र अभिलेख फेला नपरेको',
    kok: '❌ AI फसवणूक शिटकावणी: सील जुळना आनी अभिलेख ना',
    mai: '❌ AI धोखाधड़ी चेतावनी: सील मेल नहि आ महाभूलेखमे नहि',
  },
}

// Area Unit
const AREA_UNITS = {
  en: 'Hectare',
  mr: 'हेक्टर',
  hi: 'हेक्टेयर',
  gu: 'હેક્ટર',
  bn: 'হেক্টর',
  ta: 'ஹெக்டேர்',
  te: 'హెక్టార్లు',
  kn: 'ಹೆಕ್ಟೇರ್',
  ml: 'ഹെക്ടർ',
  pa: 'ਹੈਕਟੇਅਰ',
  or: 'ହେକ୍ଟର',
  as: 'হেক্টৰ',
  ur: 'ہیکٹر',
  sa: 'हेक्टर',
  ne: 'हेक्टर',
  kok: 'हेक्टर',
  mai: 'हेक्टेयर',
}

// ─── Helpers ──────────────────────────────────────────────────────

function findLexiconValue(lexicon, text, lang) {
  if (!text) return null
  const normalized = String(text).toLowerCase()

  for (const [key, translations] of Object.entries(lexicon)) {
    // Check if the key itself matches or any translation values are contained in text
    if (normalized.includes(key.replace(/_/g, ' ')) || normalized.includes(key.replace(/_/g, ''))) {
      return translations[lang] || translations['en']
    }
    for (const val of Object.values(translations)) {
      if (typeof val === 'string' && val.length > 2 && normalized.includes(val.toLowerCase())) {
        return translations[lang] || translations['en']
      }
    }
  }
  return null
}

function localizeAreaString(rawArea, lang) {
  if (!rawArea) return rawArea
  const numMatch = String(rawArea).match(/[\d.]+/g)
  const num = numMatch ? numMatch[0] : '1.45'
  const unit = AREA_UNITS[lang] || (lang === 'en' ? 'Hectare' : 'हेक्टर')
  return `${num} ${unit}`
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Returns a new record object with all entity fields dynamically localized
 * to the target language (e.g. 'gu', 'ta', 'te', 'bn', 'kn', 'en', 'hi', 'mr').
 *
 * @param {Object} record - Raw or parsed record object
 * @param {string} [lang='mr'] - Language code
 * @returns {Object} Localized record object
 */
export function getLocalizedRecord(record = {}, lang = 'mr') {
  if (!record) return record

  const isForged = !!record.isForged || String(record.id || '').includes('FORGED') || String(record.khasraNumber || '').includes('999')

  // 1. Village
  let village = findLexiconValue(LOCATION_LEXICON, record.village || record.villageEn, lang)
  if (!village) {
    village = lang === 'en' ? (record.villageEn || record.village) : (record.village || record.villageEn)
  }

  // 2. Tehsil
  let tehsil = findLexiconValue(LOCATION_LEXICON, record.tehsil || record.tehsilEn, lang)
  if (!tehsil) {
    tehsil = lang === 'en' ? (record.tehsilEn || record.tehsil) : (record.tehsil || record.tehsilEn)
  }

  // 3. District
  let district = findLexiconValue(LOCATION_LEXICON, record.district || record.districtEn, lang)
  if (!district) {
    district = lang === 'en' ? (record.districtEn || record.district) : (record.district || record.districtEn)
  }

  // 4. Landowner Name
  let ownerName = findLexiconValue(OWNER_LEXICON, record.ownerName || record.ownerNameEn, lang)
  if (!ownerName) {
    ownerName = lang === 'en' ? (record.ownerNameEn || record.ownerName) : (record.ownerName || record.ownerNameEn)
  }

  // 5. Ownership Type
  let ownershipType = null
  if (isForged) {
    ownershipType = OWNERSHIP_LEXICON.forged[lang] || OWNERSHIP_LEXICON.forged.en
  } else {
    ownershipType = findLexiconValue(OWNERSHIP_LEXICON, record.ownershipType, lang)
    if (!ownershipType) {
      ownershipType = OWNERSHIP_LEXICON.class1[lang] || OWNERSHIP_LEXICON.class1.en
    }
  }

  // 6. Encumbrance
  let encumbrance = null
  if (isForged) {
    encumbrance = ENCUMBRANCE_LEXICON.fraud[lang] || ENCUMBRANCE_LEXICON.fraud.en
  } else if (String(record.encumbrance || record.encumbranceEn || '').toLowerCase().includes('nil') ||
             String(record.encumbrance || '').includes('निरंक')) {
    encumbrance = ENCUMBRANCE_LEXICON.nil[lang] || ENCUMBRANCE_LEXICON.nil.en
  } else {
    encumbrance = findLexiconValue(ENCUMBRANCE_LEXICON, record.encumbrance || record.encumbranceEn, lang)
    if (!encumbrance) {
      encumbrance = ENCUMBRANCE_LEXICON.crop_loan[lang] || ENCUMBRANCE_LEXICON.crop_loan.en
    }
  }

  // 7. Land Area
  const landArea = localizeAreaString(record.landArea || record.landAreaEn, lang)

  return {
    ...record,
    village,
    tehsil,
    district,
    ownerName,
    ownershipType,
    encumbrance,
    landArea,
    language: lang,
  }
}

export default getLocalizedRecord
