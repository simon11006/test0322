import type { NativeLanguage } from '../types';

export interface LanguageConfig {
  code: NativeLanguage;
  name: string;        // 한국어 표기
  nativeName: string;  // 해당 언어로 표기
  flag: string;        // 국기 이모지
  isRTL: boolean;      // RTL 언어 여부
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'vi',    name: '베트남어',          nativeName: 'Tiếng Việt',    flag: '🇻🇳', isRTL: false },
  { code: 'zh',    name: '중국어 (간체)',      nativeName: '中文 (简体)',    flag: '🇨🇳', isRTL: false },
  { code: 'fil',   name: '필리핀어 (타갈로그)', nativeName: 'Filipino',      flag: '🇵🇭', isRTL: false },
  { code: 'mn',    name: '몽골어',            nativeName: 'Монгол хэл',    flag: '🇲🇳', isRTL: false },
  { code: 'ru',    name: '러시아어',          nativeName: 'Русский',        flag: '🇷🇺', isRTL: false },
  { code: 'ar',    name: '아랍어',            nativeName: 'العربية',        flag: '🇸🇦', isRTL: true  },
  { code: 'en',    name: '영어',              nativeName: 'English',        flag: '🇺🇸', isRTL: false },
  { code: 'id',    name: '인도네시아어',       nativeName: 'Bahasa Indonesia', flag: '🇮🇩', isRTL: false },
  { code: 'th',    name: '태국어',            nativeName: 'ภาษาไทย',       flag: '🇹🇭', isRTL: false },
  { code: 'km',    name: '캄보디아어 (크메르)', nativeName: 'ភាសាខ្មែរ',     flag: '🇰🇭', isRTL: false },
  { code: 'other', name: '기타',              nativeName: 'Other',          flag: '🌐', isRTL: false },
];

export function getLanguageConfig(code: NativeLanguage): LanguageConfig {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) ?? SUPPORTED_LANGUAGES[SUPPORTED_LANGUAGES.length - 1];
}

export function getLanguageName(code: NativeLanguage): string {
  return getLanguageConfig(code).name;
}

export function isRTL(code: NativeLanguage): boolean {
  return getLanguageConfig(code).isRTL;
}
