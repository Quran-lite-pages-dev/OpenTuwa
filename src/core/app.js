// Copyright (c) Haykal M. Zaidi 2024-2026. All rights reserved. PROPRIETARY AND CONFIDENTIAL.
// Detects all current and future broken images site-wide
document.addEventListener('error', function (event) {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'img') {
        // Option A: Hide completely
        target.style.display = 'none'; 
        
        // Option B: Optional replacement with a 1x1 transparent pixel 
        // to maintain layout/spacing without showing anything ugly
        // target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
}, true); // 'true' is critical to catch events in the capturing phase

const SURAH_METADATA = [
          { "chapter": 1, "english_name": "The Opening", "description": "Revealed in Mecca, this is the fundamental prayer of Islam, summarizing the core relationship between God and humanity. It is recited in every unit of prayer. (7 verses)" },
          { "chapter": 2, "english_name": "The Cow", "description": "The longest Surah, revealed in Medina. It establishes Islamic laws, recounts the stories of Moses (Peace be upon him), and guides the new Muslim community. (286 verses)" },
          { "chapter": 3, "english_name": "The Family of Imran", "description": "A Medinan chapter focusing on the Oneness of God, the family of Mary (Peace be upon her) and Jesus (Peace be upon him), and lessons from the Battle of Uhud. (200 verses)" },
          { "chapter": 4, "english_name": "The Women", "description": "Revealed in Medina after the Battle of Uhud, addressing the rights of women, care for orphans, inheritance laws, and the protection of the vulnerable within society. (176 verses)" },
          { "chapter": 5, "english_name": "The Table Spread", "description": "One of the last revealed Surahs, finalizing dietary laws and discussing the miracle of the table requested by the disciples of Jesus (Peace be upon him) and the fulfillment of covenants. (120 verses)" },
          { "chapter": 6, "english_name": "The Cattle", "description": "A late Meccan Surah emphasizing pure monotheism, rejecting superstition, and detailing the nature of God's infinite power over creation. (165 verses)" },
          { "chapter": 7, "english_name": "The Heights", "description": "A Meccan chapter detailing the history of prophets from Adam (Peace be upon him) to Moses (Peace be upon him), warning against arrogance and describing the Day of Judgment. (206 verses)" },
          { "chapter": 8, "english_name": "The Spoils of War", "description": "Revealed after the Battle of Badr, clarifying the ethics of warfare, the distribution of spoils, and the importance of placing full trust in God. (75 verses)" },
          { "chapter": 9, "english_name": "The Repentance", "description": "A Medinan text issued before the Tabuk expedition, addressing treaty violations by polytheists and the issue of hypocrisy; it is the only Surah that does not begin with 'Bismillah'. (129 verses)" },
          { "chapter": 10, "english_name": "Jonah", "description": "A Meccan Surah emphasizing God's Oneness and citing the story of the people of Jonah (Peace be upon him), who were saved by their timely repentance. (109 verses)" },
          { "chapter": 11, "english_name": "Hud", "description": "Revealed during a difficult period in Mecca, recounting stories of previous prophets like Noah (Peace be upon him) and Hud (Peace be upon him) to comfort the Prophet Muhammad (Peace be upon him). (123 verses)" },
          { "chapter": 12, "english_name": "Joseph", "description": "A unique Meccan Surah devoted entirely to the story of Joseph (Peace be upon him), illustrating patience, divine destiny, and family reconciliation. (111 verses)" },
          { "chapter": 13, "english_name": "The Thunder", "description": "Revealed in Medina, utilizing natural phenomena like thunder to argue for the existence of God and the absolute truth of the resurrection. (43 verses)" },
          { "chapter": 14, "english_name": "Abraham", "description": "A Meccan chapter highlighting the prayer of Abraham (Peace be upon him) for the sanctuary of Mecca and contrasting the gratitude of believers with the ingratitude of disbelievers. (52 verses)" },
          { "chapter": 15, "english_name": "The Rocky Tract", "description": "A Meccan Surah reassuring the Prophet (Peace be upon him) against mockery and detailing the story of Satan's refusal to bow to Adam (Peace be upon him). (99 verses)" },
          { "chapter": 16, "english_name": "The Bee", "description": "A Meccan chapter calling attention to God's blessings in nature, specifically the bee, and warning against associating partners with God. (128 verses)" },
          { "chapter": 17, "english_name": "The Night Journey", "description": "Commemorates the Prophet Muhammad's (Peace be upon him) miraculous night journey from Mecca to Jerusalem and ascension to the heavens, establishing the five daily prayers. (111 verses)" },
          { "chapter": 18, "english_name": "The Cave", "description": "A Meccan Surah telling the story of the Sleepers of the Cave and Moses (Peace be upon him), focusing on maintaining faith during times of trial. (110 verses)" },
          { "chapter": 19, "english_name": "Mary", "description": "A Meccan chapter detailing the miraculous births of Jesus (Peace be upon him) and John (Peace be upon him), emphasizing God's mercy and refuting the concept of God having a son. (98 verses)" },
          { "chapter": 20, "english_name": "Ta-Ha", "description": "Revealed in Mecca, this Surah details the story of Moses (Peace be upon him) confronting Pharaoh and offers comfort to the Prophet Muhammad (Peace be upon him). (135 verses)" },
          { "chapter": 21, "english_name": "The Prophets", "description": "A Meccan text referencing many prophets (Peace be upon them) to show the continuity of the divine message and the inevitability of Judgment Day. (112 verses)" },
          { "chapter": 22, "english_name": "The Pilgrimage", "description": "A Medinan Surah establishing the rituals of the Hajj pilgrimage and giving permission to believers to defend themselves against oppression. (78 verses)" },
          { "chapter": 23, "english_name": "The Believers", "description": "Revealed in Mecca, outlining the moral qualities of true believers and the miraculous stages of human embryonic development. (118 verses)" },
          { "chapter": 24, "english_name": "The Light", "description": "A Medinan chapter focusing on social ethics, laws against slander (specifically regarding Aisha, may Allah be pleased with her), and the famous 'Verse of Light'. (64 verses)" },
          { "chapter": 25, "english_name": "The Criterion", "description": "A Meccan Surah distinguishing right from wrong, answering objections raised against the Quran, and describing the virtues of the 'Servants of the Most Merciful'. (77 verses)" },
          { "chapter": 26, "english_name": "The Poets", "description": "A Meccan chapter recounting the struggles of past prophets (Peace be upon them) and criticizing poets who mislead people with falsehoods. (227 verses)" },
          { "chapter": 27, "english_name": "The Ant", "description": "Revealed in Mecca, featuring the story of Solomon (Peace be upon him), the Queen of Sheba, and the ant, emphasizing knowledge and gratitude. (93 verses)" },
          { "chapter": 28, "english_name": "The Narratives", "description": "A Meccan Surah detailing the life of Moses (Peace be upon him) before prophethood and the arrogance of Korah (Qarun) regarding wealth. (88 verses)" },
          { "chapter": 29, "english_name": "The Spider", "description": "A Meccan chapter using the metaphor of a spider's web to describe the fragility of false beliefs and the necessity of testing one's faith. (69 verses)" },
          { "chapter": 30, "english_name": "The Romans", "description": "Revealed in Mecca, predicting the Byzantine (Roman) victory over the Persians as a sign of God's control over historical events. (60 verses)" },
          { "chapter": 31, "english_name": "Luqman", "description": "A Meccan Surah containing the wisdom and advice of the sage Luqman to his son regarding faith, gratitude, and behavior. (34 verses)" },
          { "chapter": 32, "english_name": "The Prostration", "description": "A Meccan chapter emphasizing the creation of man, the revelation of the Book, and the absolute certainty of the Day of Judgment. (30 verses)" },
          { "chapter": 33, "english_name": "The Combined Forces", "description": "Revealed in Medina during the Battle of the Trench, addressing social reforms, adoption, and the status of the Prophet's (Peace be upon him) wives. (73 verses)" },
          { "chapter": 34, "english_name": "Sheba", "description": "A Meccan Surah contrasting the gratitude of David (Peace be upon him) and Solomon (Peace be upon him) with the ingratitude of the people of Sheba. (54 verses)" },
          { "chapter": 35, "english_name": "The Originator", "description": "A Meccan chapter praising God as the Creator of angels and the universe, warning against the deception of worldly life. (45 verses)" },
          { "chapter": 36, "english_name": "Ya-Sin - O Man", "description": "Known as the 'heart of the Quran', this Meccan Surah focuses on the Quran's divine source, the signs of nature, and the resurrection. (83 verses)" },
          { "chapter": 37, "english_name": "Those Who Set The Ranks", "description": "A Meccan chapter describing the ranks of angels and the eventual triumph of God's messengers (Peace be upon them) over opposition. (182 verses)" },
          { "chapter": 38, "english_name": "The Letter Sad", "description": "Revealed in Mecca, discussing the patience of prophets like David (Peace be upon him) and Job (Peace be upon him) and the arrogance of Satan. (88 verses)" },
          { "chapter": 39, "english_name": "The Troops", "description": "A Meccan Surah focusing heavily on the Oneness of God (Tawhid) and the distinct outcomes for believers and disbelievers. (75 verses)" },
          { "chapter": 40, "english_name": "The Forgiver", "description": "A Meccan chapter telling the story of a believing man in Pharaoh's court and emphasizing God's forgiveness and power. (85 verses)" },
          { "chapter": 41, "english_name": "Explained in Detail", "description": "A Meccan Surah describing the Quran's clarity and the testimony of man's own faculties (skin and ears) against him on Judgment Day. (54 verses)" },
          { "chapter": 42, "english_name": "The Consultation", "description": "A Meccan chapter emphasizing 'Shura' (consultation) among believers and the unity of the message given to all prophets (Peace be upon them). (53 verses)" },
          { "chapter": 43, "english_name": "The Ornaments of Gold", "description": "A Meccan Surah criticizing the obsession with worldly wealth and correcting false attributions of daughters/offspring to God. (89 verses)" },
          { "chapter": 44, "english_name": "The Smoke", "description": "A Meccan chapter warning of a coming punishment (smoke) and recounting the failure of Pharaoh to heed Moses (Peace be upon him). (59 verses)" },
          { "chapter": 45, "english_name": "The Crouching", "description": "A Meccan Surah describing the humility of all nations kneeling before God on Judgment Day and the proofs of God in nature. (37 verses)" },
          { "chapter": 46, "english_name": "The Wind-Curved Sandhills", "description": "A Meccan chapter mentioning the Jinn listening to the Quran and advising kindness and dutifulness to parents. (35 verses)" },
          { "chapter": 47, "english_name": "Muhammad (Peace be upon him)", "description": "A Medinan Surah named after the Prophet (Peace be upon him), focused on the believers' struggle for the cause of truth and the nullification of disbelievers' deeds. (38 verses)" },
          { "chapter": 48, "english_name": "The Victory", "description": "Revealed after the Treaty of Hudaybiyyah, declaring it a clear victory and promising the future peaceful conquest of Mecca. (29 verses)" },
          { "chapter": 49, "english_name": "The Rooms", "description": "A Medinan chapter teaching manners, respect for the Prophet (Peace be upon him), and the brotherhood of all believers regardless of race. (18 verses)" },
          { "chapter": 50, "english_name": "The Letter Qaf", "description": "A Meccan Surah emphasizing the resurrection and how every human deed is recorded by guardian angels. (45 verses)" },
          { "chapter": 51, "english_name": "The Winnowing Winds", "description": "A Meccan chapter discussing the purpose of creating humans and Jinn—solely to worship God. (60 verses)" },
          { "chapter": 52, "english_name": "The Mount", "description": "A Meccan Surah swearing by Mount Sinai, describing the bliss of Paradise for the righteous and the fate of deniers. (49 verses)" },
          { "chapter": 53, "english_name": "The Star", "description": "A Meccan chapter confirming the divine source of the Prophet's (Peace be upon him) vision during his ascension and refuting idol worship. (62 verses)" },
          { "chapter": 54, "english_name": "The Moon", "description": "A Meccan Surah referencing the splitting of the moon as a sign and recounting the punishments of past nations who rejected their prophets. (55 verses)" },
          { "chapter": 55, "english_name": "The Beneficent", "description": "A Meccan chapter known as the 'Bride of the Quran,' repeatedly asking 'Which of the favors of your Lord will you deny?' (78 verses)" },
          { "chapter": 56, "english_name": "The Inevitable", "description": "A Meccan Surah categorizing people into three groups in the afterlife: the foremost, the companions of the right, and the companions of the left. (96 verses)" },
          { "chapter": 57, "english_name": "The Iron", "description": "A Medinan chapter encouraging charity, described as a 'goodly loan' to God, and mentioning iron as a tool given for humanity's benefit. (29 verses)" },
          { "chapter": 58, "english_name": "The Pleading Woman", "description": "A Medinan Surah addressing marital issues and God's omniscience, hearing every conversation, including secret counsels. (22 verses)" },
          { "chapter": 59, "english_name": "The Exile", "description": "Revealed in Medina concerning the consequences for the Banu Nadir tribe who broke their treaty, and the distribution of wealth. (24 verses)" },
          { "chapter": 60, "english_name": "She That Is To Be Examined", "description": "A Medinan chapter regarding the treatment of women refugees and establishing that kindness is due to non-believers who do not fight against Muslims. (13 verses)" },
          { "chapter": 61, "english_name": "The Ranks", "description": "A Medinan Surah urging believers to align their actions with their words and predicting the coming of a messenger named Ahmad (Muhammad, Peace be upon him). (14 verses)" },
          { "chapter": 62, "english_name": "The Congregation", "description": "A Medinan chapter establishing the importance of the Friday congregational prayer (Jumu'ah) over worldly commerce. (11 verses)" },
          { "chapter": 63, "english_name": "The Hypocrites", "description": "A Medinan Surah exposing the deceit of the hypocrites who internally opposed the Prophet (Peace be upon him) while pretending to believe. (11 verses)" },
          { "chapter": 64, "english_name": "The Mutual Disillusion", "description": "A Medinan chapter describing Judgment Day as a day of mutual gain and loss, emphasizing reliance on God alone. (18 verses)" },
          { "chapter": 65, "english_name": "The Divorce", "description": "A Medinan Surah outlining the specific laws, waiting periods (Iddah), and maintenance rights regarding divorce. (12 verses)" },
          { "chapter": 66, "english_name": "The Prohibition", "description": "A Medinan chapter addressing a domestic incident in the Prophet's (Peace be upon him) household and holding up the righteous wives of Noah (Peace be upon him) and Lot (Peace be upon him) as examples. (12 verses)" },
          { "chapter": 67, "english_name": "The Sovereignty", "description": "A Meccan Surah affirming God's dominion over life and death. (30 verses)" },
          { "chapter": 68, "english_name": "The Pen", "description": "A Meccan chapter defending the Prophet's (Peace be upon him) sanity and character against accusers, and telling the parable of the owners of the garden. (52 verses)" },
          { "chapter": 69, "english_name": "The Reality", "description": "A Meccan Surah describing the inevitable destruction of past nations and the terrifying events of the Day of Judgment. (52 verses)" },
          { "chapter": 70, "english_name": "The Ascending Stairways", "description": "A Meccan chapter focusing on the patience required of the Prophet (Peace be upon him) and the eventual punishment of the disbelievers. (44 verses)" },
          { "chapter": 71, "english_name": "Noah", "description": "A Meccan Surah dedicated to Noah's (Peace be upon him) tireless but largely rejected preaching to his people before the flood. (28 verses)" },
          { "chapter": 72, "english_name": "The Jinn", "description": "A Meccan chapter recounting how a group of Jinn listened to the Quran and accepted Islam, acknowledging God's oneness. (28 verses)" },
          { "chapter": 73, "english_name": "The Enshrouded One", "description": "A Meccan Surah instructing the Prophet (Peace be upon him) to pray during the night and to bear patiently with those who deny the truth. (20 verses)" },
          { "chapter": 74, "english_name": "The Cloaked One", "description": "One of the earliest Meccan revelations, commanding the Prophet (Peace be upon him) to arise, warn the people, and purify himself. (56 verses)" },
          { "chapter": 75, "english_name": "The Resurrection", "description": "A Meccan chapter emphasizing the certainty of the resurrection and the Prophet's (Peace be upon him) eagerness to memorize the revelation. (40 verses)" },
          { "chapter": 76, "english_name": "Man", "description": "A Medinan Surah describing the rewards of the righteous in Paradise, particularly those who feed the poor, orphans, and captives. (31 verses)" },
          { "chapter": 77, "english_name": "The Emissaries", "description": "A Meccan chapter swearing by the winds, emphasizing the inevitability of the Day of Decision and warning deniers. (50 verses)" },
          { "chapter": 78, "english_name": "The Tidings", "description": "A Meccan Surah questioning those who deny the afterlife and vividly describing the day when the trumpet is blown. (40 verses)" },
          { "chapter": 79, "english_name": "Those Who Drag Forth", "description": "A Meccan chapter describing the angels who take souls at death and the story of Moses (Peace be upon him) calling Pharaoh to account. (46 verses)" },
          { "chapter": 80, "english_name": "He Frowned", "description": "A Meccan Surah correcting the Prophet (Peace be upon him) for prioritizing a wealthy leader over a blind man seeking knowledge. (42 verses)" },
          { "chapter": 81, "english_name": "The Overthrowing", "description": "A Meccan chapter depicting the cosmic upheavals at the end of the world, such as the sun being darkened. (29 verses)" },
          { "chapter": 82, "english_name": "The Cleaving", "description": "A Meccan Surah warning humanity about their delusion regarding God and describing the recording of deeds by angels. (19 verses)" },
          { "chapter": 83, "english_name": "The Defrauding", "description": "A Meccan chapter condemning those who cheat in business weights and measures, warning of the record of the wicked. (36 verses)" },
          { "chapter": 84, "english_name": "The Sundering", "description": "A Meccan Surah describing the sky splitting open and humanity laboring toward their Lord to receive their records. (25 verses)" },
          { "chapter": 85, "english_name": "The Mansions of the Stars", "description": "A Meccan chapter recounting the story of the People of the Ditch who were persecuted for their faith. (22 verses)" },
          { "chapter": 86, "english_name": "The Morning Star", "description": "A Meccan Surah discussing the creation of man and the distinctness of the Quran's message. (17 verses)" },
          { "chapter": 87, "english_name": "The Most High", "description": "A Meccan chapter emphasizing the purification of the soul and reminding that the Hereafter is better and more enduring. (19 verses)" },
          { "chapter": 88, "english_name": "The Overwhelming", "description": "A Meccan Surah contrasting the terrified state of the damned with the peaceful state of the believers in Paradise. (26 verses)" },
          { "chapter": 89, "english_name": "The Dawn", "description": "A Meccan chapter warning against the greed for wealth and mentioning the punishment of ancient tribes like Ad and Thamud. (30 verses)" },
          { "chapter": 90, "english_name": "The City", "description": "A Meccan Surah defining the 'steep path' of righteousness as freeing slaves and feeding the hungry. (20 verses)" },
          { "chapter": 91, "english_name": "The Sun", "description": "A Meccan chapter linking the purification of the soul to success and corruption to failure, citing the Thamud. (15 verses)" },
          { "chapter": 92, "english_name": "The Night", "description": "A Meccan Surah contrasting those who give in charity with those who are miserly, warning of the consequences. (21 verses)" },
          { "chapter": 93, "english_name": "The Morning Hours", "description": "Revealed in Mecca to comfort the Prophet (Peace be upon him) after a pause in revelation, promising that his future will be better than his past. (11 verses)" },
          { "chapter": 94, "english_name": "The Relief", "description": "A Meccan chapter reassuring the Prophet (Peace be upon him) that with every hardship comes ease and that his burden has been lifted. (8 verses)" },
          { "chapter": 95, "english_name": "The Fig", "description": "A Meccan Surah stating that man was created in the best stature but will fall to the lowest depth unless he believes and does good works. (8 verses)" },
          { "chapter": 96, "english_name": "The Clot", "description": "The first revelation to the Prophet (Peace be upon him) in the Cave of Hira, commanding him to read in the name of his Lord. (19 verses)" },
          { "chapter": 97, "english_name": "The Power", "description": "A Meccan chapter describing the Night of Decree (Laylat al-Qadr), which is better than a thousand months. (5 verses)" },
          { "chapter": 98, "english_name": "The Clear Proof", "description": "A Medinan Surah distinguishing between the believers and disbelievers among the People of the Scripture and the polytheists. (8 verses)" },
          { "chapter": 99, "english_name": "The Earthquake", "description": "A Medinan chapter vividly describing the earth shaking on Judgment Day and yielding up its burdens and secrets. (8 verses)" },
          { "chapter": 100, "english_name": "The Courser", "description": "A Meccan Surah using the imagery of charging warhorses to describe the ungrateful nature of mankind. (11 verses)" },
          { "chapter": 101, "english_name": "The Calamity", "description": "A Meccan chapter depicting the Day of Judgment where people will be like scattered moths and mountains like wool. (11 verses)" },
          { "chapter": 102, "english_name": "The Rivalry in World Increase", "description": "A Meccan Surah warning that the obsession with accumulating more wealth and status distracts people until they reach the grave. (8 verses)" },
          { "chapter": 103, "english_name": "The Declining Day", "description": "A Meccan chapter summarizing that all mankind is in loss except those who believe, do good, and advise one another to truth and patience. (3 verses)" },
          { "chapter": 104, "english_name": "The Traducer", "description": "A Meccan Surah condemning the backbiter and the one who hoards wealth, warning of the crushing fire. (9 verses)" },
          { "chapter": 105, "english_name": "The Elephant", "description": "A Meccan chapter recalling the destruction of Abraha's army of elephants who attempted to destroy the Kaaba. (5 verses)" },
          { "chapter": 106, "english_name": "Quraysh", "description": "A Meccan Surah calling upon the Quraysh tribe to be grateful to God who provided them with security and sustenance. (4 verses)" },
          { "chapter": 107, "english_name": "The Small Kindnesses", "description": "A Meccan chapter condemning those who deny the Judgment, neglect prayer, and refuse small acts of kindness. (7 verses)" },
          { "chapter": 108, "english_name": "The Abundance", "description": "The shortest Surah in the Quran, revealed in Mecca, promising the Prophet (Peace be upon him) abundant good and cutting off his enemies. (3 verses)" },
          { "chapter": 109, "english_name": "The Disbelievers", "description": "A Meccan Surah declaring the absolute separation of worship between believers and disbelievers: 'To you be your religion, and to me my religion.' (6 verses)" },
          { "chapter": 110, "english_name": "The Divine Support", "description": "One of the last Medinan revelations, foretelling the mass entry of people into Islam and commanding praise of God. (3 verses)" },
          { "chapter": 111, "english_name": "The Palm Fiber", "description": "A Meccan Surah condemning Abu Lahab, an uncle and enemy of the Prophet (Peace be upon him), and his wife to the Fire. (5 verses)" },
          { "chapter": 112, "english_name": "The Sincerity", "description": "A Meccan chapter that is the essence of monotheism, declaring God is One, Eternal, with no offspring or equal. (4 verses)" },
          { "chapter": 113, "english_name": "The Daybreak", "description": "A Meccan Surah seeking refuge in the Lord of the dawn from the evil of created things and envy. (5 verses)" },
          { "chapter": 114, "english_name": "Mankind", "description": "A Meccan chapter seeking refuge in the Lord of mankind from the whispers of devils and men. (6 verses)" }
        ];

