export type SmileConfig = {
  key: 'home';
  navLabel: string;
  loginLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  introTitle: string;
  featureTitle: string;
  features: string[];
  heroOverlayFrom: string;
  heroOverlayVia: string;
  heroOverlayTo: string;
  pageBackground: string;
  featureBoxColor: string;
  menuBackgroundColor: string;
  menuTextColor: string;
  imageSrc: string;
  imageAlt: string;
};

export const DEFAULT_SMILE_CONFIG: SmileConfig = {
  key: 'home',
  navLabel: 'หน้าแรก',
  loginLabel: 'ลงชื่อเข้าใช้',
  heroTitle: 'Smilebloom',
  heroSubtitle:
    'เว็บแอปพลิเคชันช่วยบันทึกการเจริญเติบโตของฟันและสุขภาพฟัน\nเพื่อผู้ปกครองและคุณหนู',
  introTitle:
    'เว็บไซต์นี้เป็นส่วนหนึ่งของโครงการศึกษาความรอบรู้\nเฉพาะเรื่อง (senior project)\nนางสาว สุชนาธร สีสุขดี',
  featureTitle: 'ฟีเจอร์หลัก',
  features: ['ติดตามลำดับการขึ้นของฟันน้ำนม', 'อำนวยความสะดวกในการพบทันตแพทย์'],
  heroOverlayFrom: '#0f4f47',
  heroOverlayVia: '#225f51',
  heroOverlayTo: '#184c43',
  pageBackground: '#8DD7BF',
  featureBoxColor: '#448575',
  menuBackgroundColor: '#8DD7BF',
  menuTextColor: '#FFFFFF',
  imageSrc: '/home/love-home.png',
  imageAlt: 'Smilebloom',
};

function cleanString(value: unknown, fallback: string) {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function cleanColor(value: unknown, fallback: string) {
  const text = String(value ?? '').trim();
  return /^#[0-9A-Fa-f]{6}$/.test(text) ? text : fallback;
}

export function normalizeSmileConfig(input: Partial<SmileConfig> | null | undefined): SmileConfig {
  const rawFeatures = Array.isArray(input?.features) ? input?.features : DEFAULT_SMILE_CONFIG.features;
  const features = rawFeatures
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    key: 'home',
    navLabel: cleanString(input?.navLabel, DEFAULT_SMILE_CONFIG.navLabel),
    loginLabel: cleanString(input?.loginLabel, DEFAULT_SMILE_CONFIG.loginLabel),
    heroTitle: cleanString(input?.heroTitle, DEFAULT_SMILE_CONFIG.heroTitle),
    heroSubtitle: cleanString(input?.heroSubtitle, DEFAULT_SMILE_CONFIG.heroSubtitle),
    introTitle: cleanString(input?.introTitle, DEFAULT_SMILE_CONFIG.introTitle),
    featureTitle: cleanString(input?.featureTitle, DEFAULT_SMILE_CONFIG.featureTitle),
    features: features.length ? features : DEFAULT_SMILE_CONFIG.features,
    heroOverlayFrom: cleanColor(input?.heroOverlayFrom, DEFAULT_SMILE_CONFIG.heroOverlayFrom),
    heroOverlayVia: cleanColor(input?.heroOverlayVia, DEFAULT_SMILE_CONFIG.heroOverlayVia),
    heroOverlayTo: cleanColor(input?.heroOverlayTo, DEFAULT_SMILE_CONFIG.heroOverlayTo),
    pageBackground: cleanColor(input?.pageBackground, DEFAULT_SMILE_CONFIG.pageBackground),
    featureBoxColor: cleanColor(input?.featureBoxColor, DEFAULT_SMILE_CONFIG.featureBoxColor),
    menuBackgroundColor: cleanColor(input?.menuBackgroundColor, DEFAULT_SMILE_CONFIG.menuBackgroundColor),
    menuTextColor: cleanColor(input?.menuTextColor, DEFAULT_SMILE_CONFIG.menuTextColor),
    imageSrc: cleanString(input?.imageSrc, DEFAULT_SMILE_CONFIG.imageSrc),
    imageAlt: cleanString(input?.imageAlt, DEFAULT_SMILE_CONFIG.imageAlt),
  };
}
