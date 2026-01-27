/**
 * TUWA - The Sacred Valley
 * Copyright (c) 2024-2026 Haykal M. Zaidi (d/b/a Tuwa Media).
 * * PROPRIETARY IDENTITY:
 * The name "Tuwa" and "Sacred Valley" are trademarks of Tuwa Media.
 * This code is licensed under MIT + Trademark Lock.
 */

document.addEventListener('error', function (event) {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'img') {
        target.style.display = 'none'; 
    }
}, true);

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
    { "chapter": 36, "english_name": "O Man", "description": "Known as the 'heart of the Quran', this Meccan Surah focuses on the Quran's divine source, the signs of nature, and the resurrection. (83 verses)" },
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
    { "chapter": 51, "english_name": "The Winnowing Winds", "description": "A Meccan chapter discussing the purpose of creating humans and Jinnâ€”solely to worship God. (60 verses)" },
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
    { "chapter": 96, "english_name": "The Clot", "description": "The first revelation received by the Prophet (Peace be upon him) in Mecca, commanding him to read in the name of his Lord. (19 verses)" },
    { "chapter": 97, "english_name": "The Power", "description": "A Meccan chapter describing the Night of Decree (Laylat al-Qadr), which is better than a thousand months. (5 verses)" },
    { "chapter": 98, "english_name": "The Clear Proof", "description": "A Medinan Surah distinguishing true believers from disbelievers among the People of the Book and polytheists. (8 verses)" },
    { "chapter": 99, "english_name": "The Earthquake", "description": "A Medinan chapter vividly describing the earth shaking on Judgment Day and yielding up its burdens and secrets. (8 verses)" },
    { "chapter": 100, "english_name": "The Courser", "description": "A Meccan Surah using the imagery of charging warhorses to describe the ungrateful nature of mankind. (11 verses)" },
    { "chapter": 101, "english_name": "The Calamity", "description": "A Meccan chapter depicting the Day of Judgment where people will be like scattered moths and mountains like wool. (11 verses)" },
    { "chapter": 102, "english_name": "The Rivalry in World Increase", "description": "A Meccan Surah warning that the obsession with accumulating more wealth and status distracts people until they reach the grave. (8 verses)" },
    { "chapter": 103, "english_name": "The Declining Day", "description": "A Meccan chapter summarizing that all mankind is in loss except those who believe, do good, and advise one another to truth and patience. (3 verses)" },
    { "chapter": 104, "english_name": "The Traducer", "description": "A Meccan Surah condemning the backbiter and the one who hoards wealth, warning of the crushing fire. (9 verses)" },
    { "chapter": 105, "english_name": "The Elephant", "description": "A Meccan chapter recalling the destruction of Abraha's army of elephants who attempted to destroy the Kaaba. (5 verses)" },
    { "chapter": 106, "english_name": "Quraysh", "description": "A Meccan Surah reminding the Quraysh tribe of God's protection and provision during their trading journeys. (4 verses)" },
    { "chapter": 107, "english_name": "The Small Kindnesses", "description": "A Meccan chapter condemning those who deny the judgment by mistreating orphans and performing prayers only to be seen. (7 verses)" },
    { "chapter": 108, "english_name": "The Abundance", "description": "The shortest Surah, revealed in Mecca, promising the Prophet (Peace be upon him) an abundance of good and the cutting off of his enemies. (3 verses)" },
    { "chapter": 109, "english_name": "The Disbelievers", "description": "A Meccan Surah declaring the absolute distinction between the worship of Muslims and the worship of polytheists. (6 verses)" },
    { "chapter": 110, "english_name": "The Divine Support", "description": "A Medinan chapter, one of the last revealed, predicting the mass entry of people into Islam and the Prophet's (Peace be upon him) passing. (3 verses)" },
    { "chapter": 111, "english_name": "The Palm Fiber", "description": "A Meccan Surah condemning Abu Lahab, an uncle and enemy of the Prophet (Peace be upon him), and his wife to the Fire. (5 verses)" },
    { "chapter": 112, "english_name": "The Sincerity", "description": "A Meccan chapter that is the essence of monotheism, declaring God is One, Eternal, with no offspring or equal. (4 verses)" },
    { "chapter": 113, "english_name": "The Daybreak", "description": "A Meccan Surah seeking refuge in the Lord of the dawn from the evil of created things and envy. (5 verses)" },
    { "chapter": 114, "english_name": "Mankind", "description": "A Meccan chapter seeking refuge in the Lord of mankind from the whispers of devils and men. (6 verses)" }
];


// --- 2. MULTI-PROFILE & LOGIC ---
const ACTIVE_PROFILE_ID = "1";
const STORAGE_KEY = `quranState_${ACTIVE_PROFILE_ID}`;