// --- 2. MULTI-PROFILE & LOGIC ---
const ACTIVE_PROFILE_ID = "1";
const STORAGE_KEY = `quranState_${ACTIVE_PROFILE_ID}`;

// Supported Puter TTS Languages Map
const TTS_LANGUAGE_MAP = {
    'en': 'en-US',
    'ar': 'ar-AE',
    'cs': 'cs-CZ',
    'da': 'da-DK',
    'de': 'de-DE',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'hi': 'hi-IN',
    'it': 'it-IT',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'nl': 'nl-NL',
    'no': 'nb-NO',
    'pl': 'pl-PL',
    'pt': 'pt-PT',
    'ro': 'ro-RO',
    'ru': 'ru-RU',
    'sv': 'sv-SE',
    'tr': 'tr-TR',
    'zh': 'cmn-CN'
};

const TRANSLATIONS_CONFIG = {
    'en': { name: 'English (Saheeh Intl) | Preferred', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/en.xml' },
    'sq': { name: 'Albanian (Sherif Ahmeti)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sq.ahmeti.xml' },
    'ber': { name: 'Amazigh (At Mansour)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ber.mensur.xml' },
    'am': { name: 'Amharic (Sadiq & Sani)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/am.sadiq.xml' },
    'ar': { name: 'Arabic Tafsir (Al-Muyassar)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ar.muyassar.xml' },
    'az': { name: 'Azerbaijani (Mammadaliyev & Bunyadov)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/az.mammadaliyev.xml' },
    'bn': { name: 'Bengali (Zohurul Hoque)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/bn.bengali.xml' },
    'bg': { name: 'Bulgarian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/bg.theophanov.xml' },
    'bs': { name: 'Bosnian (Korkut)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/bs.korkut.xml' },
    'cs': { name: 'Czech (Hrbek)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/cs.hrbek.xml' },
    'de': { name: 'German (Bubenheim & Elyas)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/de.aburida.xml' },
    'dv': { name: 'Divehi', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/dv.divehi.xml' },
    'es': { name: 'Spanish (Cortes)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/es.cortes.xml' },
    'fa': { name: 'Persian (Mostafa)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/fa.khorramdel.xml' },
    'fr': { name: 'French (Hamidullah)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/fr.hamidullah.xml' },
    'ha': { name: 'Hausa (Gumi)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ha.gumi.xml' },
    'hi': { name: 'Hindi (Farooq Khan & Ahmed)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/hi.hindi.xml' },
    'id': { name: 'Indonesian (Bahasa Indonesia)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/id.indonesian.xml' },
    'it': { name: 'Italian (Piccardo)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/it.piccardo.xml' },
    'ja': { name: 'Japanese', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ja.japanese.xml' },
    'ko': { name: 'Korean', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ko.korean.xml' },
    'ku': { name: 'Kurdish (Bamoki)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ku.asan.xml' },
    'ml': { name: 'Malayalam (Abdul Hameed & Kunhi)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ml.abdulhameed.xml' },
    'ms': { name: 'Malay (Basmeih)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ms.basmeih.xml' },
    'nl': { name: 'Dutch (Keyzer)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/nl.keyzer.xml' },
    'no': { name: 'Norwegian (Einar Berg)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/no.berg.xml' },
    'pl': { name: 'Polish (Bielawskiego)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/pl.bielawskiego.xml' },
    'pt': { name: 'Portuguese (El-Hayek)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/pt.elhayek.xml' },
    'ro': { name: 'Romanian (Grigore)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ro.grigore.xml' },
    'ru': { name: 'Russian (Kuliev)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ru.kuliev.xml' },
    'sd': { name: 'Sindhi (Amroti)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sd.amroti.xml' },
    'so': { name: 'Somali', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/so.abduh.xml' },
    'sq': { name: 'Albanian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sq.ahmeti.xml' },
    'sv': { name: 'Swedish (Bernström)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sv.bernstrom.xml' },
    'sw': { name: 'Swahili (Al-Barwani)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sw.barwani.xml' },
    'ta': { name: 'Tamil (Jan Turst)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ta.tamil.xml' },
    'tg': { name: 'Tajik (AbdolMohammad)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/tg.ayati.xml' },
    'th': { name: 'Thai', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/th.thai.xml' },
    'tr': { name: 'Turkish (Yatir)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/tr.yazir.xml' },
    'tt': { name: 'Tatar (Yakub)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/tt.nugman.xml' },
    'ug': { name: 'Uyghur (Saleh)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ug.saleh.xml' },
    'ur': { name: 'Urdu (Maududi)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ur.maududi.xml' },
    'uz': { name: 'Uzbek (Mansour)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/uz.sodik.xml' },
    'zh': { name: 'Chinese (Ma Jian)', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/zh.jian.xml' }
};

const RECITERS_CONFIG = {
    'mishary': { name: 'Mishary Rashid Alafasy', path: 'Alafasy_128kbps' },
    'sudais': { name: 'Abdur-Rahman as-Sudais', path: 'Abdurrahmaan_As-Sudais_192kbps' },
    'shuraym': { name: 'Saud ash-Shuraym', path: 'Saood_ash-Shuraym_128kbps' },
    'ghamdi': { name: 'Saad al-Ghamdi', path: 'Ghamadi_40kbps' },
    'hudhaify': { name: 'Ali al-Hudhaify', path: 'Hudhaify_128kbps' },
    'husary': { name: 'Mahmoud Khalil Al-Husary', path: 'Husary_128kbps' },
    'minshawi': { name: 'Mohamed Siddiq al-Minshawi', path: 'Minshawy_Mujawwad_192kbps' },
    'abdulbasit': { name: 'Abdul Basit Abdul Samad', path: 'Abdul_Basit_Mujawwad_128kbps' },
    'juhany': { name: 'Abdullah Awad al-Juhany', path: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps' },
    'maher': { name: 'Maher Al-Muaiqly', path: 'MaherAlMuaiqly128kbps' },
    'ajamy': { name: 'Ahmed al-Ajamy', path: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net' },
    'budair': { name: 'Salah Bukhatir', path: 'Salah_Bukhatir_128kbps' }
};

const TRANSLATION_AUDIO_CONFIG = {
    'none': { name: 'None (Recitation Only)', path: '' },
    'en': { name: 'English (Sahih Intl) - Audio', path: 'httpIA/archive.org/download/Quran_Translation_Sahih_International_English_Audio_128kbps/Quran_Translation_Sahih_International_English_Audio_128kbps' },
    'ur': { name: 'Urdu (Jalandhry) - Audio', path: 'httpIA/archive.org/download/Quran_Translation_Urdu_Jalandhry_Audio_128kbps/Quran_Translation_Urdu_Jalandhry_Audio_128kbps' }
};

const elements = {
    overlay: document.getElementById('loading-overlay'),
    spinner: document.getElementById('loading-spinner'),
    loaderText: document.getElementById('loader-text'),
    startBtn: document.getElementById('start-btn'),
    selects: {
        chapter: document.getElementById('chapter-select'),
        verse: document.getElementById('verse-select'),
        reciter: document.getElementById('reciter-select'),
        trans: document.getElementById('trans-select'),
        transAudio: document.getElementById('trans-audio-select')
    },
    verseText: document.getElementById('verse-text'),
    transText: document.getElementById('translation-text'),
    audio: document.getElementById('quran-audio'),
    transAudio: document.getElementById('trans-audio'),
    
    // View Management
    views: {
        dashboard: document.getElementById('dashboard-view'),
        cinema: document.getElementById('cinema-view')
    },
    // TV Navigation Elements
    sidebar: {
        container: document.getElementById('tv-sidebar'),
        home: document.getElementById('nav-home'),
        search: document.getElementById('nav-search'),
        profile: document.getElementById('nav-profile')
    },
    search: {
        overlay: document.getElementById('search-overlay'),
        inputDisplay: document.getElementById('search-input-display'),
        keyboardGrid: document.getElementById('keyboard-grid'),
        resultsGrid: document.getElementById('search-results-grid')
    },
    subtitle: document.getElementById('hero-subtitle-overlay')
};

let quranData = [];
let translationCache = {};
// Cache for generated TTS blobs to save quota (Free Forever Optimization)
let ttsCache = {};

let currentChapterData = {};
let inactivityTimer;
let forbiddenToTranslateSet = new Set();
let isBuffering = false;

// Preview Variables
let previewTimeout;
const PREVIEW_DELAY = 600;
let previewSequence = [];
let previewSeqIndex = 0;

// Search Variables
let searchString = "";
const KEYBOARD_KEYS = [
    'A','B','C','D','E','F',
    'G','H','I','J','K','L',
    'M','N','O','P','Q','R',
    'S','T','U','V','W','X',
    'Y','Z','1','2','3','4',
    '5','6','7','8','9','0',
    'SPACE', 'DEL', 'CLEAR'
];

// --- INITIALIZATION ---
window.onload = async () => {
    try {
        await loadQuranData();
        populateChapterSelect();
        populateReciterSelect();
        populateTranslationAudioSelect(); // Modified
        populateTranslationSelect();

        // Restore State or Default
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        
        // Handle URL Params for Direct Link
        const urlParams = new URLSearchParams(window.location.search);
        
        let startInCinema = false;
        
        if (urlParams.has('chapter')) {
            startInCinema = true;
            elements.selects.chapter.value = parseInt(urlParams.get('chapter')) - 1;
            populateVerseSelect();
            
            if (urlParams.has('verse')) {
                elements.selects.verse.value = parseInt(urlParams.get('verse')) - 1;
            }
            if (urlParams.has('reciter')) {
                elements.selects.reciter.value = urlParams.get('reciter');
            }
        } else if (saved.chapter !== undefined) {
            elements.selects.chapter.value = saved.chapter;
            populateVerseSelect();
            if (saved.verse !== undefined) elements.selects.verse.value = saved.verse;
            if (saved.reciter) elements.selects.reciter.value = saved.reciter;
        } else {
            // Default
            populateVerseSelect();
        }

        // Apply Translations Logic
        applyTranslationSettings(saved, urlParams);

        if(startInCinema) {
            switchView('cinema');
            const activeTransId = elements.selects.trans.value;
            await loadTranslationData(activeTransId);
            loadVerse(false);
            
            // Old Logic
            elements.spinner.style.display = 'none';
            elements.loaderText.style.display = 'none';
            elements.startBtn.style.display = 'block';
            elements.startBtn.textContent = "Continue";
            elements.startBtn.focus();
        } else {
            // Start in Dashboard
            switchView('dashboard');
            refreshDashboard();
            elements.overlay.style.display = 'none';
        }

        setupEventListeners();
        initSidebarNavigation();
        initSearchInterface();

    } catch (error) {
        console.error("Critical Init Error:", error);
        elements.loaderText.textContent = "Error loading content. Please check connection.";
    }
}

// --- DASHBOARD FUNCTIONS ---
function refreshDashboard() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const heroBtn = document.getElementById('door-play-btn');
    
    const allIndices = Array.from({length: 114}, (_, i) => i);
    const shortRowIndices = allIndices.slice(77, 114);

    fillRow('trending-row', [36, 67, 18, 55, 1, 112, 113, 114].map(id => id-1));
    fillRow('short-row', shortRowIndices);
    fillRow('all-row', Array.from({length: 114}, (_, i) => i));

    if (saved.chapter !== undefined) {
        const ch = parseInt(saved.chapter) + 1;
        const v = parseInt(saved.verse) + 1;
        const meta = SURAH_METADATA[saved.chapter];
        
        document.getElementById('hero-title').textContent = `Continue: ${meta.english_name}`;
        document.getElementById('hero-desc').textContent = `Ayah ${v} • ${meta.description.substring(0, 100)}...`;
        
        const reciterId = saved.reciter || 'mishary';
        const imgUrl = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/images/img/${ch}_${v}.png`;
        
        // Background Hero
        const tempImg = new Image();
        tempImg.src = imgUrl;
        tempImg.onload = () => {
             const heroImg = document.getElementById('door-hero-img');
             if (heroImg) heroImg.src = imgUrl;
        };

        heroBtn.textContent = "Resume Playback";
        heroBtn.onclick = () => {
             launchPlayer(ch, v);
        };
        
        // Start Hero Preview Loop
        startHeroPreview(ch, v, reciterId);

    } else {
        document.getElementById('hero-title').textContent = "Welcome to Quran Lite";
        document.getElementById('hero-desc').textContent = "Select a Surah below to begin.";
        heroBtn.textContent = "Start Reading";
        heroBtn.onclick = () => {
            document.querySelector('#trending-row .surah-card').focus();
        };
    }
    
    // Initial Focus
    heroBtn.focus();
}

function startHeroPreview(chapterNum, startVerse, reciterId) {
    if (previewTimeout) clearTimeout(previewTimeout);
    
    // Generate a sequence of 3 verses to cycle through silently
    previewSequence = [startVerse, startVerse + 1, startVerse + 2];
    previewSeqIndex = 0;
    
    playPreviewStep(chapterNum, reciterId);
}

async function playPreviewStep(chapterNum, reciterId) {
    if (previewSeqIndex >= previewSequence.length) {
        previewSeqIndex = 0; // Loop
    }
    
    const verseNum = previewSequence[previewSeqIndex];
    // Check bounds
    const chIdx = chapterNum - 1;
    if (!quranData[chIdx] || !quranData[chIdx].verses[verseNum-1]) {
        previewSeqIndex = 0;
        return;
    }

    // Load Image
    const newSrc = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/images/img/${chapterNum}_${verseNum}.png`;
    
    // Load Translation Subtitle
    const transId = elements.selects.trans.value;
    
    // Ensure Trans Data Loaded
    if (!translationCache[transId]) {
        try {
            await loadTranslationData(transId);
        } catch(e) { console.log("Preview trans load fail"); }
    }
    
    let subText = "";
    if (translationCache[transId] && translationCache[transId][chapterNum]) {
        subText = translationCache[transId][chapterNum][verseNum] || "";
    }

    // Update UI
    const heroImg = document.getElementById('door-hero-img');
    const subtitle = elements.subtitle;
    
    // Fade effect
    heroImg.style.transition = "opacity 1s";
    heroImg.style.opacity = 0;
    
    setTimeout(() => {
        heroImg.src = newSrc;
        subtitle.textContent = subText;
        heroImg.onload = () => {
             heroImg.style.opacity = 0.4; // Dimmed
        };
        
        previewSeqIndex++;
        previewTimeout = setTimeout(() => {
            playPreviewStep(chapterNum, reciterId);
        }, 6000); // 6 seconds per slide
    }, 1000);
}

function fillRow(rowId, indices) {
    const row = document.getElementById(rowId);
    row.innerHTML = '';
    
    indices.forEach(idx => {
        if (!SURAH_METADATA[idx]) return;
        const meta = SURAH_METADATA[idx];
        const card = document.createElement('div');
        card.className = 'surah-card';
        card.tabIndex = 0;
        card.dataset.chapter = meta.chapter;
        
        card.innerHTML = `
            <div class="card-bg-num">${meta.chapter}</div>
            <div class="card-title">${meta.english_name}</div>
            <div class="card-sub">${meta.chapter} • ${meta.description.split(' ')[0]}...</div>
        `;
        
        card.onclick = () => launchPlayer(meta.chapter, 1);
        card.onkeydown = (e) => {
            if (e.key === 'Enter') launchPlayer(meta.chapter, 1);
        };
        
        row.appendChild(card);
    });
}

function launchPlayer(chapter, verse) {
    // Stop Preview
    if (previewTimeout) clearTimeout(previewTimeout);
    
    elements.selects.chapter.value = chapter - 1;
    populateVerseSelect();
    elements.selects.verse.value = verse - 1;
    
    switchView('cinema');
    loadVerse(true);
}

function switchView(viewName) {
    Object.values(elements.views).forEach(el => el.classList.remove('active'));
    elements.views[viewName].classList.add('active');
    
    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (viewName === 'dashboard') elements.sidebar.home.classList.add('active');
}

// --- CORE FUNCTIONS ---

async function loadQuranData() {
    // We only need metadata which is hardcoded now. 
    // But we need verse counts. We can fetch a light index or just infer.
    // For this app, we will use a light structure.
    
    // Mocking structure for Verse counts based on standard Quran
    // This avoids fetching a huge JSON initially
    const verseCounts = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
    
    quranData = verseCounts.map((count, i) => ({
        chapterNumber: i + 1,
        verses: Array.from({length: count}, (_, j) => ({ verseNumber: j + 1 }))
    }));
}

function populateChapterSelect() {
    elements.selects.chapter.innerHTML = '';
    SURAH_METADATA.forEach((c, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${c.chapterNumber}. ${c.english_name} - ${c.description.substring(0, 30)}...`;
        elements.selects.chapter.appendChild(opt);
    });
}

function populateVerseSelect() {
    elements.selects.verse.innerHTML = '';
    const chIdx = elements.selects.chapter.value || 0;
    currentChapterData = quranData[chIdx];
    
    currentChapterData.verses.forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Ayah ${v.verseNumber}`;
        elements.selects.verse.appendChild(opt);
    });
}

function populateReciterSelect() {
    elements.selects.reciter.innerHTML = '';
    Object.entries(RECITERS_CONFIG).forEach(([k, v]) => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = v.name;
        elements.selects.reciter.appendChild(opt);
    });
}

function populateTranslationAudioSelect() {
    elements.selects.transAudio.innerHTML = '';
    
    // 1. Add Existing MP3 configs (Static)
    Object.entries(TRANSLATION_AUDIO_CONFIG).forEach(([k, v]) => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = v.name;
        elements.selects.transAudio.appendChild(opt);
    });

    // 2. Add AI TTS options for languages NOT in static list
    // FILTERED: Only show languages supported by Puter
    Object.entries(TRANSLATIONS_CONFIG).forEach(([code, config]) => {
        // Skip if already has static audio
        if (TRANSLATION_AUDIO_CONFIG[code]) return;
        
        // Skip if NOT supported by Puter
        if (!TTS_LANGUAGE_MAP[code]) return;

        const opt = document.createElement('option');
        opt.value = `tts:${code}`; // Special prefix
        opt.textContent = `AI Voice: ${config.name.split('(')[0].trim()}`;
        elements.selects.transAudio.appendChild(opt);
    });
}

function populateTranslationSelect() {
    elements.selects.trans.innerHTML = '';
    Object.entries(TRANSLATIONS_CONFIG).forEach(([k, v]) => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = v.name;
        elements.selects.trans.appendChild(opt);
    });
}

function applyTranslationSettings(saved, urlParams) {
    const browserLang = navigator.language.split('-')[0];
    
    let trans = 'en';
    if (urlParams.has('trans')) trans = urlParams.get('trans');
    else if (saved.trans) trans = saved.trans;
    else if (TRANSLATIONS_CONFIG[browserLang]) trans = browserLang;
    
    if (!TRANSLATIONS_CONFIG[trans]) trans = 'en';
    elements.selects.trans.value = trans;

    if (urlParams.has('audio_trans')) {
        const param = urlParams.get('audio_trans');
        // Check if it's a valid config OR a tts: id
        if(TRANSLATION_AUDIO_CONFIG[param] || param.startsWith('tts:')) {
             elements.selects.transAudio.value = param;
        }
    } else if (saved.audio_trans && (TRANSLATION_AUDIO_CONFIG[saved.audio_trans] || saved.audio_trans.startsWith('tts:'))) {
        elements.selects.transAudio.value = saved.audio_trans;
    }
}

async function loadTranslationData(langCode) {
    if (translationCache[langCode]) return;

    const url = TRANSLATIONS_CONFIG[langCode].url;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Net");
        const str = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(str, "text/xml");
        
        const surahs = xmlDoc.getElementsByTagName('sura');
        translationCache[langCode] = {};

        for (let i = 0; i < surahs.length; i++) {
            const sIdx = parseInt(surahs[i].getAttribute('index')); // 1-based
            const verses = surahs[i].getElementsByTagName('aya');
            translationCache[langCode][sIdx] = {};
            
            for (let j = 0; j < verses.length; j++) {
                const vIdx = parseInt(verses[j].getAttribute('index')); // 1-based
                translationCache[langCode][sIdx][vIdx] = verses[j].getAttribute('text');
            }
        }
    } catch (error) {
        console.error("Trans Error:", error);
    }
}

// --- PLAYBACK LOGIC ---

async function loadVerse(autoPlay = true) {
    const chIdx = parseInt(elements.selects.chapter.value);
    const vIdx = parseInt(elements.selects.verse.value);
    
    const chapterNum = currentChapterData.chapterNumber;
    const verseNum = currentChapterData.verses[vIdx].verseNumber;

    // Save State
    saveState();

    // 1. Update Image
    const imgUrl = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/images/img/${chapterNum}_${verseNum}.png`;
    
    // Clear previous
    elements.verseText.innerHTML = '<div class="spinner" style="margin:2rem auto"></div>';
    
    const img = new Image();
    img.src = imgUrl;
    img.className = 'quran-img fade-in';
    img.onload = () => {
        elements.verseText.innerHTML = '';
        elements.verseText.appendChild(img);
        
        // Update Hero in background if visible? No, cinema mode is fullscreen-ish.
        // Actually, let's update the background layer for cool effect
        const heroImg = document.getElementById('door-hero-img');
        if (heroImg) heroImg.src = imgUrl;
    };
    img.onerror = () => {
        elements.verseText.textContent = "Image unavailable.";
    };

    // 2. Update Text Translation
    const transId = elements.selects.trans.value;
    if (!translationCache[transId]) {
        elements.transText.textContent = "Loading translation...";
        await loadTranslationData(transId);
    }
    
    if (translationCache[transId] && translationCache[transId][chapterNum]) {
        elements.transText.textContent = translationCache[transId][chapterNum][verseNum] || "Translation missing";
    } else {
         elements.transText.textContent = "Translation unavailable";
    }

    // 3. Audio Logic (Chain: Recitation -> Translation)
    const reciterId = elements.selects.reciter.value;
    const config = RECITERS_CONFIG[reciterId];
    
    const padCh = String(chapterNum).padStart(3, '0');
    const padV = String(verseNum).padStart(3, '0');
    
    const audioUrl = `https://everyayah.com/data/${config.path}/${padCh}${padV}.mp3`;
    
    elements.audio.src = audioUrl;
    
    elements.audio.onended = () => {
        playTranslationAudio(chapterNum, verseNum, true);
    };
    
    elements.audio.onerror = () => {
        console.error("Audio failed");
        playTranslationAudio(chapterNum, verseNum, true); // Skip to trans
    };

    if (autoPlay) {
        elements.audio.play().catch(e => console.log("Autoplay blocked", e));
    }
    
    // Preload Next
    preloadNext(chIdx, vIdx);
}

function preloadNext(chIdx, vIdx) {
    // Simple preload next image & audio
    let nextChIdx = chIdx;
    let nextVIdx = vIdx + 1;
    
    if (nextVIdx >= quranData[chIdx].verses.length) {
        nextChIdx = chIdx + 1;
        nextVIdx = 0;
    }
    
    if (nextChIdx >= quranData.length) return;
    
    const nextCh = quranData[nextChIdx].chapterNumber;
    const nextV = quranData[nextChIdx].verses[nextVIdx].verseNumber;
    
    const img = new Image();
    img.src = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/images/img/${nextCh}_${nextV}.png`;
    
    const rId = elements.selects.reciter.value;
    const qPath = RECITERS_CONFIG[rId].path;
    const padCh = String(nextCh).padStart(3, '0');
    const padV = String(nextV).padStart(3, '0');
    
    const aud = new Audio();
    aud.src = `https://everyayah.com/data/${qPath}/${padCh}${padV}.mp3`;
    aud.preload = 'auto';
    
    const taId = elements.selects.transAudio.value;
    if (taId !== 'none' && !taId.startsWith('tts:')) {
         const config = TRANSLATION_AUDIO_CONFIG[taId];
         let tUrl;
         if (config.path.startsWith('httpIA')) tUrl = `${config.path.replace('httpIA', 'https')}/${padCh}${padV}.mp3`;
         else if (config.path.startsWith('https://')) tUrl = `${config.path}/${padCh}${padV}.mp3`;
         
         if(tUrl) {
             const tAud = new Audio();
             tAud.src = tUrl;
             tAud.preload = 'auto';
         }
    }
}

async function playTranslationAudio(chapter, verse, autoContinue) {
    const type = elements.selects.transAudio.value;
    
    if (type === 'none') {
        if (autoContinue) nextVerse();
        return;
    }

    if (type.startsWith('tts:')) {
        // AI TTS Logic
        const langCode = type.split(':')[1];
        const text = elements.transText.textContent;
        await speakText(text, langCode, chapter, verse, autoContinue);
        return;
    }

    // Standard Static Audio
    const config = TRANSLATION_AUDIO_CONFIG[type];
    const padCh = String(chapter).padStart(3, '0');
    const padV = String(verse).padStart(3, '0');
    
    let url = "";
    if (config.path.startsWith('httpIA')) {
        // Archive.org fix
        url = `${config.path.replace('httpIA', 'https')}/${padCh}${padV}.mp3`;
    } else {
        url = `${config.path}/${padCh}${padV}.mp3`;
    }

    elements.transAudio.src = url;
    elements.transAudio.onended = () => { if(autoContinue) nextVerse(); };
    elements.transAudio.onerror = () => { 
        console.warn("Trans Audio Missing"); 
        if(autoContinue) nextVerse(); 
    };
    
    elements.transAudio.play().catch(e => {
        console.error("Trans AutoPlay block");
        if(autoContinue) nextVerse();
    });
}

function toggleBuffering(show) {
    isBuffering = show;
    // You could add a visual spinner overlay for TTS specifically if needed
    if(show) elements.verseText.style.opacity = 0.5;
    else elements.verseText.style.opacity = 1;
}

async function speakText(textToSpeak, langCode, ch, v, play) {
    // 1. Check Cache
    const cacheKey = `${langCode}_${ch}_${v}`;
    if (ttsCache[cacheKey]) {
        elements.transAudio.src = ttsCache[cacheKey];
        elements.transAudio.onended = () => { if(play) nextVerse(); };
        if(play) elements.transAudio.play();
        return;
    }

    try {
        if (typeof puter === 'undefined') {
            console.error("Puter.js not found. Make sure to include the script in your HTML.");
            return;
        }

        toggleBuffering(true);

        // Puter AI Text-to-Speech FIXED
        // Map generic code to supported Puter region code
        const ttsLang = TTS_LANGUAGE_MAP[langCode];

        if (!ttsLang) {
             console.error("Language not supported by Puter TTS:", langCode);
             if (play) nextVerse(); // Skip if not supported
             return;
        }

        const audioObj = await puter.ai.txt2speech(textToSpeak, ttsLang);
        const audioUrl = audioObj.src;
        
        ttsCache[cacheKey] = audioUrl; // Save to Cache
        
        elements.transAudio.src = audioUrl;
        elements.transAudio.onended = () => { if(play) nextVerse(); };
        
        if(play) elements.transAudio.play();

    } catch (e) {
        console.error("Puter AI TTS Error", e);
        // Fallback: Just skip
        if (play) nextVerse();
    } finally {
        toggleBuffering(false);
    }
}

function handleQuranEnd() {
    if (elements.transAudio.src && elements.transAudio.src !== window.location.href) {
        elements.transAudio.play().catch(() => nextVerse());
    } else {
        nextVerse();
    }
}

function nextVerse() {
    const totalV = elements.selects.verse.options.length;
    let cV = parseInt(elements.selects.verse.value);
    
    if (cV + 1 < totalV) {
        elements.selects.verse.value = cV + 1;
        loadVerse(true);
    } else {
        let cC = parseInt(elements.selects.chapter.value);
        if (cC + 1 < elements.selects.chapter.options.length) {
            elements.selects.chapter.value = cC + 1;
            populateVerseSelect(); // Load new verses
            elements.selects.verse.value = 0;
            loadVerse(true);
        } else {
            console.log("Quran Completed");
        }
    }
}

function prevVerse() {
    let cV = parseInt(elements.selects.verse.value);
    if (cV - 1 >= 0) {
        elements.selects.verse.value = cV - 1;
        loadVerse(true);
    } else {
        // Go back chapter
         let cC = parseInt(elements.selects.chapter.value);
         if (cC - 1 >= 0) {
             elements.selects.chapter.value = cC - 1;
             populateVerseSelect();
             // Select last verse
             elements.selects.verse.value = elements.selects.verse.options.length - 1;
             loadVerse(true);
         }
    }
}

function saveState() {
    const state = {
        chapter: parseInt(elements.selects.chapter.value),
        verse: parseInt(elements.selects.verse.value),
        reciter: elements.selects.reciter.value,
        trans: elements.selects.trans.value,
        audio_trans: elements.selects.transAudio.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', () => {
        elements.overlay.style.display = 'none';
        refreshDashboard();
    });

    elements.selects.chapter.addEventListener('change', () => {
        populateVerseSelect();
        saveState();
    });
    
    elements.selects.verse.addEventListener('change', () => {
        saveState();
        if (elements.views.cinema.classList.contains('active')) {
            loadVerse(true);
        }
    });
    
    elements.selects.reciter.addEventListener('change', () => {
        saveState();
        if (elements.views.cinema.classList.contains('active')) {
            loadVerse(true); // Reload audio
        }
    });

    elements.selects.trans.addEventListener('change', async () => {
        saveState();
        const tId = elements.selects.trans.value;
        if (!translationCache[tId]) {
            await loadTranslationData(tId);
        }
        if (elements.views.cinema.classList.contains('active')) {
            // update text
            const ch = currentChapterData.chapterNumber;
            const v = currentChapterData.verses[elements.selects.verse.value].verseNumber;
            elements.transText.textContent = translationCache[tId][ch][v];
        }
    });
    
    elements.selects.transAudio.addEventListener('change', () => {
        saveState();
    });

    // Keyboard Controls
    document.addEventListener('keydown', (e) => {
        if (!elements.views.cinema.classList.contains('active')) return;
        
        // Remote Control / Keyboard
        switch(e.key) {
            case 'ArrowRight':
                nextVerse();
                break;
            case 'ArrowLeft':
                prevVerse();
                break;
            case 'ArrowUp': // Back to dashboard
                switchView('dashboard');
                refreshDashboard();
                break;
            case 'MediaPlayPause':
            case ' ':
                if (elements.audio.paused) elements.audio.play();
                else elements.audio.pause();
                break;
        }
    });
    
    // UI Buttons
    document.getElementById('back-btn').onclick = () => {
        switchView('dashboard');
        refreshDashboard();
    };
    
    document.getElementById('prev-btn').onclick = prevVerse;
    document.getElementById('next-btn').onclick = nextVerse;
}

function initSidebarNavigation() {
    // Simple focus management for TV remote
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if(view === 'search') {
                openSearch();
            } else if(view === 'dashboard') {
                closeSearch();
                switchView('dashboard');
                refreshDashboard();
            }
        });
        
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') item.click();
        });
    });
}

