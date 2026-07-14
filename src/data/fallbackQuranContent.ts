export interface VerseData {
  number: number;
  arabic: string;
  translation_ur: string;
  translation_en: string;
  tafseer: string;
  tafseer_en?: string;
}

export const FALLBACK_VERSES: Record<number, VerseData[]> = {
  1: [ // Surah Al-Fatiha
    {
      number: 1,
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation_ur: "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے",
      translation_en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      tafseer: "تفسیر: مفسرین کے مطابق بسم اللہ الرحمن الرحیم ہر مبارک کام کے آغاز کی بنیاد ہے۔ اللہ تعالیٰ نے اس آیت میں اپنی رحمت کی دو عظیم صفات 'رحمن' اور 'رحیم' بیان فرمائی ہیں تا کہ بندوں کو اپنے رب کی بے پایاں رحمت پر بھروسہ حاصل ہو۔"
    },
    {
      number: 2,
      arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translation_ur: "سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے",
      translation_en: "[All] praise is [due] to Allah, Lord of the worlds -",
      tafseer: "تفسیر: کائنات کی ہر نعمت اور خوبصورتی تسبیح و ثناء کی مستحق ہے اور حقیقی معنوں میں تمام حمد و ثناء صرف اللہ تعالیٰ ہی کے لیے مختص ہے۔ وہ 'رب العالمین' یعنی تمام مادی اور روحانی جہانوں کا واحد خالق، مالک اور نگہبان ہے۔"
    },
    {
      number: 3,
      arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
      translation_ur: "بڑا مہربان نہایت رحم والا ہے",
      translation_en: "The Entirely Merciful, the Especially Merciful,",
      tafseer: "تفسیر: یہاں اللہ کی رحمت کے دو رخوں کی تکرار ہے: رحمن یعنی وہ ذات جس کی رحمت کائنات کے ذرے ذرے پر مادی وسائل کی شکل میں عام ہے (بغیر تفریقِ ایمان)، اور رحیم یعنی وہ جزا جو خاص طور پر مومنین کے لیے آخرت میں ابدی نجات اور انعامات کی ضامن ہے۔"
    },
    {
      number: 4,
      arabic: "مَالِكِ يَوْمِ الدِّينِ",
      translation_ur: "روزِ جزا کا مالک ہے",
      translation_en: "Sovereign of the Day of Recompense.",
      tafseer: "تفسیر: 'یوم الدین' سے مراد قیامت اور جزا و سزا کا دن ہے۔ اس دن مادی اسباب اور حکمران بے اثر ہوں گے اور ہر ذی روح کے اعمال کا حتمی فیصلہ صرف اور صرف حقیقی مالک یعنی رب العزت کرے گا۔"
    },
    {
      number: 5,
      arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translation_ur: "ہم صرف تیری ہی عبادت کرتے ہیں اور صرف تجھ ہی سے مدد چاہتے ہیں",
      translation_en: "It is You we worship and You we ask for help.",
      tafseer: "تفسیر: یہ آیت عقیدہ توحید کی جڑ ہے۔ اس میں اقرار کیا گیا ہے کہ عبادت کی تمام شکلیں (نماز، دعا، نذر و نیاز) صرف اللہ کے لیے ہیں، اور مابعد الطبیعاتی و حقیقی مدد کا سرچشمہ صرف ایک ہی رب ہے۔"
    },
    {
      number: 6,
      arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      translation_ur: "ہمیں سیدھی راہ پر چلا",
      translation_en: "Guide us to the straight path -",
      tafseer: "تفسیر: 'صراط مستقیم' وہ واضح اور سیدھا راستہ ہے جو اللہ کے احکامات، حضور ﷺ کی سنت اور سچے اسلاف کے نقشِ قدم پر مشتمل ہے، جس کا انجام دنیا و آخرت کی دائمی سرخروئی ہے۔"
    },
    {
      number: 7,
      arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      translation_ur: "ان لوگوں کے راستے پر جن پر تو نے انعام کیا، نہ کہ ان کے راستے پر جن پر تیرا غضب نازل ہوا اور نہ ہی گمراہوں کے راستے پر",
      translation_en: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
      tafseer: "تفسیر: انعام یافتہ نفوس میں انبیاء، صدیقین، شہداء اور صالحین شامل ہیں۔ دعا کی گئی ہے کہ ہمیں یہود (جن پر جان بوجھ کر حق چھپانے کی وجہ سے غضب ہوا) اور نصاریٰ (جو علم نہ ہونے کی وجہ سے گمراہ ہوئے) کے خطوط سے دوری عطا فرما کر صراطِ حق پر گامزن رکھے۔"
    }
  ],
  112: [ // Surah Al-Ikhlas
    {
      number: 1,
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
      translation_ur: "کہہ دیجیے کہ وہ اللہ ایک ہے",
      translation_en: "Say, \"He is Allah, [who is] One,",
      tafseer: "تفسیر: یہ سورت توحیدِ خالص کا پیغام ہے۔ 'أحد' کے معنی ہیں کہ ذات، صفات اور حقوق میں کوئی اس کا شریک یا ہمسر نہیں ہے اور وہ اپنی وحدانیت میں یکتا ہے۔"
    },
    {
      number: 2,
      arabic: "اللَّهُ الصَّمَدُ",
      translation_ur: "اللہ بے نیاز ہے",
      translation_en: "Allah, the Eternal Refuge.",
      tafseer: "تفسیر: 'الصمد' سے مراد وہ ہستی ہے جس کا کوئی مادی تقاضا (بھوک، پیاس، نیند) نہیں ہے، جبکہ پوری کائنات اپنے وجود اور حیات کے لیے اس کے سامنے دستِ سوال دراز کیے ہوئے ہے۔"
    },
    {
      number: 3,
      arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      translation_ur: "نہ اس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد ہے",
      translation_en: "He neither begets nor is born,",
      tafseer: "تفسیر: اللہ تعالیٰ مادی رشتوں، پیدائش، نسب اور ولدیت سے مبرا ہے۔ نہ اس کا کوئی جدِ امجد ہے اور نہ ہی اس کے جوڑ کا کوئی وارث ہو سکتا ہے۔"
    },
    {
      number: 4,
      arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
      translation_ur: "اور نہ ہی کوئی اس کے برابر کا ہے",
      translation_en: "Nor is there to Him any equivalent.\"",
      tafseer: "تفسیر: مادی یا خیالی جہان میں کوئی بھی شے اللہ کے ہم پلہ یا مشابہ نہیں ہے۔ مخلوق میں کوئی صفت الٰہی جیسا کمال نہیں رکھ سکتی۔"
    }
  ],
  103: [ // Surah Al-Asr
    {
      number: 1,
      arabic: "وَالْعَصْرِ",
      translation_ur: "زمانے کی قسم ہے",
      translation_en: "By time,",
      tafseer: "تفسیر: زمانے یعنی انسانی تاریخ و وقت کی گواہی کے ذریعے اہم سچائی کو واضح کیا گیا ہے کیونکہ وقت ہی انسان کی سب سے بڑی پونجی اور سرمایہ ہے۔"
    },
    {
      number: 2,
      arabic: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
      translation_ur: "بلاشبہ انسان خسارے میں ہے",
      translation_en: "Indeed, mankind is in loss,",
      tafseer: "تفسier: مادی ترقی اور دنیاوی چہل پہل کے باوجود، جو شخص وقت کو ضائع کر رہا ہے وہ دائمی ناکامی و خسارے کے دہانے پر کھڑا ہے۔"
    },
    {
      number: 3,
      arabic: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
      translation_ur: "سوائے ان لوگوں کے جو ایمان لائے اور انہوں نے نیک اعمال کیے، اور ایک دوسرے کو حق بات کی اور صبر کی وصیت کی",
      translation_en: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
      tafseer: "تفسیر: خسارے سے بچنے اور کامیابی کا سنہری چار نکاتی فارمولا: سچا ایمان، نیک اعمال، حق کی منادی و ترویج، اور آزمائشوں میں ایک دوسرے کو ثابت قدمی اور صبر کی نصیحت۔"
    }
  ]
};

