import type {
  CalendarJournalPreview,
  CalendarMonthResponse,
  DailyAiAnalysis,
  JournalDetail,
} from "@/features/calendar/types/calendar.types";

/**
 * Temporary mock calendar data until backend endpoints are connected.
 * Keep this out of UI components.
 */
export const MOCK_CALENDAR_MONTH: CalendarMonthResponse = {
  year: 2026,
  month: 7,
  days: [
    { date: "2026-07-01", mood: "good", journalCount: 1 },
    { date: "2026-07-03", mood: "normal", journalCount: 1 },
    { date: "2026-07-06", mood: "bad", journalCount: 1 },
    { date: "2026-07-09", mood: "sad", journalCount: 1 },
    { date: "2026-07-12", mood: "happy", journalCount: 1 },
    { date: "2026-07-14", mood: "good", journalCount: 1 },
    { date: "2026-07-17", mood: "happy", journalCount: 1 },
  ],
};

export const MOCK_DAILY_JOURNALS: Record<string, CalendarJournalPreview[]> = {
  "2026-07-01": [
    {
      diaryId: 101,
      date: "2026-07-01",
      createdAt: "2026-07-01T09:20:00",
      mood: "good",
      contentPreview: "Өглөө сэргээгдээд сайхан эхэллээ...",
      hasAiAnalysis: true,
    },
  ],
  "2026-07-06": [
    {
      diaryId: 106,
      date: "2026-07-06",
      createdAt: "2026-07-06T21:10:00",
      mood: "bad",
      contentPreview: "Өнөөдөр бага зэрэг бухимдсан өдөр байлаа...",
      hasAiAnalysis: false,
    },
  ],
  "2026-07-09": [
    {
      diaryId: 109,
      date: "2026-07-09",
      createdAt: "2026-07-09T20:05:00",
      mood: "sad",
      contentPreview: "Сэтгэл бага зэрэг гунигтай санагдлаа...",
      hasAiAnalysis: true,
    },
  ],
  "2026-07-17": [
    {
      diaryId: 117,
      date: "2026-07-17",
      createdAt: "2026-07-17T17:42:00",
      mood: "good",
      contentPreview:
        "Өнөөдөр ажлаа амжилттай дуусгаад тайван байлаа. Удаан бодож байсан зүйлээ хийж чадсан...",
      hasAiAnalysis: true,
    },
  ],
};

export const MOCK_JOURNAL_DETAILS: Record<number, JournalDetail> = {
  117: {
    diaryId: 117,
    date: "2026-07-17",
    createdAt: "2026-07-17T17:42:00",
    mood: "good",
    content:
      "Өнөөдөр ажлаа амжилттай дуусгалаа. Удаан бодож байсан зүйлээ хийж чадсан болохоор тайван, баяртай байна.",
    hasAiAnalysis: true,
    weatherLabel: "Нартай",
    primaryEmotion: "Баяртай",
    trigger: "Амжилт",
    thought: "Би чадна",
  },
  101: {
    diaryId: 101,
    date: "2026-07-01",
    createdAt: "2026-07-01T09:20:00",
    mood: "good",
    content: "Өглөө сэргээгдээд сайхан эхэллээ.",
    hasAiAnalysis: true,
    weatherLabel: "Нартай",
    primaryEmotion: "Тайван",
    trigger: "Амралт",
    thought: "Би бэлэн",
  },
  106: {
    diaryId: 106,
    date: "2026-07-06",
    createdAt: "2026-07-06T21:10:00",
    mood: "bad",
    content: "Өнөөдөр бага зэрэг бухимдсан өдөр байлаа.",
    hasAiAnalysis: false,
  },
  109: {
    diaryId: 109,
    date: "2026-07-09",
    createdAt: "2026-07-09T20:05:00",
    mood: "sad",
    content: "Сэтгэл бага зэрэг гунигтай санагдлаа.",
    hasAiAnalysis: true,
    primaryEmotion: "Гунигтай",
    trigger: "Ядаргаа",
    thought: "Амаръя",
  },
};

export const MOCK_DAILY_ANALYSIS: Record<string, DailyAiAnalysis> = {
  "2026-07-17": {
    date: "2026-07-17",
    headline: "Өнөөдөр та тайван, баяртай байлаа",
    primaryEmotion: "Баяртай, тайван",
    trigger: "Ажлаа амжилттай дуусгасан",
    thoughtPattern: "Өөртөө итгэх итгэл нэмэгдсэн",
    adviceTitle: "Өнөөдрийн зөөлөн зөвлөгөө",
    adviceBody:
      "Өнөөдрийн амжилтаа жижиг байсан ч тэмдэглэж, өөрөөрөө бахархаарай.",
  },
  "2026-07-01": {
    date: "2026-07-01",
    headline: "Өнөөдөр та тайван эхэллээ",
    primaryEmotion: "Тайван",
    trigger: "Сайхан өглөө",
    thoughtPattern: "Эерэг хандлага",
    adviceTitle: "Өнөөдрийн зөөлөн зөвлөгөө",
    adviceBody: "Жижиг амжилтуудаа ч тэмдэглэж байгаарай.",
  },
  "2026-07-09": {
    date: "2026-07-09",
    headline: "Өнөөдөр та бага зэрэг гунигтай байлаа",
    primaryEmotion: "Гунигтай",
    trigger: "Ядаргаа",
    thoughtPattern: "Амрах хэрэгтэй гэдгээ мэдэрсэн",
    adviceTitle: "Өнөөдрийн зөөлөн зөвлөгөө",
    adviceBody: "Өөртөө эелдэг хандаж, богино амралт аваарай.",
  },
};