// --- SEARCH LOGIC (AI POWERED) ---
let searchDebounceTimer;

function initSearchInterface() {
    renderKeyboard();
    
    // Results delegation
    elements.search.resultsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.surah-card');
        if(card) {
            const ch = parseInt(card.dataset.chapter);
            closeSearch();
            launchPlayer(ch, 1);
        }
    });
}

// index.js - OTT Optimized Search Logic
let searchGrid = []; // To store rows for index-based jumping
let currentKeyRow = 0;
let currentKeyCol = 0;

function renderKeyboard() {
    const grid = elements.search.keyboardGrid;
    grid.innerHTML = '';
    
    // Group keys into rows of 6 for predictable D-Pad movement
    const keysPerRow = 6;
    searchGrid = [];
    
    for (let i = 0; i < KEYBOARD_KEYS.length; i += keysPerRow) {
        searchGrid.push(KEYBOARD_KEYS.slice(i, i + keysPerRow));
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'key-row';
        
        KEYBOARD_KEYS.slice(i, i + keysPerRow).forEach(k => {
             const keyDiv = document.createElement('div');
             keyDiv.className = 'key';
             keyDiv.textContent = k;
             keyDiv.tabIndex = 0; // Focusable
             
             keyDiv.onclick = () => handleKeyInput(k);
             keyDiv.onkeydown = (e) => {
                 if(e.key === 'Enter') handleKeyInput(k);
             };
             
             rowDiv.appendChild(keyDiv);
        });
        grid.appendChild(rowDiv);
    }
}

