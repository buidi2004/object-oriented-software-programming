'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Plus, Trash2, Edit2, Upload, RefreshCw, 
  CheckCircle2, AlertCircle, LayoutTemplate, Building2, Layers, 
  ExternalLink, Eye, EyeOff, RotateCcw, Loader2, Sparkles, Image as ImageIcon,
  ShieldCheck, Phone, Mail, FileText, Search, X
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface AboutStat {
  title: string;
  desc: string;
}

interface AboutSectionData {
  title: string;
  description: string;
  imageUrl: string;
  moreLink: string;
  stats: AboutStat[];
}

interface SolutionCard {
  title: string;
  desc: string;
  img: string;
  link: string;
}

interface IndustryTab {
  id: string;
  label: string;
}

interface SolutionsSectionData {
  sectionTitle: string;
  tabs: IndustryTab[];
  solutions: Record<string, SolutionCard[]>;
}

interface FooterCompanyData {
  company_name: string;
  business_license: string;
  content_responsible: string;
  hotline: string;
  support_email: string;
}

const DEFAULT_BANNERS = [
  {
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    linkUrl: "/partners",
    displayOrder: 1,
    isActive: true
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
    linkUrl: "/services/cloud-vps",
    displayOrder: 2,
    isActive: true
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop",
    linkUrl: "/services/web-hosting",
    displayOrder: 3,
    isActive: true
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
    linkUrl: "/about",
    displayOrder: 4,
    isActive: true
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
    linkUrl: "/services/dedicated-server",
    displayOrder: 5,
    isActive: true
  }
];

const DEFAULT_ABOUT: AboutSectionData = {
  title: 'Về CloudHost VN',
  description: 'CloudHost VN là nhà cung cấp dịch vụ Điện toán đám mây (Cloud) và Trung tâm dữ liệu (Data Center) hàng đầu tại Việt Nam, mang đến hệ sinh thái dịch vụ toàn diện cho doanh nghiệp.',
  imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
  moreLink: '/about',
  stats: [
    { title: 'Số 1', desc: 'Nhà cung cấp dịch vụ Cloud và Data Center lớn nhất tại Việt Nam' },
    { title: '26.000+', desc: 'Khách hàng doanh nghiệp trong nước và quốc tế đã tin dùng' },
    { title: 'Toàn cầu', desc: 'Mạng lưới đối tác công nghệ hàng đầu thế giới: Microsoft, AWS, VMware' },
    { title: '67.250 m²', desc: 'Diện tích phòng máy thiết kế theo tiêu chuẩn quốc tế Rated 3' }
  ]
};

