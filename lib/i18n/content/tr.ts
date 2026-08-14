import { buildLocalizedContent } from "./build";

export const content = buildLocalizedContent({
  categoryNames:{lifePath:"Yaşam Yolu",expression:"İfade",soulUrge:"Ruh Dürtüsü",personality:"Kişilik",personalYear:"Kişisel Yıl"},
  numberThemes:{1:["bağımsızlık","liderlik","özgünlük"],2:["iş birliği","duyarlılık","denge"],3:["yaratıcılık","ifade","neşe"],4:["istikrar","disiplin","pratiklik"],5:["özgürlük","değişim","macera"],6:["sorumluluk","sevgi","uyum"],7:["bilgelik","içe bakış","analiz"],8:["güç","başarı","otorite"],9:["şefkat","insancıllık","tamamlanma"],11:["sezgi","ilham","aydınlanma"],22:["vizyon","ustalık","miras"],33:["şifa","hizmet","koşulsuz sevgi"]},
  numberBrief:(category,number,themes)=>`${category} ${number}, ${themes.join(", ")} temalarını öne çıkarır. Bu enerjiyi dengeli kullandığınızda güçlü yönleriniz daha görünür hale gelir.`,
  signNames:{Aries:"Koç",Taurus:"Boğa",Gemini:"İkizler",Cancer:"Yengeç",Leo:"Aslan",Virgo:"Başak",Libra:"Terazi",Scorpio:"Akrep",Sagittarius:"Yay",Capricorn:"Oğlak",Aquarius:"Kova",Pisces:"Balık"},
  signTraits:{Aries:["cesur","kararlı","tutkulu"],Taurus:["güvenilir","sabırlı","pratik"],Gemini:["meraklı","uyumlu","iletişimci"],Cancer:["sezgisel","koruyucu","sadık"],Leo:["yaratıcı","cömert","özgüvenli"],Virgo:["analitik","özenli","güvenilir"],Libra:["diplomatik","adil","sosyal"],Scorpio:["tutkulu","algıları güçlü","kararlı"],Sagittarius:["maceracı","iyimser","felsefi"],Capricorn:["disiplinli","sorumlu","stratejik"],Aquarius:["özgün","bağımsız","ilerici"],Pisces:["şefkatli","sezgisel","yaratıcı"]},
  signDescription:(sign,traits)=>`${sign}; ${traits.join(", ")} nitelikleriyle ilişkilendirilir. Bu burcun enerjisi, dünyayla kurduğunuz yaklaşımda bu temaları belirginleştirir.`,
  elementNames:{Fire:"Ateş",Water:"Su",Earth:"Toprak",Air:"Hava",Wood:"Ağaç",Metal:"Metal"},
  modalityNames:{Cardinal:"Öncü",Fixed:"Sabit",Mutable:"Değişken"},
  planetNames:{Mars:"Mars",Venus:"Venüs",Mercury:"Merkür",Moon:"Ay",Sun:"Güneş",Pluto:"Plüton",Jupiter:"Jüpiter",Saturn:"Satürn",Uranus:"Uranüs",Neptune:"Neptün"},
  animalNames:{Rat:"Sıçan",Ox:"Öküz",Tiger:"Kaplan",Rabbit:"Tavşan",Dragon:"Ejderha",Snake:"Yılan",Horse:"At",Goat:"Keçi",Monkey:"Maymun",Rooster:"Horoz",Dog:"Köpek",Pig:"Domuz"},
  animalTraits:{Rat:["zeki","uyumlu","fırsatçı"],Ox:["çalışkan","güvenilir","güçlü"],Tiger:["cesur","rekabetçi","karizmatik"],Rabbit:["nazik","zarif","algıları güçlü"],Dragon:["hırslı","enerjik","korkusuz"],Snake:["bilge","sezgisel","gizemli"],Horse:["enerjik","özgür ruhlu","sıcak"],Goat:["yaratıcı","nazik","şefkatli"],Monkey:["zeki","yaratıcı","oyuncu"],Rooster:["gözlemci","çalışkan","cesur"],Dog:["sadık","dürüst","iyi kalpli"],Pig:["cömert","şefkatli","samimi"]},
  animalDescription:(animal,traits)=>`${animal}, ${traits.join(", ")} özellikleriyle tanımlanır. Çin astrolojisinde bu işaret, doğal yaklaşımınızı ve sosyal ritminizi sembolize eder.`,
  chineseElementNames:{Wood:"Ağaç",Fire:"Ateş",Earth:"Toprak",Metal:"Metal",Water:"Su"},
  chineseElementDescriptions:{Wood:"Büyüme, yaratıcılık ve esneklik enerjisi.",Fire:"Tutku, dinamizm ve liderlik enerjisi.",Earth:"İstikrar, besleyicilik ve pratiklik enerjisi.",Metal:"Kesinlik, kararlılık ve güç enerjisi.",Water:"Bilgelik, sezgi ve uyum enerjisi."},
  yinYang:{Yin:"Yin",Yang:"Yang"},
});
