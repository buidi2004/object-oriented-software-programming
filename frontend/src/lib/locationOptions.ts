export interface CountryOption {
  code: string;
  name: string;
}

export interface ProvinceOption {
  id: string;
  name: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'VN', name: '🇻🇳 Việt Nam' },
  { code: 'US', name: '🇺🇸 Hoa Kỳ' },
  { code: 'SG', name: '🇸🇬 Singapore' },
  { code: 'JP', name: '🇯🇵 Nhật Bản' },
  { code: 'KR', name: '🇰🇷 Hàn Quốc' },
  { code: 'AU', name: '🇦🇺 Úc' },
  { code: 'GB', name: '🇬🇧 Anh' },
  { code: 'DE', name: '🇩🇪 Đức' },
  { code: 'CN', name: '🇨🇳 Trung Quốc' },
  { code: 'TH', name: '🇹🇭 Thái Lan' },
  { code: 'OTHER', name: '🌏 Khác' },
];

export const VIETNAM_PROVINCES: ProvinceOption[] = [
  { id: 'hn', name: 'Hà Nội' },
  { id: 'hcm', name: 'TP. Hồ Chí Minh' },
  { id: 'hp', name: 'Hải Phòng' },
  { id: 'dn', name: 'Đà Nẵng' },
  { id: 'ct', name: 'Cần Thơ' },
  { id: 'bd', name: 'Bình Dương' },
  { id: 'dnai', name: 'Đồng Nai' },
  { id: 'la', name: 'Long An' },
  { id: 'qn', name: 'Quảng Ninh' },
  { id: 'kh', name: 'Khánh Hòa' },
  { id: 'ld', name: 'Lâm Đồng' },
  { id: 'brvt', name: 'Bà Rịa - Vũng Tàu' },
  { id: 'na', name: 'Nghệ An' },
  { id: 'th', name: 'Thanh Hóa' },
  { id: 'bn', name: 'Bắc Ninh' },
  { id: 'hy', name: 'Hưng Yên' },
  { id: 'vp', name: 'Vĩnh Phúc' },
  { id: 'qn2', name: 'Quảng Nam' },
  { id: 'gl', name: 'Gia Lai' },
  { id: 'dl', name: 'Đắk Lắk' },
];

export function getProvinceName(id: string): string {
  return VIETNAM_PROVINCES.find((p) => p.id === id)?.name ?? id;
}

export function getCountryName(code: string): string {
  return COUNTRY_OPTIONS.find((c) => c.code === code)?.name.replace(/^[^\s]+\s/, '') ?? code;
}