function handleKeyInput(k) {
    if (k === 'DEL') {
        searchString = searchString.slice(0, -1);
    } else if (k === 'CLEAR') {
        searchString = "";
    } else if (k === 'SPACE') {
        searchString += " ";
    } else {
        searchString += k;
    }
    
    elements.search.inputDisplay.textContent = searchString;
    
    // Debounce Search Call
    if(searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(performAISearch, 1000);
}

async function performAISearch() {
    if (searchString.length < 3) return;
    
    const resultsContainer = elements.search.resultsGrid;
    resultsContainer.innerHTML = '<div class="spinner"></div>';
    
    try {
        if (typeof puter === 'undefined') {
            resultsContainer.innerHTML = 'AI Service Unavailable';
            return;
        }

        // Puter AI Call
        const prompt = `Identify relevant Quran Surah numbers (1-114) for the topic: "${searchString}". Return ONLY a JSON array of integers.`;
        
        const response = await puter.ai.chat(prompt);
        // Expecting: "[12, 53, 1]"
        let text = response.message.content.trim();
        
        // Clean markdown if any
        if (text.startsWith('```')) text = text.replace(/```json/g, '').replace(/```/g, '');
        
        // Parse
        // Result format might be text explaining it. We need to be robust.
        // Actually, let's just ask it to strictly return numbers.
        
        // Hacky parsing to find numbers in array
        const jsonMatch = text.match(/\[.*?\]/s);
        if (!jsonMatch) throw new Error("No JSON found");
        
        const chapterIds = JSON.parse(jsonMatch[0]);
        
        resultsContainer.innerHTML = '';
        
        if (!chapterIds || chapterIds.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No relevant Surahs found.</div>';
            return;
        }

        // Map AI results (Integers) to Metadata
        chapterIds.forEach(id => {
            const idx = parseInt(id) - 1;
            if (!SURAH_METADATA[idx]) return;
            const surah = SURAH_METADATA[idx];
            
            const card = document.createElement('div');
            card.className = 'surah-card';
            card.tabIndex = 0;
            
            // Highlight that this is an AI result
            card.style.borderColor = 'rgba(0, 255, 187, 0.3)'; 
            
            card.innerHTML = `
                <div class="card-bg-num">${surah.chapterNumber}</div>
                <div class="card-title">${surah.english_name}</div>
                <div class="card-sub">${surah.title || ''}</div>
            `;
            card.onclick = () => { closeSearch(); launchPlayer(surah.chapterNumber, 1); };
            card.onkeydown = (e) => { if(e.key === 'Enter') card.click(); };
            resultsContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        resultsContainer.innerHTML = '<div class="no-results">Search service unavailable.</div>';
    }
}

function openSearch() {
    elements.search.overlay.classList.add('active');
    searchString = "";
    elements.search.inputDisplay.textContent = "";
    elements.search.resultsGrid.innerHTML = '<div class="no-results">Use the keyboard to describe a topic...<br><span style="font-size:1.2rem;color:#444">(e.g. "Story of Joseph", "Laws of inheritance")</span></div>';
    
    setTimeout(() => {
        const firstKey = elements.search.keyboardGrid.querySelector('.key');
        if(firstKey) firstKey.focus();
    }, 100);
}

function closeSearch() {
    elements.search.overlay.classList.remove('active');
}