// [KEEP FULL CONFIG OBJECTS HERE]
const TRANSLATIONS_CONFIG = {
    'en': { name: 'English', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/en.xml' },
            'sq': { name: 'Albanian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sq.ahmeti.xml' },
            'ber': { name: 'Amazigh', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ber.mensur.xml' },
            'am': { name: 'Amharic', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/am.sadiq.xml' },
            'ar': { name: 'Arabic Tafsir', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ar.muyassar.xml' },
            'az': { name: 'Azerbaijani', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/az.musayev.xml' },
            'bn': { name: 'Bengali', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/bn.bengali.xml' },
            'bs': { name: 'Bosnian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/bs.korkut.xml' },
            'bg': { name: 'Bulgarian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/bg.theophanov.xml' },
            'zh': { name: 'Chinese', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/zh.jian.xml' },
            'cs': { name: 'Czech ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/cs.hrbek.xml' },
            'dv': { name: 'Divehi', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/dv.divehi.xml' },
            'nl': { name: 'Dutch ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/nl.siregar.xml' },
            'fr': { name: 'French ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/fr.hamidullah.xml' },
            'de': { name: 'German ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/de.bubenheim.xml' },
            'ha': { name: 'Hausa', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ha.gumi.xml' },
            'he': { name: 'Hebrew ENC', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/he.xml' },
            'hi': { name: 'Hindi', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/hi.hindi.xml' },
            'id': { name: 'Indonesian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/id.indonesian.xml' },
            'it': { name: 'Italian ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/it.piccardo.xml' },
            'ja': { name: 'Japanese', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ja.japanese.xml' },
            'ko': { name: 'Korean', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ko.korean.xml' },
            'ku': { name: 'Kurdish', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ku.asan.xml' },
            'ms': { name: 'Malay', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ms.basmeih.xml' },
            'ml': { name: 'Malayalam', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ml.abdulhameed.xml' },
            'no': { name: 'Norwegian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/no.berg.xml' },
            'ps': { name: 'Pashto', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ps.abdulwali.xml' },
            'fa': { name: 'Persian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/fa.khorramdel.xml' },
            'pl': { name: 'Polish ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/pl.bielawskiego.xml' },
            'pt': { name: 'Portuguese', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/pt.elhayek.xml' },
            'ro': { name: 'Romanian ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ro.grigore.xml' },
            'ru': { name: 'Russian ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ru.kuliev.xml' },
            'sd': { name: 'Sindhi ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sd.amroti.xml' },
            'so': { name: 'Somali ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/so.abduh.xml' },
            'es': { name: 'Spanish', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/es.garcia.xml' },
            'sw': { name: 'Swahili', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sw.barwani.xml' },
            'sv': { name: 'Swedish', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sv.bernstrom.xml' },
            'ta': { name: 'Tamil ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ta.tamil.xml' },
            'tt': { name: 'Tatar ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/tt.nugman.xml' },
            'th': { name: 'Thai', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/th.thai.xml' },
            'tr': { name: 'Turkish', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/tr.diyanet.xml' },
            'ur': { name: 'Urdu ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ur.junagarhi.xml' },
            'ug': { name: 'Uyghur', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ug.saleh.xml' },
            'uz': { name: 'Uzbek ', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/uz.sodik.xml' }
};

const RECITERS_CONFIG = {
    'alafasy': { name: 'Mishary Alafasy', path: 'Alafasy_128kbps' },
    'juhaynee': { name: 'Al Juhany', path: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps' },
    'sudais': { name: 'As Sudais', path: 'Abdurrahmaan_As-Sudais_192kbps' },
    'ghamadi': { name: 'Al Ghamdi', path: 'Ghamadi_40kbps' },
    'abbad': { name: 'Fares Abbad', path: 'Fares_Abbad_64kbps' },
    'muaiqly': { name: 'Al Muaiqly', path: 'MaherAlMuaiqly128kbps' },
    'shuraym': { name: 'Ash Shuraym', path: 'Saood_ash-Shuraym_128kbps' },
    'basit': { name: 'Abdul Basit', path: 'Abdul_Basit_Murattal_192kbps' },
    'ayyoub': { name: 'Muhammad Ayyoub', path: 'Muhammad_Ayyoub_128kbps' },
    'minshawy': { name: 'Minshawy', path: 'Minshawy_Murattal_128kbps' },
    'jaber': { name: 'Ali Jaber', path: 'Ali_Jaber_64kbps' },
    'ajamy': { name: 'Ahmed Ali Ajamy', path: 'ahmed_ibn_ali_al_ajamy_128kbps' },
};

const TRANSLATION_AUDIO_CONFIG = {
    'none': { name: 'No Audio Translation' }, // Will be replaced with translation
    'en_walk': { name: 'English', path: 'English/Sahih_Intnl_Ibrahim_Walk_192kbps' },
    'id_ministry': { name: 'Indonesian', path: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/audio/play/id' },
    'es': { name: 'Spanish', path: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/audio/play' }
};

const FTT_URL = 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/FTT.XML';
const RTL_CODES = new Set(['ar', 'dv', 'fa', 'he', 'ku', 'ps', 'sd', 'ur', 'ug']);

// Elements Reference
const elements = {
    overlay: document.getElementById('loading-overlay'),
    spinner: document.querySelector('.loader-spinner'),
    loaderText: document.getElementById('loader-text'),
    startBtn: document.getElementById('start-btn'),
    quranAudio: document.getElementById('audio-player'),
    transAudio: document.getElementById('translation-audio-player'),
    previewAudio: document.getElementById('preview-audio'),
    bufferInd: document.getElementById('buffering-indicator'),
    selects: {
        chapter: document.getElementById('chapterSelectWrapper'),
        verse: document.getElementById('verseSelectWrapper'),
        trans: document.getElementById('translationSelectWrapper'),
        reciter: document.getElementById('reciterSelectWrapper'),
        transAudio: document.getElementById('translationAudioSelectWrapper')
    },
    display: {
        title: document.getElementById('chapter-title'),
        verse: document.getElementById('verse-text'),
        verseNext: document.getElementById('verse-text-next'),
        trans: document.getElementById('translation-text'),
        container: document.getElementById('content-display')
    },
    views: {
        dashboard: document.getElementById('dashboard-view'),
        cinema: document.getElementById('cinema-view')
    },
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
let ttsCache = {}; 
let currentChapterData = {};
let inactivityTimer;
let forbiddenToTranslateSet = new Set();
let isBuffering = false;

let previewTimeout;
const PREVIEW_DELAY = 600; 
let previewSequence = []; 
let previewSeqIndex = 0;

let searchString = "";
const KEYBOARD_KEYS = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    '1','2','3','4','5','6','7','8','9','0','SPACE', 'DEL', 'CLEAR'
];

window.wipeUserData = function() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('quran_user_analytics');
    const msg = window.t ? window.t('errors.userDataWiped') : 'User data wiped.';
    alert(msg);
    location.reload();
};

// mode: 1 = Show All (Default), 0 = Hide Chapter and Reciter
function initCustomSelects(mode = 0) {

    // --- VISIBILITY TOGGLE ---
    // We toggle a class on the body. The CSS at the bottom of custom-select.css handles the hiding.
    if (mode === 0) {
        document.body.classList.add('simple-mode');
    } else {
        document.body.classList.remove('simple-mode');
    }
    // -------------------------

    document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); 
            e.preventDefault();

            // IDLE GUARD
            if (document.body.classList.contains('idle')) {
                document.body.classList.remove('idle');
                document.body.dispatchEvent(new Event('mousemove'));
                return;
            }

            const isOpen = wrapper.classList.contains('open');

            // Close others
            document.querySelectorAll('.custom-select-wrapper.open').forEach(other => {
                other.classList.remove('open');
            });
            
            // Toggle current
            if (!isOpen) {
                wrapper.classList.add('open');
                const selected = wrapper.querySelector('.custom-option.selected');
                if (selected) {
                    setTimeout(() => selected.scrollIntoView({ block: 'center' }), 10);
                } else {
                    const list = wrapper.querySelector('.custom-options');
                    if(list) list.scrollTop = 0;
                }
            } else {
                wrapper.classList.remove('open');
            }
        });
        
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                trigger.click();
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-wrapper')) {
            document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
                el.classList.remove('open');
            });
        }
    });
}

function populateCustomSelect(wrapper, items, onChange) {
    const optionsContainer = wrapper.querySelector('.custom-options');
    optionsContainer.innerHTML = '';
    
    const fragment = document.createDocumentFragment();

    items.forEach(item => {
        const opt = document.createElement('div');
        opt.className = 'custom-option';
        opt.dataset.value = item.value;
        opt.textContent = item.text;
        opt.tabIndex = 0; 

        const handleSelection = (e) => {
            e.preventDefault();
            e.stopPropagation(); 

            setSelectValue(wrapper, item.value); 
            wrapper.classList.remove('open'); 
            
            // FIX for "Open Back Loop":
            // Delay focusing the trigger so the 'Enter' keyup doesn't re-click it.
            setTimeout(() => {
                const trigger = wrapper.querySelector('.custom-select-trigger');
                if(trigger) trigger.focus();
            }, 100); 

            if (onChange) onChange(item.value);
        };

        opt.addEventListener('click', handleSelection);
        opt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSelection(e);
            }
        });

        fragment.appendChild(opt);
    });

    optionsContainer.appendChild(fragment);
}

function setSelectValue(wrapper, value) {
    const options = wrapper.querySelectorAll('.custom-option');
    let foundText = null;

    options.forEach(opt => {
        if (opt.dataset.value == value) {
            opt.classList.add('selected');
            foundText = opt.textContent;
        } else {
            opt.classList.remove('selected');
        }
    });

    if (foundText) {
        wrapper.dataset.value = value;
        const trigger = wrapper.querySelector('.custom-select-trigger');
        if(trigger) trigger.textContent = foundText;
    }
}

function getSelectValue(wrapper) {
    return wrapper.dataset.value;
}

// --- CORE APP ---

/**
 * STREAM ID LOGIC
 * Compresses parameters into a single Base64 URL-safe string.
 * Format: Chapter|Verse|Reciter|Translation|AudioTranslation
 */
function encodeStream(ch, v, rec, trans, aud) {
    try {
        const raw = `${ch}|${v}|${rec}|${trans}|${aud}`;
        // Encode to Base64 and make it URL safe (replace +, /, =)
        return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
        console.error("Encoding failed", e);
        return null;
    }
}

function decodeStream(token) {
    try {
        // Revert URL safety
        let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with '=' if needed
        while (base64.length % 4) base64 += '=';
        const raw = atob(base64);
        const parts = raw.split('|');
        
        if (parts.length < 5) return null;

        return {
            chapter: parseInt(parts[0]),
            verse: parseInt(parts[1]),
            reciter: parts[2],
            trans: parts[3],
            audio_trans: parts[4]
        };
    } catch (e) {
        console.error("Decoding failed", e);
        return null;
    }
}

function mergeMetadata(apiChapters) {
    return apiChapters.map((ch, idx) => {
        const meta = SURAH_METADATA.find(m => m.chapter === ch.chapterNumber);
        if (meta) {
            return { ...ch, english_name: meta.english_name, description: meta.description };
        }
        return ch;
    });
}

function switchView(viewName) {
    if(viewName === 'cinema') {
        elements.views.dashboard.classList.remove('active');
        elements.views.cinema.classList.add('active');
        elements.views.cinema.style.opacity = '1';
        stopPreview();
        elements.sidebar.container.style.display = 'none';
        
        setTimeout(() => {
            const chapterTrigger = elements.selects.chapter.querySelector('.custom-select-trigger');
            if(chapterTrigger) chapterTrigger.focus();
        }, 150);
    } else {
        elements.views.cinema.classList.remove('active');
        elements.views.cinema.style.opacity = '0';
        elements.views.dashboard.classList.add('active');
        elements.sidebar.container.style.display = 'none';
        elements.quranAudio.pause();
        elements.transAudio.pause();
        refreshDashboard();
        document.getElementById('door-play-btn').focus();
    }
}

window.addEventListener('popstate', (event) => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('chapter') || params.has('stream')) {
        switchView('cinema');
        restoreState();
        loadVerse(false);
    } else {
        switchView('dashboard');
    }
});

async function initializeApp() {
    try {
        initCustomSelects();

        const jsonResponse = await fetch('https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/2TM3TM.json');
        if (!jsonResponse.ok) throw new Error("Failed to load Quran JSON");
        const jsonData = await jsonResponse.json();
        quranData = mergeMetadata(jsonData.chapters);

        try {
            const fttResp = await fetch(FTT_URL);
            if (fttResp.ok) {
                const fttText = await fttResp.text();
                const fttDoc = new DOMParser().parseFromString(fttText, 'application/xml');
                fttDoc.querySelectorAll('Verse').forEach(v => {
                    const c = v.getAttribute('chapter')?.trim();
                    const n = v.getAttribute('number')?.trim();
                    if(c && n) forbiddenToTranslateSet.add(`${c}-${n}`);
                });
            }
        } catch (e) { console.warn("FTT load failed", e); }

        populateChapterSelect();
        populateReciterSelect();
        populateTranslationSelectOptions();
        populateTranslationAudioSelect();

        // --- FIX: Always restore state to set defaults based on browser ---
        // This ensures that when dashboard loads, the hidden dropdowns 
        // already have the correct "First Time" defaults.
        restoreState();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('chapter') || urlParams.has('stream')) {
            switchView('cinema');
            // restoreState called above already
            populateVerseSelect(); 
            
            const savedVerse = getSavedVerseIndex();
            setSelectValue(elements.selects.verse, savedVerse);

            const activeTransId = getSelectValue(elements.selects.trans);
            await loadTranslationData(activeTransId);
            loadVerse(false); 
            
            elements.spinner.style.display = 'none';
            elements.loaderText.style.display = 'none';
            elements.startBtn.style.display = 'block';
            elements.startBtn.textContent = window.t ? window.t('player.continue') : "Continue";
            elements.startBtn.focus();
        } else {
            switchView('dashboard');
            refreshDashboard();
            elements.overlay.style.display = 'none';
        }

        setupEventListeners();
        initSidebarNavigation();
        initSearchInterface();

    } catch (error) {
        console.error("Critical Init Error:", error);
        elements.loaderText.textContent = window.t ? window.t('errors.loadError') : "Error loading content. Please check connection.";
    }
}

// --- UPDATED: DASHBOARD LOGIC (SINGLE FISH MODE & INFINITE SCROLL) ---
function refreshDashboard() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const heroBtn = document.getElementById('door-play-btn');

    // 1. Get all lists like before
    const allIndices = Array.from({length: 114}, (_, i) => i);
    const shortRowIndices = allIndices.slice(77, 114);
    const trendingIndices = [36, 67, 18, 55, 1, 112, 113, 114].map(id => id - 1);

    // 2. COMBINE into one massive list for "Single Fish"
    // This merges trending, short, and all into ONE scrolling row
    const combinedIndices = [...trendingIndices, ...shortRowIndices, ...allIndices];

    // 3. Populate ONLY the 'all-row' container (Single Fish requirement)
    fillRow('all-row', combinedIndices);

    // Note: We deliberately do NOT populate 'trending-row' or 'short-row' anymore
    // because index.css hides them, and Single Fish means one continuous loop.

    if(saved.chapter !== undefined && quranData[saved.chapter]) {
        const chNum = quranData[saved.chapter].chapterNumber;
        const vNum = (saved.verse || 0) + 1;
        const reciter = saved.reciter || 'alafasy';
        updateHeroPreview(chNum, vNum, reciter, false);
        heroBtn.onclick = () => launchPlayer(chNum, vNum);
    } else {
        updateHeroPreview(1, 1, 'alafasy', false);
        heroBtn.onclick = () => launchPlayer(1, 1);
    }
}

function fillRow(elementId, indexArray) {
    const container = document.getElementById(elementId);
    if(!container) return; // Safety check
    
    const fragment = document.createDocumentFragment();
    
    indexArray.forEach(idx => {
        if(!quranData[idx]) return;
        const surah = quranData[idx];
        const card = document.createElement('div');
        card.className = 'surah-card';
        card.tabIndex = 0;
        
        // --- Translation Title Logic ---
        let cardTitle = surah.english_name;
        if (window.t) {
            const translatedKey = 'surahNames.' + surah.english_name;
            const translatedName = window.t(translatedKey);
            if (translatedName && translatedName !== translatedKey) {
                cardTitle = translatedName;
            }
        }
        
        card.innerHTML = `
            <div class="card-bg-num">${surah.chapterNumber}</div>
            <div class="card-title">${cardTitle}</div>
            <div class="card-sub">${surah.title || ''}</div>
        `;
        card.onclick = () => launchPlayer(surah.chapterNumber, 1);
        card.onfocus = () => { schedulePreview(surah.chapterNumber); };
        fragment.appendChild(card);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);

    // --- ENABLE INFINITE SCROLL & DRIFT FOCUS ---
    initInfiniteRowNavigation(container);
}

// --- NEW FUNCTION: The Drifting & Looping Logic ---
function initInfiniteRowNavigation(container) {
    if (container.dataset.navAttached) return;
    container.dataset.navAttached = "true";

    container.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

        const cards = Array.from(container.querySelectorAll('.surah-card'));
        if (cards.length === 0) return;

        const current = document.activeElement;
        const currentIndex = cards.indexOf(current);
        
        // Only loop if focus is actually inside this row
        if (currentIndex === -1) return;

        e.preventDefault(); // Stop default scroll to prevent lag

        let nextIndex;
        // Infinite Logic
        if (e.key === 'ArrowRight') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= cards.length) nextIndex = 0; // Loop Start
        } else if (e.key === 'ArrowLeft') {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = cards.length - 1; // Loop End
        }

        const nextCard = cards[nextIndex];
        
        if (nextCard) {
            // Force focus immediately (Fixes "Drift Focus" issue)
            nextCard.focus({ preventScroll: true }); 

            // Handle smooth vs instant camera (Instant for rapid key holds)
            const scrollBehavior = e.repeat ? 'auto' : 'smooth';
            
            nextCard.scrollIntoView({
                behavior: scrollBehavior,
                inline: 'center',
                block: 'nearest'
            });
        }
    });
}

function schedulePreview(chapterNum) {
    if (previewTimeout) clearTimeout(previewTimeout);
    stopPreview();
    const surah = quranData[chapterNum - 1];
    
    // --- START FIX: Universal Translation Logic ---
    let heroTitle = surah.english_name;
    if (window.t) {
        const translatedName = window.t(`surahNames.${surah.english_name}`);
        if (translatedName && translatedName !== `surahNames.${surah.english_name}`) {
            heroTitle = translatedName;
        }
    }
    // --- END FIX ---
    
    const doorz = document.getElementById('doorz-hero-title');
    if(doorz) {
        // [IMPORTANT FIX] Remove data-i18n so the translation loader doesn't overwrite this later
        doorz.removeAttribute('data-i18n'); 
        doorz.textContent = heroTitle;
    }
    
    const doorHero = document.getElementById('door-hero-title');
    if (doorHero) {
        doorHero.textContent = heroTitle;
    }

    document.getElementById('door-hero-subtitle').textContent = surah.title;
    document.getElementById('door-play-btn').onclick = () => launchPlayer(chapterNum, 1);

    previewTimeout = setTimeout(() => {
        updateHeroPreview(chapterNum, 1, 'alafasy', true); 
    }, PREVIEW_DELAY);
}
function stopPreview() {
    elements.previewAudio.pause();
    elements.previewAudio.onended = null;
    elements.subtitle.classList.remove('active');
    clearTimeout(previewTimeout);
    previewSequence = [];
}

async function updateHeroPreview(chapterNum, startVerse, reciterId, autoPlay) {
    previewSequence = [];
    previewSeqIndex = 0;
    
    const chIdx = chapterNum - 1;
    if (!quranData[chIdx]) return;
    
    const totalVerses = quranData[chIdx].verses.length;
    for (let i = 1; i <= totalVerses; i++) {
        previewSequence.push(i);
    }

    const verseNum = previewSequence[0];
    const imgUrl = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/images/img/${chapterNum}_${verseNum}.png`;
    
    const tempImg = new Image();
    tempImg.src = imgUrl;
    tempImg.onload = () => {
        const heroImg = document.getElementById('door-hero-img');
        if (heroImg) heroImg.src = imgUrl;
    };

    const transId = getSelectValue(elements.selects.trans) || 'en';
    if (!translationCache[transId]) {
        await loadTranslationData(transId);
    }

    if (autoPlay) {
        playPreviewStep(chapterNum, reciterId);
    }
}

function playPreviewStep(chapterNum, reciterId) {
    if (previewSeqIndex >= previewSequence.length) return;
    const verseNum = previewSequence[previewSeqIndex];
    const padCh = String(chapterNum).padStart(3, '0');
    const padV = String(verseNum).padStart(3, '0');
    
    const imgLayer = document.getElementById('hero-preview-layer');
    const previewImg = document.getElementById('preview-img');
    const newSrc = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/images/img/${chapterNum}_${verseNum}.png`;

    previewImg.style.opacity = 0;
    setTimeout(() => {
        previewImg.src = newSrc;
        previewImg.onload = () => {
            previewImg.style.opacity = 0.6;
            imgLayer.classList.add('active');
        };
    }, 200);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const transId = saved.trans || 'en';
    const cache = translationCache[transId];
    if(cache) {
        const sura = cache.querySelector(`sura[index="${chapterNum}"]`);
        const aya = sura ? sura.querySelector(`aya[index="${verseNum}"]`) : null;
        const text = aya ? aya.getAttribute('text') : "";
        if(text) {
            elements.subtitle.textContent = text;
            elements.subtitle.classList.add('active');
            if (RTL_CODES.has(transId)) elements.subtitle.dir = 'rtl';
            else elements.subtitle.dir = 'ltr';
        }
    } else {
        elements.subtitle.classList.remove('active');
    }

    const rPath = RECITERS_CONFIG[reciterId]?.path || RECITERS_CONFIG['alafasy'].path;
    const audioUrl = `https://everyayah.com/data/${rPath}/${padCh}${padV}.mp3`;
    elements.previewAudio.src = audioUrl;
    elements.previewAudio.volume = 0.6;
    elements.previewAudio.onended = () => {
        previewSeqIndex++;
        playPreviewStep(chapterNum, reciterId);
    };
    elements.previewAudio.play().catch(e => console.log("Autoplay blocked"));
}

function launchPlayer(chapterNum, verseNum = 1) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const browserLang = navigator.language.split('-')[0];

    // 1. Determine Settings
    let currentReciter = getSelectValue(elements.selects.reciter) || saved.reciter || 'alafasy';
    
    let currentTrans = getSelectValue(elements.selects.trans) || saved.trans || browserLang;
    if (!TRANSLATIONS_CONFIG[currentTrans]) currentTrans = 'en';

    let currentAudioTrans = getSelectValue(elements.selects.transAudio);
    
    if (!currentAudioTrans || currentAudioTrans === 'none') {
        if (saved.audio_trans && saved.audio_trans !== 'none') {
            currentAudioTrans = saved.audio_trans;
        } else {
            const findAudioForLang = (lang) => {
                if (TRANSLATION_AUDIO_CONFIG[lang]) return lang;
                const match = Object.keys(TRANSLATION_AUDIO_CONFIG).find(k => k.startsWith(lang + '_'));
                return match || null;
            };
            const detectedAudio = findAudioForLang(browserLang);
            currentAudioTrans = detectedAudio ? detectedAudio : 'none';
        }
    }

    // 2. GENERATE STREAM URL
    const streamToken = encodeStream(chapterNum, verseNum, currentReciter, currentTrans, currentAudioTrans);
    
    // 3. FORCE PAGE RELOAD WITH STREAM PARAM
    const newUrl = `?stream=${streamToken}`;
    window.location.assign(newUrl);
}

// --- PLAYER HELPERS ---
async function loadTranslationData(id) {
    if (translationCache[id]) return; 
    if (!TRANSLATIONS_CONFIG[id]) return;
    try {
        toggleBuffering(true);
        const res = await fetch(TRANSLATIONS_CONFIG[id].url);
        if (res.ok) {
            const txt = await res.text();
            translationCache[id] = new DOMParser().parseFromString(txt, 'application/xml');
        }
    } catch (e) {
        console.error("Failed to load translation:", id);
    } finally {
        toggleBuffering(false);
    }
}

function restoreState() {
    const urlParams = new URLSearchParams(window.location.search);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const browserLang = navigator.language.split('-')[0];

    // --- DECODE STREAM IF PRESENT ---
    let streamData = null;
    if (urlParams.has('stream')) {
        streamData = decodeStream(urlParams.get('stream'));
    }

    // --- 1. Chapter ---
    let ch = 0;
    if (streamData) {
        ch = streamData.chapter - 1; // Stream has 1-based, app uses 0-based index
    } else if (urlParams.has('chapter')) {
        ch = parseInt(urlParams.get('chapter')) - 1; 
    } else if (saved.chapter !== undefined) {
        ch = saved.chapter;
    }
    // Safety check
    if (isNaN(ch) || ch < 0) ch = 0;
    setSelectValue(elements.selects.chapter, ch);

    // --- 2. Reciter ---
    let rec = 'alafasy';
    if (streamData && RECITERS_CONFIG[streamData.reciter]) {
        rec = streamData.reciter;
    } else if (urlParams.has('reciter') && RECITERS_CONFIG[urlParams.get('reciter')]) {
        rec = urlParams.get('reciter');
    } else if (saved.reciter) {
        rec = saved.reciter;
    }
    setSelectValue(elements.selects.reciter, rec);

    // --- 3. Translation Text ---
    let trans = 'en';
    if (streamData) {
        trans = streamData.trans;
    } else if (urlParams.has('trans')) {
        trans = urlParams.get('trans');
    } else if (saved.trans) {
        trans = saved.trans;
    } else if (TRANSLATIONS_CONFIG[browserLang]) {
        trans = browserLang; 
    }
    if (!TRANSLATIONS_CONFIG[trans]) trans = 'en';
    setSelectValue(elements.selects.trans, trans);

    // --- 4. Audio Translation ---
    let transAudio = 'none';
    
    // Helper to auto-detect
    const findAudioForLang = (lang) => {
        if (TRANSLATION_AUDIO_CONFIG[lang]) return lang;
        const match = Object.keys(TRANSLATION_AUDIO_CONFIG).find(k => k.startsWith(lang + '_'));
        return match || null;
    };

    if (streamData) {
        transAudio = streamData.audio_trans;
    } else if (urlParams.has('audio_trans')) {
        const param = urlParams.get('audio_trans');
        if(TRANSLATION_AUDIO_CONFIG[param] || param.startsWith('tts:')) {
            transAudio = param;
        }
    } else if (saved.audio_trans) {
        if (TRANSLATION_AUDIO_CONFIG[saved.audio_trans] || saved.audio_trans.startsWith('tts:')) {
            transAudio = saved.audio_trans;
        }
    } else {
        const detectedAudio = findAudioForLang(browserLang);
        if (detectedAudio) transAudio = detectedAudio;
    }
    
    setSelectValue(elements.selects.transAudio, transAudio);
}

function getSavedVerseIndex() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check Stream First
    if (urlParams.has('stream')) {
        const data = decodeStream(urlParams.get('stream'));
        if (data) return data.verse - 1; // Return 0-based index
    }

    // Legacy / Fallback
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (urlParams.has('verse')) return parseInt(urlParams.get('verse')) - 1;
    if (saved.verse !== undefined) return saved.verse;
    return 0;
}

function saveState() {
    const state = {
        chapter: parseInt(getSelectValue(elements.selects.chapter)),
        verse: parseInt(getSelectValue(elements.selects.verse)),
        reciter: getSelectValue(elements.selects.reciter),
        trans: getSelectValue(elements.selects.trans),
        audio_trans: getSelectValue(elements.selects.transAudio)
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const chObj = quranData[state.chapter];
    const chNum = chObj.chapterNumber;
    const vNum = chObj.verses[state.verse].verseNumber;
    
    // Generate Stream Token
    const streamToken = encodeStream(chNum, vNum, state.reciter, state.trans, state.audio_trans);
    const newUrl = `?stream=${streamToken}`;

    // Update URL bar without reloading
    window.history.replaceState({path: newUrl, view: 'cinema'}, '', newUrl);

    // Update Canonical
    const canonicalLink = document.getElementById('dynamic-canonical');
    const fullUrl = `https://Quran-lite.pages.dev/reading/${newUrl}`;
    if (canonicalLink) canonicalLink.href = fullUrl;

    const observer = new MutationObserver((mutations, obs) => {
        const h1 = document.querySelector('h1');
        if (h1) {
            const recordedH1 = h1.innerText;
            document.title = `${chObj.title} - ${recordedH1} | Tuwa`;
            obs.disconnect(); 
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function populateChapterSelect() {
    // We removed the "currentLocale" check here
    const suraNameLabel = window.t ? window.t('player.suraName') : 'Sura name';
    
    const items = quranData.map((c, i) => {
        // --- START FIX ---
        let title = c.english_name;
        
        if (window.t) {
            const translatedKey = 'surahNames.' + c.english_name;
            const translatedName = window.t(translatedKey);
            
            // If translation exists in ANY language, use it
            if (translatedName && translatedName !== translatedKey) {
                title = translatedName;
            }
        }
        // --- END FIX ---
        
        // This will now show "1. La Apertura" instead of "1. The Opening"
        return {
            value: i,
            text: `${c.chapterNumber}. ${title} - ${c.title || ''}`
        };
    });
    
    populateCustomSelect(elements.selects.chapter, items, (val) => {
        populateVerseSelect(); 
        loadVerse(true);
    });
}

function populateVerseSelect() {
    const chIdx = getSelectValue(elements.selects.chapter) || 0;
    currentChapterData = quranData[chIdx];
    
    const items = currentChapterData.verses.map((v, i) => ({
        value: i,
        text: `${v.verseNumber}`
    }));

    populateCustomSelect(elements.selects.verse, items, (val) => {
        loadVerse(true);
    });
}

function populateReciterSelect() {
    const items = Object.entries(RECITERS_CONFIG).map(([k, v]) => ({
        value: k,
        text: v.name
    }));
    populateCustomSelect(elements.selects.reciter, items, (val) => {
        saveState();
        loadVerse(true);
    });
}

function populateTranslationAudioSelect() {
    // Get translated name for 'none' option
    let noneName = 'No Audio Translation';
    if (window.t) {
        noneName = window.t('player.noAudioTranslation');
    }
    
    const items = Object.entries(TRANSLATION_AUDIO_CONFIG).map(([k, v]) => {
        // Use translation for 'none' option
        const displayName = (k === 'none') ? noneName : v.name;
        return {
            value: k,
            text: displayName
        };
    });
    populateCustomSelect(elements.selects.transAudio, items, (val) => {
        const chIdx = getSelectValue(elements.selects.chapter);
        const vIdx = getSelectValue(elements.selects.verse);
        const ch = quranData[chIdx].chapterNumber;
        const v = quranData[chIdx].verses[vIdx].verseNumber;
        
        if (!elements.quranAudio.paused) {
            updateTranslationAudio(ch, v, false);
        } else if (!elements.transAudio.paused) {
            updateTranslationAudio(ch, v, true);
        } else {
            updateTranslationAudio(ch, v, false);
        }
        saveState();
    });
}

function populateTranslationSelectOptions() {
    const items = Object.entries(TRANSLATIONS_CONFIG).map(([id, config]) => ({
        value: id,
        text: config.name
    }));
    populateCustomSelect(elements.selects.trans, items, async (val) => {
        const activeTransId = val;
        await loadTranslationData(activeTransId); 
        
        const chIdx = getSelectValue(elements.selects.chapter);
        const vIdx = getSelectValue(elements.selects.verse);
        const ch = quranData[chIdx].chapterNumber;
        const v = quranData[chIdx].verses[vIdx].verseNumber;
        updateTranslationText(ch, v);
        saveState();
    });
}

function toggleBuffering(show) {
    isBuffering = show;
    elements.bufferInd.style.display = show ? 'block' : 'none';
}

async function loadVerse(autoplay = true) {
    const chIdx = getSelectValue(elements.selects.chapter);
    const vIdx = getSelectValue(elements.selects.verse);
    
    currentChapterData = quranData[chIdx];

    // --- FIX START: FORCE UPDATE SPLASH TITLE ---
    const splashTitle = document.getElementById('doorz-hero-title');
    if (splashTitle) {
        // 1. Start with the default English name from metadata
        let displayTitle = currentChapterData.english_name;
        
        // 2. If translation system is ready, try to find the translated name
        if (window.t) {
            // Check for key format: "surahNames.The Opening"
            const translatedKey = 'surahNames.' + displayTitle;
            const translatedName = window.t(translatedKey);
            
            // Only use the result if it's not just returning the key itself
            if (translatedName && translatedName !== translatedKey) {
                displayTitle = translatedName;
            }
        }
        
        // 3. Force the text content
        splashTitle.textContent = displayTitle;
    }
    // --- FIX END ---

    const verseData = currentChapterData.verses[vIdx];

    const chNum = currentChapterData.chapterNumber;

    const vNum = verseData.verseNumber;
    const verseKey = `${chNum}-${vNum}`;
    const isForbidden = forbiddenToTranslateSet.has(verseKey);

    elements.display.title.innerHTML = `${currentChapterData.title} <span class="chapter-subtitle">(${chNum}:${vNum})</span>`;
    
    const newSrc = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/images/img/${chNum}_${vNum}.png`;
    const img1 = elements.display.verse;
    const img2 = elements.display.verseNext;

    let imgReady = false;
    if(img1.src === newSrc || img2.src === newSrc) imgReady = true;

    const isImg1Active = img1.classList.contains('active-verse-img');
    const activeImg = isImg1Active ? img1 : img2;
    const nextImg = isImg1Active ? img2 : img1;

    if(!imgReady && autoplay) toggleBuffering(true);

    nextImg.src = newSrc;
    nextImg.onload = () => {
        activeImg.classList.remove('active-verse-img');
        nextImg.classList.add('active-verse-img');
        toggleBuffering(false); 
    };
    
    if (nextImg.complete && nextImg.naturalHeight !== 0) {
        activeImg.classList.remove('active-verse-img');
        nextImg.classList.add('active-verse-img');
        toggleBuffering(false);
    }

    const tid = getSelectValue(elements.selects.trans);
    if(!translationCache[tid]) {
        await loadTranslationData(tid);
    }

    if (isForbidden) {
        elements.display.trans.textContent = '';
    } else {
        updateTranslationText(chNum, vNum);
    }

    updateQuranAudio(chNum, vNum, autoplay);
    
    if (isForbidden) {
        elements.transAudio.src = '';
    } else {
        updateTranslationAudio(chNum, vNum, false);
    }

    saveState(); 
    updateMediaSession(currentChapterData.title, vNum, RECITERS_CONFIG[getSelectValue(elements.selects.reciter)].name);
    bufferNextResources(chIdx, parseInt(vIdx));
}

function bufferNextResources(currentChIdx, currentVIdx) {
    let nextChIdx = parseInt(currentChIdx);
    let nextVIdx = currentVIdx + 1;
    
    if (nextVIdx >= quranData[nextChIdx].verses.length) {
        nextChIdx = nextChIdx + 1;
        nextVIdx = 0;
    }

    if (nextChIdx >= quranData.length) return; 

    const nextCh = quranData[nextChIdx].chapterNumber;
    const nextV = quranData[nextChIdx].verses[nextVIdx].verseNumber;

    const img = new Image();
    img.src = `https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/images/img/${nextCh}_${nextV}.png`;

    const rId = getSelectValue(elements.selects.reciter);
    const qPath = RECITERS_CONFIG[rId].path;
    const padCh = String(nextCh).padStart(3, '0');
    const padV = String(nextV).padStart(3, '0');
    const aud = new Audio();
    aud.src = `https://everyayah.com/data/${qPath}/${padCh}${padV}.mp3`;
    aud.preload = 'auto'; 
}

function updateTranslationText(chNum, vNum) {
    const tid = getSelectValue(elements.selects.trans);
    if (!translationCache[tid]) return;
    
    if (RTL_CODES.has(tid)) elements.display.trans.dir = 'rtl';
    else elements.display.trans.dir = 'ltr';

    const sura = translationCache[tid].querySelector(`sura[index="${chNum}"]`);
    const aya = sura ? sura.querySelector(`aya[index="${vNum}"]`) : null;
    const unavailableText = window.t ? window.t('errors.translationUnavailable') : "Translation unavailable";
    elements.display.trans.textContent = aya ? aya.getAttribute('text') : unavailableText;
    adjustFontSize();
}

function updateQuranAudio(chNum, vNum, play) {
    const rId = getSelectValue(elements.selects.reciter);
    const path = RECITERS_CONFIG[rId].path;
    const padCh = String(chNum).padStart(3, '0');
    const padV = String(vNum).padStart(3, '0');
    
    elements.quranAudio.src = `https://everyayah.com/data/${path}/${padCh}${padV}.mp3`;
    if(play) elements.quranAudio.play().catch(e => console.log("Waiting for user interaction"));
}

async function updateTranslationAudio(chNum, vNum, play) {
    const taId = getSelectValue(elements.selects.transAudio);
    
    if (taId === 'none') {
        elements.transAudio.src = '';
        return;
    }
    
    if (!taId.startsWith('tts:')) {
        const config = TRANSLATION_AUDIO_CONFIG[taId];
        const padCh = String(chNum).padStart(3, '0');
        const padV = String(vNum).padStart(3, '0');
        
        let url;
        if (config.path.startsWith('httpIA')) url = `${config.path.replace('httpIA', 'https')}/${padCh}${padV}.mp3`;
        else if (config.path.startsWith('http')) url = `${config.path}/${padCh}${padV}.mp3`;
        else url = `https://everyayah.com/data/${config.path}/${padCh}${padV}.mp3`;

        if(!url.endsWith('.mp3')) url += `/${padCh}${padV}.mp3`;
        elements.transAudio.src = url;
        if(play) elements.transAudio.play();
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
    const verseWrapper = elements.selects.verse;
    const totalV = verseWrapper.querySelectorAll('.custom-option').length;
    let cV = parseInt(getSelectValue(verseWrapper));
    
    if (cV + 1 < totalV) {
        setSelectValue(verseWrapper, cV + 1);
        loadVerse(true);
    } else {
        const chapterWrapper = elements.selects.chapter;
        let cC = parseInt(getSelectValue(chapterWrapper));
        const totalC = chapterWrapper.querySelectorAll('.custom-option').length;
        
        if (cC + 1 < totalC) {
            setSelectValue(chapterWrapper, cC + 1);
            populateVerseSelect();
            setSelectValue(verseWrapper, 0); 
            loadVerse(true);
        }
    }
}

function adjustFontSize() {
    const el = elements.display.trans;
    if (window.innerWidth <= 768) return; 

    el.style.fontSize = '3.5rem';
    let iter = 0;
    while (el.scrollHeight > el.clientHeight && iter < 50) {
        let size = parseFloat(window.getComputedStyle(el).fontSize);
        if (size <= 16) break;
        el.style.fontSize = (size - 1) + 'px';
        iter++;
    }
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', () => {
        elements.overlay.style.opacity = 0;
        setTimeout(() => elements.overlay.style.display = 'none', 500);
        loadVerse(true); 
    });

    elements.quranAudio.addEventListener('ended', handleQuranEnd);
    elements.transAudio.addEventListener('ended', nextVerse);

    ['mousemove', 'touchstart', 'click', 'keydown'].forEach(e => 
        window.addEventListener(e, () => {
            document.body.classList.remove('idle');
            clearTimeout(inactivityTimer);
            
            inactivityTimer = setTimeout(() => {
                if (!document.querySelector('.custom-select-wrapper.open')) {
                    document.body.classList.add('idle');
                }
            }, 4000);
        })
    );

    window.addEventListener('resize', () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
        adjustFontSize();
    });
}

let currentSurahTitle = ""; // Variable to store the last updated Surah

function updateMediaSession(surah, verse, artist) {
    if ('mediaSession' in navigator) {
        // Pre-check: Only proceed if the Surah has actually changed
        if (surah === currentSurahTitle) {
            return; 
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${surah}`,
            artist: artist,
            album: `The Clear Book`,
            artwork: [{ src: 'https://Quran-lite.pages.dev/social-preview.jpg', sizes: '512x512', type: 'image/jpeg' }]
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            // Your next track logic here
        });

        // Update the gatekeeper variable
        currentSurahTitle = surah;
    }
}

function initSearchInterface() {
    renderKeyboard();
    elements.search.resultsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.surah-card');
        if(card) {
            const ch = parseInt(card.dataset.chapter);
            closeSearch();
            launchPlayer(ch, 1);
        }
    });
}

function renderKeyboard() {
    const grid = elements.search.keyboardGrid;
    grid.innerHTML = '';
    const keysPerRow = 6;
    let searchGrid = [];
    
    for (let i = 0; i < KEYBOARD_KEYS.length; i += keysPerRow) {
        searchGrid.push(KEYBOARD_KEYS.slice(i, i + keysPerRow));
    }

    searchGrid.forEach((row, rowIndex) => {
        row.forEach((key, colIndex) => {
            const btn = document.createElement('div');
            btn.className = 'key';
            btn.textContent = key;
            btn.tabIndex = 0;
            if (['SPACE', 'DEL', 'CLEAR'].includes(key)) btn.classList.add('wide');

            btn.onclick = () => handleKeyPress(key);
            btn.onkeydown = (e) => {
                if (e.key === 'Enter') handleKeyPress(key);
            };

            grid.appendChild(btn);
        });
    });
}

function handleKeyPress(key) {
    if (key === 'SPACE') searchString += ' ';
    else if (key === 'DEL') searchString = searchString.slice(0, -1);
    else if (key === 'CLEAR') searchString = "";
    else searchString += key;
    
    elements.search.inputDisplay.textContent = searchString;
    
    if (searchString.length > 2) {
        const searchingText = window.t ? window.t('dashboard.searching') : "Searching...";
        elements.search.resultsGrid.innerHTML = `<div class="no-results">${searchingText}</div>`;
    }
}

function openSearch() {
    elements.search.overlay.classList.add('active');
    setTimeout(() => {
        const firstKey = elements.search.keyboardGrid.querySelector('.key');
        if(firstKey) firstKey.focus();
    }, 100);
}

function closeSearch() {
    elements.search.overlay.classList.remove('active');
    document.getElementById('door-play-btn').focus();
}

document.addEventListener('DOMContentLoaded', initializeApp);

/* --- GLOBAL VERTICAL TO HORIZONTAL SCROLL MAPPING --- */
document.addEventListener("DOMContentLoaded", () => {

    // --- NEW LOGIC START ---
    // Check if the URL contains "chapter" OR "stream" to disable scroll mapping in player mode
    if (window.location.href.includes("chapter") || window.location.href.includes("stream")) {
        return; 
    }
    // --- NEW LOGIC END ---

    // We still target the row to MOVE it
    const row = document.getElementById("all-row");
    
    if (row) {
        // 1. Map Mouse Wheel (Anywhere on screen -> Horizontal Scroll on Row)
        window.addEventListener("wheel", (e) => {
            // If vertical scroll (deltaY) is dominant
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                // Prevent default behavior (though body is hidden, this is safer)
                e.preventDefault();
                // Apply the scroll to the ROW
                row.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        // 2. Map Touchscreen Swipes (Anywhere on screen -> Horizontal Scroll on Row)
        let touchStartY = 0;
        let touchStartX = 0;

        window.addEventListener("touchstart", (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: false });

        window.addEventListener("touchmove", (e) => {
            const touchCurrentY = e.touches[0].clientY;
            const touchCurrentX = e.touches[0].clientX;
            
            const deltaY = touchStartY - touchCurrentY;
            const deltaX = touchStartX - touchCurrentX;

            // If the swipe is primarily vertical (Up/Down)
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                e.preventDefault(); 
                // Move the ROW horizontally based on the vertical swipe distance
                row.scrollLeft += deltaY; 
                
                touchStartY = touchCurrentY;
                touchStartX = touchCurrentX;
            }
        }, { passive: false });
    }
});
(function() {
    const targetId = 'island-search-wrapper';
    const keywords = ['stream', 'chapter'];

    const hideElement = () => {
        const url = window.location.href.toLowerCase();
        const shouldHide = keywords.some(key => url.includes(key));
        const el = document.getElementById(targetId);

        if (el) {
            if (shouldHide) {
                // !important flag via style.setProperty to override most CSS
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('opacity', '0', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
            } else {
                // Optional: Restore if keywords are no longer present
                el.style.removeProperty('display');
            }
        }
    };

    // 1. Run immediately on script injection
    hideElement();

    // 2. Watch for DOM changes (in case other JS re-adds or shows the element)
    const observer = new MutationObserver(() => hideElement());
    observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
    });

    // 3. Watch for URL changes (for Single Page Apps like React/Vue)
    window.addEventListener('popstate', hideElement);
    window.addEventListener('hashchange', hideElement);
})();