export function getFallbackVerses(surahNum: number, nameAr: string, nameEn: string, nameUr: string): VerseData[] {
  if (FALLBACK_VERSES[surahNum]) {
    return FALLBACK_VERSES[surahNum];
  }

  // Generate generic beautiful fallback verse for matching any other Surah
  return [
    {
      number: 1,
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation_ur: "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے",
      translation_en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      tafseer: `یہ سورۃ مبارکہ ${nameUr} ہے۔ اس سورہ کی تفصیلی آیات، اردو و انگریزی ترجمے اور تفسیر کو آپ ایڈمن پینل (Admin Panel) سے باآسانی اپلوڈ کر سکتے ہیں۔`
    },
    {
      number: 2,
      arabic: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
      translation_ur: "پڑھیے (اے محبوب!) اپنے رب کے نام سے جس نے (کائنات کو) پیدا کیا",
      translation_en: "Recite in the name of your Lord who created",
      tafseer: "تفسیر: علم، تدبر اور کائنات کے مشاہدے کی بنیاد اللہ کے نام سے شروع ہونے والی پکار ہے۔ قرآن کریم علم کو سب سے زیادہ اہمیت دیتا ہے۔"
    },
    {
      number: 3,
      arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۖ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
      translation_ur: "یہ وہ عظیم کتاب ہے جس میں کسی شک کی گنجائش نہیں، ہدایت ہے پرہیزگاروں کے لیے",
      translation_en: "This is the Book about which there is no doubt, a guidance for those conscious of Allah",
      tafseer: "تفسیر: قرآن کریم کی عدمِ ریب اور بے عیب ہونے کا واضح اعلان۔ یہ اللہ کا دائمی معجزہ ہے جو رہتی دنیا تک شعور و بیداری کا باعث رہے گا۔"
    }
  ];
}