const DEFAULT_SOLUTIONS: SolutionsSectionData = {
  sectionTitle: 'Giải pháp của CloudHost VN',
  tabs: [
    { id: 'chinh-phu', label: 'Chính phủ' },
    { id: 'tai-chinh', label: 'Tài chính - Ngân hàng' },
    { id: 'y-te', label: 'Y tế' },
    { id: 'giao-duc', label: 'Giáo dục' },
    { id: 'thuong-mai', label: 'Thương mại điện tử' },
    { id: 'san-xuat', label: 'Sản xuất' }
  ],
  solutions: {
    'chinh-phu': [
      { title: 'Chính quyền điện tử', desc: 'Nền tảng hạ tầng số vững chắc cho các Bộ Ban Ngành.', img: 'https://images.unsplash.com/photo-1574682782337-0cbdb3d548b2?q=80&w=2070&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Lưu trữ quốc gia', desc: 'Bảo mật tuyệt đối dữ liệu dân cư và hồ sơ hành chính.', img: 'https://images.unsplash.com/photo-1541888001633-94c6530664f3?q=80&w=2070&auto=format&fit=crop', link: '/services/object-storage' },
      { title: 'An toàn thông tin mạng', desc: 'Giám sát và phòng thủ không gian mạng quốc gia.', img: 'https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop', link: '/services/security-addons' }
    ],
    'tai-chinh': [
      { title: 'Ngân hàng số', desc: 'Hạ tầng máy chủ tốc độ cao phục vụ giao dịch tài chính.', img: 'https://images.unsplash.com/photo-1616803140344-6682afb13cda?q=80&w=2070&auto=format&fit=crop', link: '/services/dedicated-server' },
      { title: 'DR cho Core Banking', desc: 'Trung tâm dữ liệu dự phòng chuẩn Tier III quốc tế.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Bảo mật PCI DSS', desc: 'Hệ thống đạt chuẩn an toàn thanh toán thẻ quốc tế.', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop', link: '/services/ssl-certificate' }
    ],
    'y-te': [
      { title: 'Bệnh án điện tử', desc: 'Lưu trữ và truy xuất hồ sơ bệnh án mọi lúc mọi nơi.', img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop', link: '/services/database' },
      { title: 'Telemedicine', desc: 'Hạ tầng truyền tải ổn định cho khám chữa bệnh từ xa.', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Xử lý hình ảnh y tế', desc: 'Hệ thống GPU Cloud phân tích ảnh chụp MRI, X-Quang.', img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop', link: '/services/dedicated-server' }
    ],
    'giao-duc': [
      { title: 'E-Learning Cloud', desc: 'Hạ tầng lưu trữ và truyền phát video bài giảng trực tuyến.', img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop', link: '/services/cdn' },
      { title: 'Tuyển sinh trực tuyến', desc: 'Hệ thống chịu tải cao trong các đợt thi và tuyển sinh.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Thư viện số', desc: 'Số hóa và lưu trữ không giới hạn tài liệu học thuật.', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop', link: '/services/object-storage' }
    ],
    'thuong-mai': [
      { title: 'E-Commerce High Traffic', desc: 'Tự động co giãn (Auto-scaling) chịu tải triệu lượt truy cập dịp Mega Sale.', img: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=2070&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Tăng tốc Web CDN', desc: 'Tối ưu tốc độ tải trang dưới 1 giây, giữ chân khách mua hàng.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop', link: '/services/cdn' },
      { title: 'Bảo mật chống gian lận', desc: 'Tường lửa WAF chống DDOS và rà quét lỗ hổng thanh toán.', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop', link: '/services/security-addons' }
    ],
    'san-xuat': [
      { title: 'Smart Factory IoT', desc: 'Thu thập và phân tích dữ liệu cảm biến dây chuyền sản xuất theo thời gian thực.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop', link: '/services/dedicated-server' },
      { title: 'Hệ thống ERP Cloud', desc: 'Quản trị tổng thể nguồn lực doanh nghiệp sản xuất trên hạ tầng đám mây.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Quản lý chuỗi cung ứng', desc: 'Theo dõi xuất nhập tồn kho và logistics minh bạch, liên tục 24/7.', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop', link: '/services/database' }
    ]
  }
};

const DEFAULT_FOOTER: FooterCompanyData = {
  company_name: 'Công ty Cổ phần Công nghệ Hạ Tầng Số Việt Nam, trực thuộc Tập đoàn Công nghệ Việt Nam.',
  business_license: '0500589150 do Ban Quản lý các Khu công nghệ cao và Khu công nghiệp - UBND thành phố Hà Nội cấp lần đầu ngày 11/04/2008, sửa đổi lần thứ 13 ngày 10/06/2026.',
  content_responsible: 'Ông Lê Bá Tân.',
  hotline: '1900 6888',
  support_email: 'support@cloudhost.vn'
};

export default function AdminLandingContentPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'banners' | 'about' | 'solutions' | 'footer'>('banners');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Search Terms
  const [bannerSearchTerm, setBannerSearchTerm] = useState('');
  const [solutionSearchTerm, setSolutionSearchTerm] = useState('');

  // 1. Banners State
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    imageUrl: '',
    linkUrl: '',
    displayOrder: 1,
    isActive: true,
    startDate: '',
    endDate: ''
  });
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);

  // 2. About State
  const [aboutData, setAboutData] = useState<AboutSectionData>(DEFAULT_ABOUT);

  // 3. Solutions State
  const [solutionsData, setSolutionsData] = useState<SolutionsSectionData>(DEFAULT_SOLUTIONS);
  const [selectedTabId, setSelectedTabId] = useState<string>('chinh-phu');

  // 4. Footer Company State
  const [footerData, setFooterData] = useState<FooterCompanyData>(DEFAULT_FOOTER);

  // Modal / Editing for Solution Card
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardFormData, setCardFormData] = useState<SolutionCard>({
    title: '',
    desc: '',
    img: '',
    link: '/services/cloud-vps'
  });

  // Modal / Editing for Tab
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }

    try {
      const res = await api.get('/users/me');
      if (res.data?.role !== 'Admin' && res.data?.role !== 'Editor') {
        router.push('/dashboard');
        return;
      }
      await loadContent();
    } catch {
      router.push('/login');
    }
  };

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // 1. Load Banners
      const bannersRes = await api.get('/banners').catch(() => null);
      if (bannersRes?.data && Array.isArray(bannersRes.data)) {
        setBanners(bannersRes.data);
      }

      // 2. Load About Section
      const aboutRes = await api.get('/system-settings/homepage_about').catch(() => null);
      if (aboutRes?.data?.value) {
        try {
          const parsed = JSON.parse(aboutRes.data.value);
          if (parsed && parsed.title) setAboutData(parsed);
        } catch {}
      }

      // 3. Load Solutions Section
      const solRes = await api.get('/system-settings/homepage_solutions').catch(() => null);
      if (solRes?.data?.value) {
        try {
          const parsed = JSON.parse(solRes.data.value);
          if (parsed && parsed.tabs) {
            setSolutionsData(parsed);
            if (parsed.tabs.length > 0) setSelectedTabId(parsed.tabs[0].id);
          }
        } catch {}
      }

      // 4. Load Footer Company Settings
      const [compRes, licRes, respRes, hotRes, mailRes] = await Promise.all([
        api.get('/system-settings/company_name').catch(() => null),
        api.get('/system-settings/business_license').catch(() => null),
        api.get('/system-settings/content_responsible').catch(() => null),
        api.get('/system-settings/hotline').catch(() => null),
        api.get('/system-settings/support_email').catch(() => null),
      ]);

      setFooterData(prev => ({
        company_name: compRes?.data?.value || prev.company_name,
        business_license: licRes?.data?.value || prev.business_license,
        content_responsible: respRes?.data?.value || prev.content_responsible,
        hotline: hotRes?.data?.value || prev.hotline,
        support_email: mailRes?.data?.value || prev.support_email,
      }));
    } catch (err) {
      console.error('Error loading landing content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- BANNER HANDLERS ---
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerFormData({
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
      linkUrl: '/services/cloud-vps',
      displayOrder: banners.length + 1,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
    });
    setShowBannerModal(true);
  };

  const handleOpenEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormData({
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      displayOrder: banner.displayOrder || 1,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
    });
    setShowBannerModal(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        imageUrl: bannerFormData.imageUrl.trim() || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
        linkUrl: bannerFormData.linkUrl.trim() || null,
        displayOrder: Number(bannerFormData.displayOrder) || 1,
        isActive: bannerFormData.isActive,
        startDate: bannerFormData.startDate ? new Date(bannerFormData.startDate).toISOString() : null,
        endDate: bannerFormData.endDate ? new Date(bannerFormData.endDate).toISOString() : null
      };

      if (editingBanner) {
        await api.put(`/banners/${editingBanner.id}`, {
          id: editingBanner.id,
          ...payload
        });
      } else {
        await api.post('/banners', payload);
      }

      setShowBannerModal(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      const res = await api.get('/banners');
      if (res.data && Array.isArray(res.data)) setBanners(res.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi lưu banner.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    try {
      await api.delete(`/banners/${id}`);
      setBanners(prev => prev.filter(b => b.id !== id));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Xóa banner thất bại.');
    }
  };

  const handleToggleBannerStatus = async (banner: Banner) => {
    const newStatus = !banner.isActive;
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: newStatus } : b));
    try {
      await api.put(`/banners/${banner.id}`, {
        id: banner.id,
        imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
        linkUrl: banner.linkUrl || null,
        displayOrder: Number(banner.displayOrder) || 1,
        isActive: newStatus,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString() : null,
        endDate: banner.endDate ? new Date(banner.endDate).toISOString() : null
      });
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleResetDefaultBanners = async () => {
    if (!confirm('Khôi phục 5 Banner mẫu chuẩn cho Trang Chủ?')) return;
    setIsLoading(true);
    try {
      for (const t of DEFAULT_BANNERS) {
        await api.post('/banners', t).catch(() => null);
      }
      const res = await api.get('/banners');
      if (res.data && Array.isArray(res.data)) setBanners(res.data);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      alert('Đã khôi phục thành công 5 banner mẫu chuẩn!');
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi khi tạo banner mẫu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBannerImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/banners/upload', formData);
      if (res.data?.imageUrl) {
        setBannerFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Tải ảnh thất bại. Vui lòng kiểm tra định dạng và dung lượng (<5MB).');
    } finally {
      setUploadingBannerImage(false);
    }
  };

  // --- ABOUT SECTION HANDLERS ---
  const handleSaveAbout = async () => {
    setIsSaving(true);
    try {
      await api.put('/system-settings/homepage_about', {
        key: 'homepage_about',
        value: JSON.stringify(aboutData),
        description: 'Cấu hình mục Về CloudHost VN trên trang chủ'
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu cấu hình Về CloudHost VN');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatChange = (index: number, field: 'title' | 'desc', val: string) => {
    setAboutData(prev => {
      const newStats = [...prev.stats];
      newStats[index] = { ...newStats[index], [field]: val };
      return { ...prev, stats: newStats };
    });
  };

  const handleAddStat = () => {
    setAboutData(prev => ({
      ...prev,
      stats: [...prev.stats, { title: '99.99%', desc: 'Cam kết thời gian hoạt động (SLA Uptime)' }]
    }));
  };

  const handleRemoveStat = (index: number) => {
    setAboutData(prev => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index)
    }));
  };

  // --- SOLUTIONS SECTION HANDLERS ---
  const handleSaveSolutions = async () => {
    setIsSaving(true);
    try {
      await api.put('/system-settings/homepage_solutions', {
        key: 'homepage_solutions',
        value: JSON.stringify(solutionsData),
        description: 'Cấu hình danh mục giải pháp ngành nghề trên trang chủ'
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu cấu hình Giải pháp');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTab = () => {
    if (!newTabLabel.trim()) return;
    const tabId = newTabLabel.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-');
    setSolutionsData(prev => ({
      ...prev,
      tabs: [...prev.tabs, { id: tabId, label: newTabLabel.trim() }],
      solutions: { ...prev.solutions, [tabId]: [] }
    }));
    setSelectedTabId(tabId);
    setNewTabLabel('');
    setIsAddingTab(false);
  };

  const handleRemoveTab = (tabId: string) => {
    if (!confirm('Bạn có chắc muốn xóa Tab ngành nghề này và toàn bộ thẻ giải pháp bên trong?')) return;
    setSolutionsData(prev => {
      const newTabs = prev.tabs.filter(t => t.id !== tabId);
      const newSols = { ...prev.solutions };
      delete newSols[tabId];
      return { ...prev, tabs: newTabs, solutions: newSols };
    });
    const remaining = solutionsData.tabs.filter(t => t.id !== tabId);
    if (remaining.length > 0) setSelectedTabId(remaining[0].id);
  };

  const handleOpenAddCard = () => {
    setCardFormData({
      title: '',
      desc: '',
      img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop',
      link: '/services/cloud-vps'
    });
    setEditingCardIndex(null);
    setIsAddingCard(true);
  };

  const handleOpenEditCard = (index: number) => {
    const currentList = solutionsData.solutions[selectedTabId] || [];
    const item = currentList[index];
    if (!item) return;
    setCardFormData({ ...item });
    setEditingCardIndex(index);
    setIsAddingCard(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormData.title.trim()) return;

    setSolutionsData(prev => {
      const currentList = [...(prev.solutions[selectedTabId] || [])];
      if (editingCardIndex !== null) {
        currentList[editingCardIndex] = { ...cardFormData };
      } else {
        currentList.push({ ...cardFormData });
      }
      return {
        ...prev,
        solutions: {
          ...prev.solutions,
          [selectedTabId]: currentList
        }
      };
    });
    setIsAddingCard(false);
  };

  const handleRemoveCard = (index: number) => {
    if (!confirm('Xác nhận xóa thẻ giải pháp này?')) return;
    setSolutionsData(prev => {
      const currentList = (prev.solutions[selectedTabId] || []).filter((_, i) => i !== index);
      return {
        ...prev,
        solutions: {
          ...prev.solutions,
          [selectedTabId]: currentList
        }
      };
    });
  };

  // --- FOOTER HANDLERS ---
  const handleSaveFooter = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        api.put('/system-settings/company_name', { key: 'company_name', value: footerData.company_name }),
        api.put('/system-settings/business_license', { key: 'business_license', value: footerData.business_license }),
        api.put('/system-settings/content_responsible', { key: 'content_responsible', value: footerData.content_responsible }),
        api.put('/system-settings/hotline', { key: 'hotline', value: footerData.hotline }),
        api.put('/system-settings/support_email', { key: 'support_email', value: footerData.support_email }),
      ]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu thông tin doanh nghiệp & chân trang');
    } finally {
      setIsSaving(false);
    }
  };

  // --- UPLOAD HANDLERS ---
  const handleUploadAboutImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/banners/upload', formData);
      if (res.data?.imageUrl) {
        setAboutData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
    } catch (err) {
      console.error(err);
      alert('Tải ảnh thất bại, vui lòng kiểm tra kích thước file.');
    }
  };

  const handleUploadCardImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/banners/upload', formData);
      if (res.data?.imageUrl) {
        setCardFormData(prev => ({ ...prev, img: res.data.imageUrl }));
      }
    } catch (err) {
      console.error(err);
      alert('Tải ảnh thất bại.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filtered lists
  const filteredBanners = banners.filter(b => 
    (b.linkUrl || '').toLowerCase().includes(bannerSearchTerm.toLowerCase()) ||
    (b.imageUrl || '').toLowerCase().includes(bannerSearchTerm.toLowerCase()) ||
    String(b.displayOrder).includes(bannerSearchTerm)
  );

  const currentTabSolutions = (solutionsData.solutions[selectedTabId] || []).filter(s =>
    s.title.toLowerCase().includes(solutionSearchTerm.toLowerCase()) ||
    s.desc.toLowerCase().includes(solutionSearchTerm.toLowerCase()) ||
    s.link.toLowerCase().includes(solutionSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Quản Lý Nội Dung Trang Chủ</h1>
              <p className="text-xs text-slate-500">Banner, Giới Thiệu, Giải Pháp & Thông Tin Chân Trang</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-sm text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công!
              </span>
            )}
            {activeSection !== 'banners' && (
              <button
                onClick={() => {
                  if (activeSection === 'about') handleSaveAbout();
                  else if (activeSection === 'solutions') handleSaveSolutions();
                  else handleSaveFooter();
                }}
                disabled={isSaving}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu Thay Đổi
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit mb-6">
          <button
            onClick={() => setActiveSection('banners')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeSection === 'banners' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Khối 1: Banner Trang Chủ ({banners.length})
          </button>
          <button
            onClick={() => setActiveSection('about')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeSection === 'about' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Khối 2: Về CloudHost VN
          </button>
          <button
            onClick={() => setActiveSection('solutions')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeSection === 'solutions' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Khối 3: Giải Pháp Ngành Nghề
          </button>
          <button
            onClick={() => setActiveSection('footer')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeSection === 'footer' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Khối 4: Doanh Nghiệp & Chân Trang
          </button>
        </div>

        {/* SECTION 1: BANNER TRANG CHỦ */}
        {activeSection === 'banners' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={bannerSearchTerm}
                  onChange={(e) => setBannerSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm banner theo liên kết hoặc thứ tự..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetDefaultBanners}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                  title="Khôi phục 5 banner chuẩn mặc định"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" /> Khôi Phục 5 Mẫu
                </button>
                <button
                  onClick={handleOpenAddBanner}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Thêm Banner
                </button>
              </div>
            </div>

            {/* Banners Grid */}
            {filteredBanners.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Không tìm thấy banner</h3>
                <p className="text-slate-500 text-xs mb-4">Thêm banner mới hoặc khôi phục 5 banner chuẩn.</p>
                <button
                  onClick={handleResetDefaultBanners}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Khôi Phục 5 Banner Chuẩn
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBanners.map((b) => (
                  <div
                    key={b.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                      b.isActive ? 'border-slate-200 shadow-sm hover:shadow-md' : 'border-slate-200 opacity-70 bg-slate-50/50'
                    }`}
                  >
                    {/* Banner Image Preview */}
                    <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden group">
                      <img
                        src={b.imageUrl}
                        alt="Banner"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm ${
                          b.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {b.isActive ? 'Đang Hiển Thị' : 'Tạm Ẩn'}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
                          Thứ tự: #{b.displayOrder}
                        </span>
                      </div>
                    </div>

                    {/* Banner Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-mono truncate">{b.linkUrl || 'Không có liên kết'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleToggleBannerStatus(b)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                            b.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {b.isActive ? <><EyeOff className="w-3 h-3" /> Ẩn</> : <><Eye className="w-3 h-3" /> Bật</>}
                        </button>
                        <button
                          onClick={() => handleOpenEditBanner(b)}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                          title="Sửa banner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                          title="Xóa banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: VỀ CLOUDHOST VN */}
        {activeSection === 'about' && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Form Edit Left */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-lg">Thông Tin Giới Thiệu Chung</h3>
                  <button
                    onClick={() => {
                      if (confirm('Khôi phục lại nội dung mặc định của mục Về Chúng Tôi?')) {
                        setAboutData(DEFAULT_ABOUT);
                      }
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Mặc định
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tiêu Đề Khối
                  </label>
                  <input
                    type="text"
                    value={aboutData.title}
                    onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Đoạn Văn Giới Thiệu
                  </label>
                  <textarea
                    rows={4}
                    value={aboutData.description}
                    onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ảnh Lớn Tòa Nhà / Data Center
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aboutData.imageUrl}
                      onChange={(e) => setAboutData({ ...aboutData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadAboutImage}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-4 h-4" /> Tải Ảnh
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Đường Dẫn "Xem thêm"
                  </label>
                  <input
                    type="text"
                    value={aboutData.moreLink}
                    onChange={(e) => setAboutData({ ...aboutData, moreLink: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 4 Stats Cards */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Các Khối Số Liệu Nổi Bật</h3>
                    <p className="text-xs text-slate-500">Hiển thị ở cột bên trái mục Về Chúng Tôi</p>
                  </div>
                  <button
                    onClick={handleAddStat}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Số Liệu
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {aboutData.stats.map((st, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 relative group">
                      <button
                        onClick={() => handleRemoveStat(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa số liệu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="mb-2">
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Số / Tiêu đề lớn</label>
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => handleStatChange(idx, 'title', e.target.value)}
                          placeholder="Số 1, 26.000+..."
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Mô tả chi tiết</label>
                        <input
                          type="text"
                          value={st.desc}
                          onChange={(e) => handleStatChange(idx, 'desc', e.target.value)}
                          placeholder="Mô tả số liệu..."
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Right */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-600" /> Xem Trước Trực Quan
                  </span>
                  <span className="text-xs text-slate-400">Trang chủ</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900">{aboutData.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{aboutData.description}</p>

                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                    <img
                      src={aboutData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop';
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {aboutData.stats.slice(0, 4).map((st, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-lg font-black text-blue-600">{st.title}</div>
                        <div className="text-[11px] text-slate-500 leading-tight">{st.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: GIẢI PHÁP THEO NGÀNH */}
        {activeSection === 'solutions' && (
          <div className="space-y-6">
            {/* Header & Section Title */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-lg">Tiêu Đề Khối Giải Pháp</h3>
                <button
                  onClick={() => {
                    if (confirm('Khôi phục cấu hình Giải Pháp mặc định?')) {
                      setSolutionsData(DEFAULT_SOLUTIONS);
                      setSelectedTabId('chinh-phu');
                    }
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Mặc định
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tiêu Đề Khối Lớn
                  </label>
                  <input
                    type="text"
                    value={solutionsData.sectionTitle}
                    onChange={(e) => setSolutionsData({ ...solutionsData, sectionTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tìm Kiếm Thẻ Giải Pháp
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={solutionSearchTerm}
                      onChange={(e) => setSolutionSearchTerm(e.target.value)}
                      placeholder="Lọc thẻ trong tab này..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Manager */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Danh Sách Tab Ngành Nghề</h3>
                  <p className="text-xs text-slate-500">Bấm vào tab để chỉnh sửa danh sách thẻ giải pháp bên trong</p>
                </div>
                <button
                  onClick={() => setIsAddingTab(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm Tab Ngành Mới
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {solutionsData.tabs.map((tab) => {
                  const isSelected = selectedTabId === tab.id;
                  const count = (solutionsData.solutions[tab.id] || []).length;
                  return (
                    <div
                      key={tab.id}
                      className={`flex items-center rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedTabId(tab.id)}
                        className="px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2"
                      >
                        {tab.label}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                      <button
                        onClick={() => handleRemoveTab(tab.id)}
                        className={`p-2 hover:text-red-300 transition-colors ${
                          isSelected ? 'text-white/70' : 'text-slate-400 hover:text-red-600'
                        }`}
                        title="Xóa Tab này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cards List in Selected Tab */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Thẻ Giải Pháp Cho Ngành: <span className="text-blue-600">{solutionsData.tabs.find(t => t.id === selectedTabId)?.label}</span>
                  </h3>
                  <p className="text-xs text-slate-500">Mỗi ngành nên có từ 3 đến 6 thẻ giải pháp</p>
                </div>
                <button
                  onClick={handleOpenAddCard}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm Thẻ Mới
                </button>
              </div>

              {currentTabSolutions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm text-slate-500 mb-3">Chưa có thẻ giải pháp nào trong ngành này.</p>
                  <button
                    onClick={handleOpenAddCard}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl"
                  >
                    + Tạo Thẻ Đầu Tiên
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentTabSolutions.map((sol, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end min-h-[260px]"
                    >
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url('${sol.img}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                      {/* Card Action Buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                        <button
                          onClick={() => handleOpenEditCard(idx)}
                          className="p-2 rounded-xl bg-white/90 text-slate-700 hover:bg-white hover:text-blue-600 backdrop-blur-sm shadow-sm transition-all"
                          title="Sửa thẻ này"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveCard(idx)}
                          className="p-2 rounded-xl bg-white/90 text-slate-700 hover:bg-red-500 hover:text-white backdrop-blur-sm shadow-sm transition-all"
                          title="Xóa thẻ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="relative p-5 text-white z-10 space-y-2">
                        <h4 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">
                          {sol.title}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {sol.desc}
                        </p>
                        <div className="pt-2 flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-400 truncate max-w-[150px]">{sol.link}</span>
                          <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px]">
                            Xem chi tiết
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: THÔNG TIN DOANH NGHIỆP & CHÂN TRANG (FOOTER) */}
        {activeSection === 'footer' && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Form Left */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Thông Tin Pháp Lý & Liên Hệ Chân Trang</h3>
                    <p className="text-xs text-slate-500">Hiển thị ở góc trái phần Chân trang (Footer) toàn hệ thống</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Khôi phục thông tin pháp lý mặc định?')) {
                        setFooterData(DEFAULT_FOOTER);
                      }
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Mặc định
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cơ Quan Chủ Quản / Tên Doanh Nghiệp *
                  </label>
                  <textarea
                    rows={2}
                    value={footerData.company_name}
                    onChange={(e) => setFooterData({ ...footerData, company_name: e.target.value })}
                    placeholder="Công ty Cổ phần Công nghệ Hạ Tầng Số Việt Nam, trực thuộc Tập đoàn Công nghệ Việt Nam."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mã Số Doanh Nghiệp & Giấy Phép Hoạt Động *
                  </label>
                  <textarea
                    rows={3}
                    value={footerData.business_license}
                    onChange={(e) => setFooterData({ ...footerData, business_license: e.target.value })}
                    placeholder="0500589150 do Ban Quản lý các Khu công nghệ cao..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Chịu Trách Nhiệm Nội Dung *
                  </label>
                  <input
                    type="text"
                    value={footerData.content_responsible}
                    onChange={(e) => setFooterData({ ...footerData, content_responsible: e.target.value })}
                    placeholder="Ông Lê Bá Tân."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Hotline (Số Điện Thoại) *
                    </label>
                    <input
                      type="text"
                      value={footerData.hotline}
                      onChange={(e) => setFooterData({ ...footerData, hotline: e.target.value })}
                      placeholder="1900 6888"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-red-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Hỗ Trợ (Gmail) *
                    </label>
                    <input
                      type="email"
                      value={footerData.support_email}
                      onChange={(e) => setFooterData({ ...footerData, support_email: e.target.value })}
                      placeholder="support@cloudhost.vn"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Right */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-600" /> Xem Trước Ở Chân Trang (Footer)
                  </span>
                  <span className="text-xs text-slate-400">Chân trang</span>
                </div>

                <div className="bg-[#f8f8f8] p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600" /> CloudHost VN
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed">
                    Cơ quan chủ quản: <strong>{footerData.company_name}</strong>
                  </p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">
                    Mã số doanh nghiệp: {footerData.business_license}
                  </p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">
                    Chịu trách nhiệm nội dung: {footerData.content_responsible}
                  </p>
                  <div className="pt-2 text-[14px] text-slate-700 border-t border-slate-200">
                    <div>Hotline: <strong className="text-red-600">{footerData.hotline}</strong></div>
                    <div>Email: <span className="text-red-600 font-semibold">{footerData.support_email}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa Banner */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBanner ? 'Chỉnh Sửa Banner' : 'Thêm Banner Mới'}
              </h3>
              <button
                onClick={() => setShowBannerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hình Ảnh Banner (URL hoặc Tải lên) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={bannerFormData.imageUrl}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="file"
                    ref={bannerFileInputRef}
                    onChange={handleUploadBannerFile}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingBannerImage}
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 disabled:opacity-50"
                  >
                    {uploadingBannerImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Tải Ảnh
                  </button>
                </div>
              </div>

              {bannerFormData.imageUrl && (
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src={bannerFormData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80';
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Liên Kết Đích (Link URL)
                </label>
                <input
                  type="text"
                  value={bannerFormData.linkUrl}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, linkUrl: e.target.value })}
                  placeholder="/services/cloud-vps hoặc https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Thứ Tự Hiển Thị
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bannerFormData.displayOrder}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bannerFormData.isActive}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-700">Kích hoạt hiển thị</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ngày Bắt Đầu
                  </label>
                  <input
                    type="date"
                    value={bannerFormData.startDate}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ngày Kết Thúc
                  </label>
                  <input
                    type="date"
                    value={bannerFormData.endDate}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {editingBanner ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa Thẻ Giải Pháp */}
      {isAddingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              {editingCardIndex !== null ? 'Chỉnh Sửa Thẻ Giải Pháp' : 'Thêm Thẻ Giải Pháp Mới'}
            </h3>

            <form onSubmit={handleSaveCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tiêu Đề Giải Pháp *
                </label>
                <input
                  type="text"
                  required
                  value={cardFormData.title}
                  onChange={(e) => setCardFormData({ ...cardFormData, title: e.target.value })}
                  placeholder="Ví dụ: Chính quyền điện tử, Ngân hàng số..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mô Tả Ngắn *
                </label>
                <textarea
                  rows={3}
                  required
                  value={cardFormData.desc}
                  onChange={(e) => setCardFormData({ ...cardFormData, desc: e.target.value })}
                  placeholder="Đoạn mô tả ngắn về giải pháp..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ảnh Nền Thẻ *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={cardFormData.img}
                    onChange={(e) => setCardFormData({ ...cardFormData, img: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="file"
                    ref={cardFileInputRef}
                    onChange={handleUploadCardImage}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cardFileInputRef.current?.click()}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Upload className="w-4 h-4" /> Tải Ảnh
                  </button>
                </div>
              </div>

              {cardFormData.img && (
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={cardFormData.img}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop';
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Liên Kết Chi Tiết (Link)
                </label>
                <input
                  type="text"
                  value={cardFormData.link}
                  onChange={(e) => setCardFormData({ ...cardFormData, link: e.target.value })}
                  placeholder="/services/cloud-vps hoặc https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20"
                >
                  {editingCardIndex !== null ? 'Cập Nhật' : 'Thêm Thẻ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Tab Ngành Mới */}
      {isAddingTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Thêm Tab Ngành Nghề Mới
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên Ngành Nghề *
                </label>
                <input
                  type="text"
                  value={newTabLabel}
                  onChange={(e) => setNewTabLabel(e.target.value)}
                  placeholder="Ví dụ: Nông nghiệp công nghệ cao, Bất động sản..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTab(false);
                    setNewTabLabel('');
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAddTab}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20"
                >
                  Tạo Tab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
