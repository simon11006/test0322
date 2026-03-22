import type { NativeLanguage } from '../types';

export interface UIStrings {
  nav: {
    map: string;
    lessons: string;
    quizzes: string;
    rewards: string;
  };
  home: {
    progress: string;
    selectLanguage: string;
    translate: string;
    levelTest: string;
    dailyGoal: string;
    dailyGoalText: string;
    dailyGoalStart: string;
  };
}

const strings: Record<NativeLanguage, UIStrings> = {
  vi: {
    nav: { map: 'Bản đồ', lessons: 'Bài học', quizzes: 'Kiểm tra', rewards: 'Phần thưởng' },
    home: { progress: 'Tiến độ', selectLanguage: 'Chọn ngôn ngữ', translate: 'Dịch thuật', levelTest: 'Kiểm tra trình độ', dailyGoal: 'Mục tiêu hôm nay', dailyGoalText: 'Tiếp tục học để duy trì chuỗi!', dailyGoalStart: 'Hãy chọn ngôn ngữ và bắt đầu học!' },
  },
  zh: {
    nav: { map: '地图', lessons: '课程', quizzes: '测验', rewards: '奖励' },
    home: { progress: '学习进度', selectLanguage: '选择语言', translate: '翻译学习', levelTest: '水平测试', dailyGoal: '今日目标', dailyGoalText: '继续学习，保持连续！', dailyGoalStart: '请选择语言并开始学习！' },
  },
  fil: {
    nav: { map: 'Mapa', lessons: 'Aralin', quizzes: 'Pagsubok', rewards: 'Gantimpala' },
    home: { progress: 'Pag-unlad', selectLanguage: 'Pumili ng wika', translate: 'Pagsasalin', levelTest: 'Pagsubok sa Antas', dailyGoal: 'Layunin Ngayon', dailyGoalText: 'Patuloy na matuto para mapanatili ang streak!', dailyGoalStart: 'Pumili ng wika at magsimulang matuto!' },
  },
  mn: {
    nav: { map: 'Газрын зураг', lessons: 'Хичээл', quizzes: 'Тест', rewards: 'Шагнал' },
    home: { progress: 'Ахиц дэвшил', selectLanguage: 'Хэл сонгох', translate: 'Орчуулга', levelTest: 'Түвшин тест', dailyGoal: 'Өдрийн зорилт', dailyGoalText: 'Үргэлжлүүлэн суралцаарай!', dailyGoalStart: 'Хэлээ сонгоод суралцаж эхлээрэй!' },
  },
  ru: {
    nav: { map: 'Карта', lessons: 'Уроки', quizzes: 'Тесты', rewards: 'Награды' },
    home: { progress: 'Прогресс', selectLanguage: 'Выберите язык', translate: 'Перевод', levelTest: 'Тест уровня', dailyGoal: 'Цель на сегодня', dailyGoalText: 'Продолжайте учиться!', dailyGoalStart: 'Выберите язык и начните учиться!' },
  },
  ar: {
    nav: { map: 'الخريطة', lessons: 'الدروس', quizzes: 'الاختبارات', rewards: 'المكافآت' },
    home: { progress: 'التقدم', selectLanguage: 'اختر لغتك', translate: 'الترجمة', levelTest: 'اختبار المستوى', dailyGoal: 'هدف اليوم', dailyGoalText: 'واصل التعلم للحفاظ على سلسلتك!', dailyGoalStart: 'اختر لغتك وابدأ التعلم!' },
  },
  en: {
    nav: { map: 'Map', lessons: 'Lessons', quizzes: 'Quizzes', rewards: 'Rewards' },
    home: { progress: 'Progress', selectLanguage: 'Select your language', translate: 'Translation', levelTest: 'Level Test', dailyGoal: 'Daily Goal', dailyGoalText: 'Keep learning to build your streak!', dailyGoalStart: 'Select a language and start learning!' },
  },
  id: {
    nav: { map: 'Peta', lessons: 'Pelajaran', quizzes: 'Kuis', rewards: 'Hadiah' },
    home: { progress: 'Kemajuan', selectLanguage: 'Pilih bahasa', translate: 'Terjemahan', levelTest: 'Tes Level', dailyGoal: 'Target Hari Ini', dailyGoalText: 'Terus belajar untuk menjaga streak!', dailyGoalStart: 'Pilih bahasa dan mulai belajar!' },
  },
  th: {
    nav: { map: 'แผนที่', lessons: 'บทเรียน', quizzes: 'แบบทดสอบ', rewards: 'รางวัล' },
    home: { progress: 'ความคืบหน้า', selectLanguage: 'เลือกภาษา', translate: 'การแปล', levelTest: 'ทดสอบระดับ', dailyGoal: 'เป้าหมายวันนี้', dailyGoalText: 'เรียนต่อไปเพื่อรักษาสตรีค!', dailyGoalStart: 'เลือกภาษาและเริ่มเรียน!' },
  },
  km: {
    nav: { map: 'ផែនទី', lessons: 'មេរៀន', quizzes: 'ប្រឡង', rewards: 'រង្វាន់' },
    home: { progress: 'ការរីកចម្រើន', selectLanguage: 'ជ្រើសភាសា', translate: 'ការបកប្រែ', levelTest: 'ធ្វើតេស្ត', dailyGoal: 'គោលដៅប្រចាំថ្ងៃ', dailyGoalText: 'រៀនបន្តដើម្បីរក្សា streak!', dailyGoalStart: 'ជ្រើសភាសា ហើយចាប់ផ្តើមរៀន!' },
  },
  other: {
    nav: { map: 'Map', lessons: 'Lessons', quizzes: 'Quizzes', rewards: 'Rewards' },
    home: { progress: 'Progress', selectLanguage: 'Select your language', translate: 'Translation', levelTest: 'Level Test', dailyGoal: 'Daily Goal', dailyGoalText: 'Keep learning to build your streak!', dailyGoalStart: 'Select a language and start learning!' },
  },
};

export function getUIStrings(lang?: NativeLanguage): UIStrings {
  return strings[lang ?? 'en'];
}
