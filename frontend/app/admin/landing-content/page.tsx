'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Plus, Trash2, Edit2, Upload, RefreshCw, 
  CheckCircle2, AlertCircle, LayoutTemplate, Building2, Layers, 
  ExternalLink, Eye, RotateCcw, Loader2, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { api } from '@/src/lib/api';

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

export default function AdminLandingContentPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'about' | 'solutions'>('about');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // About State
  const [aboutData, setAboutData] = useState<AboutSectionData>(DEFAULT_ABOUT);

  // Solutions State
  const [solutionsData, setSolutionsData] = useState<SolutionsSectionData>(DEFAULT_SOLUTIONS);
  const [selectedTabId, setSelectedTabId] = useState<string>('chinh-phu');

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
      // Load About Section
      const aboutRes = await api.get('/system-settings/homepage_about').catch(() => null);
      if (aboutRes?.data?.value) {
        try {
          const parsed = JSON.parse(aboutRes.data.value);
          if (parsed && parsed.title) setAboutData(parsed);
        } catch {}
      }

      // Load Solutions Section
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
    } catch (err) {
      console.error('Error loading landing content:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Stat handlers
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

  // Tab handlers
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

  // Card handlers
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

  // Upload handlers
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

  const currentTabSolutions = solutionsData.solutions[selectedTabId] || [];

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
              <h1 className="text-xl font-bold text-slate-900">Quản Lý Nội Dung Trang Chủ</h1>
              <p className="text-xs text-slate-500">Tùy biến mục Về Chúng Tôi & Giải Pháp Ngành Nghề</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-sm text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công!
              </span>
            )}
            <button
              onClick={activeSection === 'about' ? handleSaveAbout : handleSaveSolutions}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit mb-6">
          <button
            onClick={() => setActiveSection('about')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeSection === 'about' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Khối 2: Về CloudHost VN (Ảnh & Số liệu)
          </button>
          <button
            onClick={() => setActiveSection('solutions')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeSection === 'solutions' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Khối 3: Giải Pháp Ngành Nghề (Tabs & Thẻ)
          </button>
        </div>

        {/* SECTION 1: VỀ CLOUDHOST VN */}
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

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {aboutData.stats.slice(0, 4).map((st, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-lg font-black text-blue-600">{st.title}</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-1">{st.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mt-4 shadow-md">
                    <img
                      src={aboutData.imageUrl}
                      alt="Data Center"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: GIẢI PHÁP NGÀNH NGHỀ */}
        {activeSection === 'solutions' && (
          <div className="space-y-8">
            {/* Top Bar: Section Title & Reset */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[280px]">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tiêu Đề Khu Vực Giải Pháp
                </label>
                <input
                  type="text"
                  value={solutionsData.sectionTitle}
                  onChange={(e) => setSolutionsData({ ...solutionsData, sectionTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => {
                  if (confirm('Khôi phục lại toàn bộ danh mục và thẻ giải pháp mẫu chuẩn?')) {
                    setSolutionsData(DEFAULT_SOLUTIONS);
                    setSelectedTabId('chinh-phu');
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Khôi Phục Dữ Liệu Mẫu
              </button>
            </div>

            {/* Tabs Management */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Danh Sách Tab Ngành Nghề</h3>
                  <p className="text-xs text-slate-500">Bấm vào tab để xem & chỉnh sửa các thẻ giải pháp bên trong</p>
                </div>
                <button
                  onClick={() => setIsAddingTab(true)}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm Ngành Mới
                </button>
              </div>

              {/* Tab Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {solutionsData.tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`group px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      selectedTabId === tab.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedTabId(tab.id)}
                  >
                    <span>{tab.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/10">
                      {(solutionsData.solutions[tab.id] || []).length}
                    </span>
                    {solutionsData.tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTab(tab.id);
                        }}
                        className="p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa tab này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cards for Selected Tab */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Các Thẻ Giải Pháp Trong Ngành: <span className="text-blue-600">{solutionsData.tabs.find(t => t.id === selectedTabId)?.label}</span>
                  </h3>
                  <p className="text-xs text-slate-500">{currentTabSolutions.length} thẻ đang hiển thị</p>
                </div>
                <button
                  onClick={handleOpenAddCard}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm Thẻ Giải Pháp
                </button>
              </div>

              {currentTabSolutions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-semibold mb-4">Chưa có thẻ giải pháp nào trong ngành này</p>
                  <button
                    onClick={handleOpenAddCard}
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Thêm Thẻ Đầu Tiên
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {currentTabSolutions.map((sol, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl overflow-hidden h-80 border border-slate-200 shadow-md bg-slate-900 flex flex-col justify-end"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url('${sol.img}')` }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 60%, transparent 100%)' }}
                      />

                      {/* Top Action Buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
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
      </div>

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
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=2034&auto=format&fit=crop';
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
