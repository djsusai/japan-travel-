/* The trip itself. Every figure here comes from the booking confirmations the
   traveller supplied — flights (Etihad REDACTED-PNR), the Toyota rental, and the five
   hotel vouchers. Nothing in this file is computed; edit it to change the page.
 *
 * Per stage:
 *   id      timeline row id, also the map badge id ("pin-<id>")
 *   kind    flight | car | city | stop — picks the pin colour (see app.css)
 *   n       badge glyph: the stop number, or ✈ for a flight
 *   short   the label drawn next to the badge on the map
 *   from/at coordinates as [lat, lng]; `at` is where the badge sits, `from` is
 *           the previous point, which is what the leg is drawn between
 *   to      a destination outside Japan (flights), used by the world view
 *   mode    car | train — how the leg into `at` is travelled; defaults to car
 *   off     badge offset from its point, in px, tuned for the desktop map and
 *           scaled down on narrow screens
 */
(function () {
  "use strict";

  const G = (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const NAKASENDO =
    "https://www.google.com/maps/dir/Hotel+Nikko+Princess+Kyoto/Magome,+Nakatsugawa,+Gifu,+Japan/Tsumago-juku,+Nagiso,+Nagano,+Japan/Fuji+Speedway+Hotel,+Oyama,+Shizuoka,+Japan";
  const gmaps = (lat, lng) =>
    `<a href="${G(lat, lng)}" target="_blank" rel="noopener">פתח במפות גוגל</a>`;

  window.STAGES = [
    { id:"s1", kind:"flight", n:"✈", date:"26.9 – 27.9", title:"תל אביב → אבו דאבי", en:"TLV → AUH", short:"תל אביב",
      meta:["EY 598", "4 ש׳ 15 ד׳", "‎~2,150 ק״מ"],
      from:[32.0004,34.8706], to:[24.4330,54.6511], off:[0,-34],
      note:"המראה 26.9 בשעה 20:10 מטרמינל 3 בנתב״ג, נחיתה 27.9 בשעה 00:25 בטרמינל A באבו דאבי. איתיחאד, Airbus A321.",
      facts:[["חברה וקוד הזמנה","ETIHAD · REDACTED-PNR"],["לילה","לילה בטיסה / המתנה באבו דאבי"]] },

    { id:"s2", kind:"flight", n:"✈", date:"27.9 – 28.9", title:"אבו דאבי → אוסקה", en:"AUH → KIX", short:"אבו דאבי",
      meta:["EY 814", "‎~9 ש׳ 30 ד׳", "‎~8,000 ק״מ"],
      from:[24.4330,54.6511], to:[34.4347,135.2328], off:[0,36],
      note:"המראה 27.9 בשעה 21:10 מטרמינל A, נחיתה 28.9 בשעה 11:40 בנמל התעופה קנסאי, טרמינל 1.",
      facts:[["בנחיתה","Visit Japan Web · כרטיס ICOCA · מזומן ¥15,000–20,000 · eSIM"],["חברה וקוד הזמנה","ETIHAD · REDACTED-PNR"]] },

    { id:"s3", kind:"car", n:"1", date:"28.9, 12:30", title:"איסוף הרכב בקנסאי", en:"Toyota Rent a Car · KIX", short:"שדה קנסאי",
      meta:["Corolla Touring Hybrid","10 ימים"],
      from:[34.4347,135.2328], at:[34.4347,135.2328], mode:"car", off:[-56,44],
      note:"התחנה נמצאת ב-Aeroplaza קומה 1 בשדה התעופה. צריך רישיון בינלאומי (IDP) לפי אמנת ז׳נבה 1949 יחד עם הרישיון הישראלי והדרכון — בלי זה לא מוסרים רכב.",
      facts:[["כתובת","<span class='en'>Aeroplaza 1F, 1 Senshukukonaka, Tajiri-cho, Sennan-gun, Osaka 549-0011</span>"],
             ["טלפון","<span class='en'>072-456-8790</span>"],
             ["מספר הזמנה","<span class='en'>REDACTED-RES</span>"],
             ["עלות כוללת","<span class='en'>161,172 JPY</span>"],
             ["החזרה","7.10 בשעה 12:00 · <span class='en'>Odawara Sta. Shinkansen Ext. Shop</span>"],
             ["מפה", gmaps(34.4347,135.2328)]] },

    { id:"s4", kind:"city", n:"2", date:"28.9 – 1.10", title:"אוסקה", en:"Osaka · 3 לילות", short:"אוסקה",
      meta:["רכב + מטרו","50 ק״מ מהשדה","‎~55 ד׳"],
      from:[34.4347,135.2328], at:[34.6656,135.5015], mode:"car", off:[-62,4],
      note:"מהשדה למרכז בכביש האגרה החופי. הרכב חונה שלושה ימים — בתוך אוסקה נעים במטרו, קו המידוסוג׳י. שלושה ימים: השוק והנאון בנמבה, הטירה והנהר, ואז שינסקאי ו-teamLab בנגאי.",
      facts:[["מלון","<span class='en'>Hotel Alps</span> · 3 לילות, חדר טווין, 2 מבוגרים"],
             ["כתובת","<span class='en'>Sennichimae 2-25, Chuo-ku Namba, Osaka</span>"],
             ["צ׳ק-אין","יום שני 28.9 · 15:00–23:00"],
             ["צ׳ק-אאוט","יום חמישי 1.10 · עד 12:00"],
             ["טלפון","<span class='en'>+81 6-4396-8888</span>"],
             ["מפה", gmaps(34.6656,135.5015)]] },

    { id:"s5", kind:"city", n:"3", date:"1.10 – 4.10", title:"קיוטו", en:"Kyoto · 3 לילות", short:"קיוטו",
      meta:["רכב","55 ק״מ","1 ש׳ – 1 ש׳ 15 ד׳"],
      from:[34.6656,135.5015], at:[34.9985,135.7594], mode:"car", off:[-46,-40],
      note:"מאוסקה לקיוטו עם עצירה באוג׳י בדרך. אגרה ¥1,300–2,000. בקיוטו הרכב חונה במלון (¥1,500–2,500 ללילה) ולא נוגעים בו — היגאשיאמה, ארשיאמה והביתן הזהוב ברגל וברכבת.",
      facts:[["מלון","<span class='en'>Hotel Nikko Princess Kyoto</span> · Executive Hollywood Twin, ללא עישון"],
             ["כתובת","<span class='en'>Takahashi-cho 630, Higashi-Iru, Karasuma Takatsuji, Shimogyo-ku, Kyoto</span>"],
             ["צ׳ק-אין","יום חמישי 1.10 · 15:00–23:30"],
             ["צ׳ק-אאוט","יום ראשון 4.10 · עד 11:00"],
             ["טלפון","<span class='en'>+81 75-361-5111</span>"],
             ["מפה", gmaps(34.9985,135.7594)]] },

    { id:"s6", kind:"stop", n:"4", date:"4.10", title:"מאגומה", en:"Magome-juku · עצירה", short:"מאגומה",
      meta:["רכב","‎~270 ק״מ מקיוטו","‎~3 ש׳ 30 ד׳"],
      from:[34.9985,135.7594], at:[35.5315,137.5718], mode:"car", off:[-52,-48],
      note:"במקום אוטוסטרדת החוף — הנתיב דרך האלפים היפניים ועמק קיסו. מאגומה היא עיירת דואר מתקופת אדו על דרך הנקאסנדו: רחוב ראשי מרוצף אבן בשיפוע, טחנות מים, בתי עץ, חנויות מלאכת יד ודוכני סובה.",
      facts:[["המסלול המלא",`<a href="${NAKASENDO}" target="_blank" rel="noopener">קיוטו → מאגומה → צומאגו → פוג׳י במפות גוגל</a>`],
             ["מפה", gmaps(35.5315,137.5718)]] },

    { id:"s7", kind:"stop", n:"5", date:"4.10", title:"צומאגו", en:"Tsumago-juku · עצירה", short:"צומאגו",
      meta:["רכב","‎~4 ק״מ","‎~10 ד׳"],
      from:[35.5315,137.5718], at:[35.5776,137.5957], mode:"car", off:[34,-26],
      note:"אחת העיירות השמורות ביפן, משוחזרת למראה המקורי. כבלי החשמל מוסתרים ואין כניסת רכבים לרחוב הראשי. כאן ארוחת צהריים מסורתית מול ההרים.",
      facts:[["מפה", gmaps(35.5776,137.5957)]] },

    { id:"s8", kind:"city", n:"6", date:"4.10 – 5.10", title:"פוג׳י · אויאמה", en:"Fuji Speedway Hotel · לילה 1", short:"פוג׳י",
      meta:["רכב","‎~214 ק״מ","‎~2 ש׳ 35 ד׳"],
      from:[35.5776,137.5957], at:[35.3675,138.9183], mode:"car", off:[14,-52],
      note:"יום נסיעה שלם: כ-488 ק״מ ו-6 שעות 15 דקות נטו מקיוטו, מומלץ להקדיש לו 8–9 שעות ברוטו כולל העצירות בכפרים. בבוקר שלמחרת — הנוף אל ההר.",
      facts:[["מלון","<span class='en'>Fuji Speedway Hotel — The Unbound Collection by Hyatt</span> · לילה 1, טווין"],
             ["כתובת","<span class='en'>645 OMIKA, Oyama, Shizuoka</span>"],
             ["צ׳ק-אין","יום ראשון 4.10 · מהשעה 15:00"],
             ["צ׳ק-אאוט","יום שני 5.10 · עד 12:00"],
             ["טלפון","<span class='en'>+81 550-20-1234</span>"],
             ["מפה", gmaps(35.3675,138.9183)]] },

    { id:"s9", kind:"city", n:"7", date:"5.10 – 7.10", title:"האקונה", en:"Hakone · 2 לילות", short:"האקונה",
      meta:["רכב","‎~35 ק״מ דרך גוטמבה","‎~50 ד׳"],
      from:[35.3675,138.9183], at:[35.2166,138.9968], mode:"car", off:[-58,36],
      note:"הלולאה הקלאסית: אגם אשי, הרכבל ואוואקודאני. המלון יושב על גדת האגם בטוגנדאי, עם אמבט פרטי באוויר הפתוח בחדר.",
      facts:[["מלון","<span class='en'>Hakone Ashinoko Hanaori</span> · 2 לילות, חדר קאז׳ואל טווין עם אמבטיה באוויר הפתוח"],
             ["כתובת","<span class='en'>Motohakone Togendai 160, Hakone, Kanagawa</span>"],
             ["צ׳ק-אין","יום שני 5.10 · 15:00–20:00"],
             ["צ׳ק-אאוט","יום רביעי 7.10 · עד 10:00"],
             ["טלפון","<span class='en'>+81 460-83-8739</span>"],
             ["מפה", gmaps(35.2166,138.9968)]] },

    { id:"s10", kind:"car", n:"8", date:"7.10, 12:00", title:"החזרת הרכב באודוארה", en:"Odawara Sta. Shinkansen Ext.", short:"אודוארה",
      meta:["רכב","15 ק״מ","25–35 ד׳"],
      from:[35.2166,138.9968], at:[35.2564,139.1553], mode:"car", off:[30,66],
      note:"כביש 1 יורד מפותל מהאקונה. מחזירים מלא — תדלוק בכניסה לאודוארה. כל סניפי ההשכרה מרוכזים סביב התחנה, 2–10 דקות הליכה מהרציפים, שעות 08:00–20:00.",
      facts:[["כתובת","<span class='en'>1-1-1 Shiroyama, Odawara-shi, Kanagawa 250-0045</span>"],
             ["מועד החזרה","<span class='en'>October 07, 2026 at 12:00</span>"],
             ["מפה", gmaps(35.2564,139.1553)]] },

    { id:"s11", kind:"city", n:"9", date:"7.10 – 14.10", title:"טוקיו · שיבויה", en:"Tokyo · 7 לילות", short:"טוקיו",
      meta:["רכבת","84 ק״מ","‎~35 ד׳ בשינקנסן"],
      from:[35.2564,139.1553], at:[35.6595,139.7005], mode:"train", off:[52,-16],
      note:"מאודוארה לטוקיו בשינקנסן, ומכאן שבוע שלם ברכבות בלבד: אסאקוסה ואואנו, טיול יום לקמאקורה, מייג׳י והרג׳וקו, אקיהברה וגינזה, וצוקיג׳י והארמון. 12.10 הוא יום הספורט — חג לאומי, מוזיאונים סגורים.",
      facts:[["מלון","<span class='en'>JR-East Hotel Mets Shibuya</span> · 7 לילות, חדר סופריור עם מיטות נפרדות, ללא עישון"],
             ["כתובת","<span class='en'>Shibuya-ku 3-29-17, Shibuya, Tokyo</span>"],
             ["צ׳ק-אין","יום רביעי 7.10 · 15:00–24:00"],
             ["צ׳ק-אאוט","יום רביעי 14.10 · עד 11:00"],
             ["טלפון","<span class='en'>+81 3-3409-0011</span>"],
             ["מפה", gmaps(35.6595,139.7005)]] },

    /* The car went back at Odawara on 7.10, so the run out to Narita is by
       train — the leg is drawn in the train colour to match. */
    { id:"s12", kind:"flight", n:"✈", date:"14.10 – 15.10", title:"נאריטה → אבו דאבי", en:"NRT → AUH", short:"נאריטה",
      meta:["EY 801","‎~10 ש׳ 20 ד׳","‎~8,100 ק״מ"],
      from:[35.6595,139.7005], to:[24.4330,54.6511], at:[35.7719,140.3929], mode:"train", off:[62,26],
      note:"מהמלון בשיבויה לנאריטה כשעה וחצי ברכבת — לצאת עם מרווח. המראה 14.10 בשעה 18:00 מטרמינל 1, נחיתה 15.10 בשעה 00:20 באבו דאבי.",
      facts:[["שדה תעופה","<span class='en'>Narita Airport, Terminal 1</span>"],["חברה וקוד הזמנה","ETIHAD · REDACTED-PNR"],
             ["מפה", gmaps(35.7719,140.3929)]] },

    { id:"s13", kind:"flight", n:"✈", date:"15.10", title:"אבו דאבי → תל אביב", en:"AUH → TLV", short:"תל אביב",
      meta:["EY 595","‎~2 ש׳ 25 ד׳","‎~2,150 ק״מ"],
      from:[24.4330,54.6511], to:[32.0004,34.8706], off:[0,-34],
      note:"קונקשן קצר: המראה 15.10 בשעה 03:25 מטרמינל A, נחיתה בנתב״ג בשעה 05:50, טרמינל 3. Airbus A321.",
      facts:[["חברה וקוד הזמנה","ETIHAD · REDACTED-PNR"]] },
  ];

  /* The world view collapses the trip to its four airports; the whole Japanese
     leg becomes the single line between Kansai and Narita. */
  window.WORLD_NODES = [
    { id:"s1",  coord:[32.0004,34.8706],  label:"תל אביב", off:[0,-34] },
    { id:"s2",  coord:[24.4330,54.6511],  label:"אבו דאבי", off:[0,36] },
    { id:"s3",  coord:[34.4347,135.2328], label:"אוסקה", off:[-46,32] },
    { id:"s12", coord:[35.7719,140.3929], label:"טוקיו", off:[46,-26] },
  ];
})();
