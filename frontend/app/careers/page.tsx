'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Briefcase, Send, CheckCircle2, Clock, FileText, Upload, 
  Search, AlertCircle, ArrowRight, Sparkles, Building2, 
  ShieldCheck, Zap, DollarSign, Calendar, User, Mail, Phone, 
  ExternalLink, Eye, ChevronRight, Check, X, Award, Laptop
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  salary: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

const JOB_POSITIONS: JobPosition[] = [
  {
    id: 'devops-sre',
    title: 'Senior Cloud DevOps / SRE Engineer',
    department: 'Khối Kỹ Thuật Hạ Tầng',
    salary: '35.000.000 - 60.000.000 đ',
    location: 'Hà Nội / TP.HCM / Hybrid',
    type: 'Toàn thời gian',
    experience: 'Từ 3+ năm kinh nghiệm',
    description: 'Vận hành cụm máy chủ Cloud VPS AMD EPYC, tối ưu ảo hóa KVM/Proxmox, thiết kế hạ tầng Kubernetes HA và tự động hóa CI/CD.',
    requirements: [
      'Thành thạo quản trị hệ điều hành Linux (Ubuntu/Debian/Rocky Linux/RHEL).',
      'Kinh nghiệm thực chiến với Kubernetes, Docker, Helm, Terraform hoặc Ansible.',
      'Hiểu sâu về mạng máy chủ: BGP routing, SDN, VLAN, WireGuard, Anti-DDoS mitigation.',
      'Có khả năng trực on-call xử lý sự cố hạ tầng Level 3.'
    ],
    benefits: [
      'Thưởng hiệu suất kinh doanh quý và tháng lương 13 + 14.',
      'Cấp máy trạm Workstation hoặc Macbook Pro M3/M4 Max.',
      'Bảo hiểm sức khỏe cao cấp PVI Care toàn diện cho nhân viên & người thân.',
      'Ngân sách tài trợ thi chứng chỉ quốc tế (CKA, RHCE, AWS/Azure Solutions Architect).'
    ]
  },
  {
    id: 'backend-dotnet',
    title: 'Senior Backend .NET / Go Engineer (Distributed Systems)',
    department: 'Khối Phát Triển Phần Mềm',
    salary: '30.000.000 - 55.000.000 đ',
    location: 'Hà Nội / TP.HCM / Hybrid',
    type: 'Toàn thời gian',
    experience: 'Từ 3+ năm kinh nghiệm',
    description: 'Phát triển kiến trúc vi dịch vụ (Microservices), hệ thống thanh toán tự động, tích hợp API ảo hóa máy chủ và xử lý hàng triệu request/ngày.',
    requirements: [
      'Thành thạo C# / .NET 9-10 hoặc Golang với kiến trúc Clean Architecture / CQRS.',
      'Kinh nghiệm sâu với PostgreSQL, Redis, RabbitMQ / Kafka, Docker.',
      'Tư duy tốt về tối ưu hiệu năng database, caching strategy và bảo mật API.',
      'Khả năng đọc hiểu tài liệu kỹ thuật tiếng Anh tốt.'
    ],
    benefits: [
      'Môi trường làm việc chuẩn quốc tế, review lương 2 lần/năm.',
      'Được đào tạo và làm việc trực tiếp với kiến trúc Cloud Hosting quy mô lớn.',
      'Cơm trưa, trà, cà phê chất lượng cao miễn phí tại văn phòng.',
      'Tham gia các hoạt động Teambuilding, Company Trip nghỉ dưỡng hàng năm.'
    ]
  },
  {
    id: 'sysadmin-l2',
    title: 'Kỹ Sư Quản Trị Hệ Thống & Hỗ Trợ Kỹ Thuật L2 (24/7)',
    department: 'Khối Dịch Vụ Khách Hàng & Vận Hành',
    salary: '16.000.000 - 26.000.000 đ',
    location: 'Hà Nội / TP.HCM',
    type: 'Toàn thời gian (Theo ca luân phiên)',
    experience: 'Từ 1-2 năm kinh nghiệm',
    description: 'Tiếp nhận, chẩn đoán và khắc phục sự cố kỹ thuật Cloud VPS, Web Hosting, SSL, Mail Server và cấu hình DNS cho khách hàng doanh nghiệp.',
    requirements: [
      'Nắm vững lệnh Linux cơ bản, cấu hình Web Server (Nginx, Apache, LiteSpeed).',
      'Hiểu biết về cài đặt database MySQL/PostgreSQL và giải quyết lỗi website WordPress.',
      'Giao tiếp lịch sự, tinh thần trách nhiệm cao và chịu được áp lực ca trực.',
      'Ưu tiên ứng viên có chứng chỉ CCNA hoặc LPIC-1.'
    ],
    benefits: [
      'Phụ cấp ca đêm và ngày lễ tết hấp dẫn (x2 - x3 lương cơ bản).',
      'Lộ trình thăng tiến rõ ràng lên Senior System Admin / DevOps sau 1 năm.',
      'Được đào tạo chuyên sâu về kỹ thuật ảo hóa và mạng máy chủ thực tế.'
    ]
  },
  {
    id: 'security-waf',
    title: 'Chuyên Viên An Ninh Mạng & Chống Tấn Công DDoS (SOC/WAF)',
    department: 'Khối Bảo Mật & An Ninh Mạng',
    salary: '25.000.000 - 48.000.000 đ',
    location: 'Hà Nội / TP.HCM',
    type: 'Toàn thời gian',
    experience: 'Từ 2+ năm kinh nghiệm',
    description: 'Giám sát hệ thống SOC, cấu hình luật tường lửa WAF, phân tích mẫu tấn công DDoS L3/L4/L7 và xây dựng quy trình ứng cứu sự cố.',
    requirements: [
      'Kinh nghiệm với Suricata, Snort, ModSecurity, Coraza WAF, eBPF / XDP.',
      'Kỹ năng phân tích gói tin mạng qua Wireshark / Tcpdump.',
      'Hiểu biết sâu về OWASP Top 10 và các kỹ thuật tấn công Botnet / Amplification DDoS.',
      'Ưu tiên ứng viên có chứng chỉ CEH, CompTIA Security+, OSCP.'
    ],
    benefits: [
      'Làm việc với hệ thống phòng thủ Anti-DDoS công suất 500Gbps hàng đầu.',
      'Thưởng nóng theo từng chiến dịch bảo vệ hạ tầng thành công.',
      'Chế độ bảo hiểm và chăm sóc sức khỏe định kỳ VIP.'
    ]
  },
  {
    id: 'b2b-sales',
    title: 'Chuyên Viên Tư Vấn Giải Pháp Đám Mây Doanh Nghiệp (B2B Solution)',
    department: 'Khối Kinh Doanh & Phát Triển Thị Trường',
    salary: '18.000.000 - 45.000.000 đ (Lương cứng + Hoa hồng)',
    location: 'Hà Nội / TP.HCM',
    type: 'Toàn thời gian',
    experience: 'Từ 1+ năm kinh nghiệm B2B IT',
    description: 'Tìm kiếm, tư vấn và đàm phán hợp đồng cung cấp Dedicated Server, Cloud VPS, giải pháp Disaster Recovery cho khách hàng doanh nghiệp.',
    requirements: [
      'Có kinh nghiệm bán hàng dịch vụ CNTT, Hosting, Phần mềm hoặc Viễn thông B2B.',
      'Kỹ năng thuyết trình, đàm phán và xây dựng mối quan hệ đối tác tốt.',
      'Nhanh nhẹn, đam mê kinh doanh và định hướng kết quả cao.'
    ],
    benefits: [
      'Chính sách hoa hồng lũy tiến không giới hạn trần thu nhập.',
      'Cung cấp data khách hàng tiềm năng chất lượng cao từ Marketing.',
      'Thưởng nóng theo hợp đồng lớn và vinh danh Top Performer quý.'
    ]
  }
];

export default function CareersPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab: 'jobs' | 'track'
  const [activeTab, setActiveTab] = useState<'jobs' | 'track'>('jobs');

  // Application Form State
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedJob, setSelectedJob] = useState(JOB_POSITIONS[0].title);
  const [expectedSalary, setExpectedSalary] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('2-3 năm');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState<{
    code: string;
    candidateName: string;
    jobPosition: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Track Application State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResults, setTrackResults] = useState<any[] | null>(null);
  const [trackError, setTrackError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File CV quá lớn! Vui lòng chọn file dưới 25MB.');
      return;
    }
    setCvFile(file);
  };

  const handleSelectJob = (jobTitle: string) => {
    setSelectedJob(jobTitle);
    setActiveTab('jobs');
    const formEl = document.getElementById('apply-form-section');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !email.trim() || !selectedJob) {
      alert('Vui lòng điền đầy đủ Họ tên, Email và Vị trí ứng tuyển.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('CandidateName', candidateName.trim());
      formData.append('Email', email.trim());
      formData.append('PhoneNumber', phoneNumber.trim());
      formData.append('JobPosition', selectedJob);
      formData.append('ExpectedSalary', expectedSalary.trim());
      formData.append('ExperienceLevel', experienceLevel);
      formData.append('PortfolioUrl', portfolioUrl.trim());
      formData.append('Introduction', introduction.trim());
      if (cvFile) {
        formData.append('CvFile', cvFile);
      }

      const res = await api.post('/careers/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setApplicationSuccess({
          code: res.data.applicationCode,
          candidateName: candidateName.trim(),
          jobPosition: selectedJob
        });
        // Reset form
        setCandidateName('');
        setEmail('');
        setPhoneNumber('');
        setExpectedSalary('');
        setPortfolioUrl('');
        setIntroduction('');
        setCvFile(null);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Nộp hồ sơ không thành công. Vui lòng kiểm tra lại thông tin và thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    try {
      setTrackLoading(true);
      setTrackError('');
      setTrackResults(null);

      const res = await api.get(`/careers/track/${encodeURIComponent(trackQuery.trim())}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setTrackResults(res.data);
      } else {
        setTrackError('Không tìm thấy hồ sơ ứng tuyển nào khớp với mã hoặc email này.');
      }
    } catch (err: any) {
      setTrackError('Không tìm thấy hồ sơ ứng tuyển. Vui lòng kiểm tra lại mã hồ sơ (vd: APP-1234) hoặc email đã nộp.');
    } finally {
      setTrackLoading(false);
    }
  };

  const getPipelineStep = (status: number) => {
    switch (status) {
      case 1: return 1; // Submitted
      case 2: return 2; // Reviewing
      case 3: return 3; // Interviewing
      case 4: return 4; // Accepted
      case 5: return 4; // Rejected (Step 4 final)
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-black selection:text-white">
      
      {/* 1. HERO RECRUITMENT BANNER - MONOCHROME DARK */}
      <section className="bg-[#121212] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800 relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700">
            <Briefcase className="w-3.5 h-3.5" />
            <span>CAREERS &amp; TALENT RECRUITMENT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Gia Nhập Đội Ngũ Kỹ Sư &amp; Chuyên Gia Điện Toán Đám Mây
          </h1>

          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto font-normal leading-relaxed">
            Cùng chúng tôi kiến tạo hạ tầng đám mây tốc độ cao, bảo mật và ổn định cho hàng triệu người dùng. Đãi ngộ xứng tầm, môi trường khai phóng và thử thách công nghệ đỉnh cao.
          </p>

          {/* Tab Switcher - Monochromatic */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Vị Trí Đang Tuyển ({JOB_POSITIONS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Tiến Độ 4 Bước</span>
            </button>
          </div>

        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* ================= TAB 1: JOB OPENINGS & APPLICATION FORM ================= */}
        {activeTab === 'jobs' && (
          <>
            {/* Culture & Benefits Highlights - Monochrome */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="text-sm font-black text-black">Thu Nhập Hấp Dẫn</div>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">Lương Net cạnh tranh + Thưởng tháng 13, 14 &amp; thưởng dự án theo quý.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="text-sm font-black text-black">Thiết Bị Đỉnh Cao</div>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">Cấp mới Macbook Pro M3/M4 hoặc Dell Workstation màn hình 4K.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-sm font-black text-black">Chứng Chỉ Quốc Tế</div>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">Tài trợ 100% học &amp; thi chứng chỉ CKA, RHCE, OSCP, AWS Architect.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-sm font-black text-black">Chăm Sóc Toàn Diện</div>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">Bảo hiểm PVI Care VIP, khám sức khỏe tại Vinmec, Teambuilding 5 sao.</p>
              </div>
            </div>

            {/* Job Openings List */}
            <div className="space-y-6">
              <div className="border-b border-zinc-200 pb-3">
                <h2 className="text-xl font-black text-black flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-black" />
                  <span>Vị Trí Tuyển Dụng Nổi Bật ({JOB_POSITIONS.length})</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Chọn vị trí phù hợp với năng lực của bạn để nộp hồ sơ trực tuyến</p>
              </div>

              <div className="space-y-4">
                {JOB_POSITIONS.map((job) => (
                  <div 
                    key={job.id}
                    className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-2xs hover:shadow-md hover:border-black transition-all space-y-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[11px] font-bold text-black bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-300">
                            {job.department}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-md">
                            {job.type}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-md">
                            {job.location}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-black">{job.title}</h3>
                        <p className="text-xs text-zinc-600 mt-1 font-normal leading-relaxed">{job.description}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-black text-black font-mono">{job.salary}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{job.experience}</div>
                        </div>

                        <button
                          onClick={() => handleSelectJob(job.title)}
                          className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                        >
                          <span>Ứng Tuyển Ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 text-xs">
                      <div>
                        <h4 className="font-bold text-black mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" /> Yêu Cầu Chuyên Môn:
                        </h4>
                        <ul className="space-y-1 text-zinc-600 pl-5 list-disc font-normal">
                          {job.requirements.map((req, i) => (
                            <li key={i} className="leading-relaxed">{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-black mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-black" /> Quyền Lợi &amp; Đãi Ngộ:
                        </h4>
                        <ul className="space-y-1 text-zinc-600 pl-5 list-disc font-normal">
                          {job.benefits.map((ben, i) => (
                            <li key={i} className="leading-relaxed">{ben}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Form Section */}
            <div id="apply-form-section" className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-2xs space-y-8 scroll-mt-20">
              <div className="border-b border-zinc-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-black text-xs font-bold mb-2 border border-zinc-300">
                  <Send className="w-3.5 h-3.5" />
                  <span>FORM NỘP HỒ SƠ ỨNG TUYỂN TRỰC TUYẾN</span>
                </div>
                <h2 className="text-2xl font-black text-black">Gửi Hồ Sơ &amp; CV Của Bạn</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Điền thông tin và tải lên file CV (PDF/Word). Ban Tuyển Dụng sẽ gửi email xác nhận và cập nhật tiến trình 4 bước ngay sau khi tiếp nhận.
                </p>
              </div>

              {applicationSuccess && (
                <div className="p-6 rounded-2xl bg-zinc-900 text-white space-y-3 animate-in zoom-in-95 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                    <h3 className="text-base font-black">Nộp Hồ Sơ Thành Công!</h3>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                    Chúc mừng bạn <strong>{applicationSuccess.candidateName}</strong>! Hồ sơ ứng tuyển vị trí <strong>{applicationSuccess.jobPosition}</strong> đã được lưu trữ an toàn trên hệ thống tuyển dụng.
                  </p>
                  <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-400">Mã tra cứu hồ sơ:</span>
                      <div className="text-base font-mono font-black text-white">{applicationSuccess.code}</div>
                    </div>
                    <button
                      onClick={() => {
                        setTrackQuery(applicationSuccess.code);
                        setActiveTab('track');
                      }}
                      className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Xem Tiến Độ 4 Bước Ngay</span>
                    </button>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300 text-black text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitApplication} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Vị Trí Ứng Tuyển *</label>
                    <select
                      value={selectedJob}
                      onChange={(e) => setSelectedJob(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    >
                      {JOB_POSITIONS.map((j) => (
                        <option key={j.id} value={j.title}>{j.title}</option>
                      ))}
                      <option value="Khác (General Talent Pool)">Ứng Tuyển Vị Trí Khác (General Talent Pool)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Họ Và Tên Của Bạn *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Hùng"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Email Liên Hệ *</label>
                    <input
                      type="email"
                      required
                      placeholder="email@domain.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Số Điện Thoại / Zalo *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0988 888 999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Mức Lương Mong Muốn (Net)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 35.000.000 đ hoặc Thỏa thuận"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Số Năm Kinh Nghiệm</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    >
                      <option value="Dưới 1 năm / Mới tốt nghiệp">Dưới 1 năm / Mới tốt nghiệp</option>
                      <option value="1 - 2 năm">1 - 2 năm</option>
                      <option value="2 - 3 năm">2 - 3 năm</option>
                      <option value="3 - 5 năm">3 - 5 năm (Senior)</option>
                      <option value="Trên 5 năm (Lead / Expert)">Trên 5 năm (Lead / Expert)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Link Portfolio / GitHub / LinkedIn</label>
                    <input
                      type="url"
                      placeholder="https://github.com/yourname hoặc linkedin.com/in/yourprofile"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                {/* Upload CV Box - Monochrome */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Tải Lên File CV / Hồ Sơ Của Bạn (PDF / Docx / Zip) *</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.zip"
                    className="hidden"
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                      cvFile 
                        ? 'border-black bg-zinc-100' 
                        : 'border-zinc-300 hover:border-black bg-zinc-50/50 hover:bg-zinc-100'
                    }`}
                  >
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-black">{cvFile.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {(cvFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Bấm để chọn lại file khác
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-black flex items-center justify-center mx-auto shadow-2xs">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-black">
                          Bấm vào đây để chọn tệp CV của bạn từ máy tính / điện thoại
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          Định dạng hỗ trợ: PDF, Word (.docx), Zip (Kích thước tối đa 25MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Giới Thiệu Bản Thân &amp; Dự Án Nổi Bật (Tùy chọn)</label>
                  <textarea
                    rows={4}
                    placeholder="Chia sẻ ngắn về thế mạnh công nghệ, dự án hạ tầng / phần mềm bạn tự hào nhất..."
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-zinc-400">
                    Bảo mật thông tin ứng viên 100% &bull; Cam kết phản hồi trong 1-3 ngày làm việc
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Gửi Hồ Sơ Ứng Tuyển Ngay</span>
                  </button>
                </div>

              </form>
            </div>
          </>
        )}

        {/* ================= TAB 2: PIPELINE STATUS TRACKER (4 STEPS) - MONOCHROME ================= */}
        {activeTab === 'track' && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-2xs space-y-6">
              <div className="border-b border-zinc-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-black text-xs font-bold mb-2 border border-zinc-300">
                  <Search className="w-3.5 h-3.5" />
                  <span>TRA CỨU TIẾN TRÌNH TUYỂN DỤNG THEO THỜI GIAN THỰC</span>
                </div>
                <h2 className="text-2xl font-black text-black">Tra Cứu Trạng Thái Hồ Sơ Ứng Tuyển</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Nhập mã hồ sơ (ví dụ: <code className="text-black font-bold font-mono">APP-5955</code>) hoặc địa chỉ Email của bạn để theo dõi 4 bước tuyển dụng.
                </p>
              </div>

              <form onSubmit={handleTrackApplication} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã hồ sơ (APP-XXXX) hoặc Email của bạn..."
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={trackLoading}
                  className="px-6 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {trackLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Tra Cứu Hồ Sơ</span>
                </button>
              </form>

              {trackError && (
                <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300 text-black text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}
            </div>

            {/* Display Pipeline Results */}
            {trackResults && trackResults.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-base font-black text-black flex items-center gap-2">
                  <span>Kết Quả Tra Cứu ({trackResults.length} hồ sơ)</span>
                </h3>

                {trackResults.map((item) => {
                  const currentStep = getPipelineStep(item.status);
                  const isAccepted = item.status === 4;
                  const isRejected = item.status === 5;

                  return (
                    <div 
                      key={item.id}
                      className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-2xs space-y-8"
                    >
                      {/* Application Info Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-black bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-300">
                              {item.applicationCode}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">
                              Ngày nộp: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-black mt-1">{item.candidateName}</h4>
                          <p className="text-xs text-zinc-600 font-bold">Vị trí: {item.jobPosition}</p>
                        </div>

                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isAccepted ? 'bg-black text-white border-black' :
                            isRejected ? 'bg-zinc-200 text-zinc-800 border-zinc-400' :
                            'bg-zinc-100 text-black border-zinc-300'
                          }`}>
                            {isAccepted ? '🎉 Trúng Tuyển (Offer)' :
                             isRejected ? 'Chưa Phù Hợp' :
                             item.status === 3 ? 'Lên Lịch Phỏng Vấn' :
                             item.status === 2 ? 'Đang Thẩm Định CV' :
                             'Đã Tiếp Nhận Hồ Sơ'}
                          </span>
                        </div>
                      </div>

                      {/* 4-STEP PIPELINE TRACKER BAR - MONOCHROME */}
                      <div className="space-y-4">
                        <h5 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                          Tiến Trình Tuyển Dụng 4 Bước (Recruitment Pipeline):
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
                          
                          {/* Step 1 */}
                          <div className={`p-4 rounded-2xl border transition-all ${
                            currentStep >= 1 
                              ? 'bg-zinc-900 text-white border-black' 
                              : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                currentStep >= 1 ? 'bg-white text-black' : 'bg-zinc-300 text-zinc-600'
                              }`}>
                                1
                              </div>
                              <span className="text-xs font-bold">Tiếp Nhận CV</span>
                            </div>
                            <p className="text-[11px] text-zinc-400">Hệ thống đã nhận hồ sơ và gửi email xác nhận.</p>
                          </div>

                          {/* Step 2 */}
                          <div className={`p-4 rounded-2xl border transition-all ${
                            currentStep >= 2 
                              ? 'bg-zinc-900 text-white border-black' 
                              : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                currentStep >= 2 ? 'bg-white text-black' : 'bg-zinc-300 text-zinc-600'
                              }`}>
                                2
                              </div>
                              <span className="text-xs font-bold">Thẩm Định Hồ Sơ</span>
                            </div>
                            <p className="text-[11px] text-zinc-400">HR &amp; Trưởng bộ phận đang đánh giá chuyên môn.</p>
                          </div>

                          {/* Step 3 */}
                          <div className={`p-4 rounded-2xl border transition-all ${
                            currentStep >= 3 
                              ? 'bg-zinc-900 text-white border-black' 
                              : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                currentStep >= 3 ? 'bg-white text-black' : 'bg-zinc-300 text-zinc-600'
                              }`}>
                                3
                              </div>
                              <span className="text-xs font-bold">Phỏng Vấn &amp; Test</span>
                            </div>
                            <p className="text-[11px] text-zinc-400">Duyệt qua vòng CV, mời phỏng vấn kỹ thuật.</p>
                          </div>

                          {/* Step 4 */}
                          <div className={`p-4 rounded-2xl border transition-all ${
                            isAccepted ? 'bg-black text-white border-black ring-2 ring-zinc-700' :
                            isRejected ? 'bg-zinc-200 text-zinc-800 border-zinc-400' :
                            currentStep >= 4 ? 'bg-zinc-900 text-white border-black' :
                            'bg-zinc-50 border-zinc-200 text-zinc-400'
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isAccepted ? 'bg-white text-black' :
                                isRejected ? 'bg-zinc-400 text-white' :
                                currentStep >= 4 ? 'bg-white text-black' : 'bg-zinc-300 text-zinc-600'
                              }`}>
                                4
                              </div>
                              <span className="text-xs font-bold">Kết Quả Tuyển Dụng</span>
                            </div>
                            <p className="text-[11px] text-zinc-400">
                              {isAccepted ? 'Chúc mừng bạn đã trúng tuyển nhận việc!' :
                               isRejected ? 'Chưa phù hợp đợt tuyển này, lưu trữ hồ sơ.' :
                               'Quyết định tuyển dụng & thư mời nhận việc.'}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Admin Notes / Interview Details Box */}
                      {(item.interviewSchedule || item.adminNotes) && (
                        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                          {item.interviewSchedule && (
                            <div className="flex items-start gap-2 text-black">
                              <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-black" />
                              <div>
                                <span className="font-bold">Lịch hẹn phỏng vấn:</span> {item.interviewSchedule}
                              </div>
                            </div>
                          )}
                          {item.adminNotes && (
                            <div className="flex items-start gap-2 text-zinc-700">
                              <FileText className="w-4 h-4 shrink-0 mt-0.5 text-black" />
                              <div>
                                <span className="font-bold text-black">Thông điệp từ Ban Tuyển Dụng:</span> {item.adminNotes}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* File CV Attachment */}
                      {item.cvFileUrl && (
                        <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                          <div className="flex items-center gap-2 text-black font-bold truncate">
                            <FileText className="w-4 h-4 text-black shrink-0" />
                            <span className="truncate">File CV đã nộp: {item.cvFileName || 'Hồ_sơ_CV.pdf'}</span>
                          </div>
                          <a
                            href={`/api/careers/download-cv/${item.id}`}
                            target="_blank"
                            download
                            className="px-3 py-1 bg-black hover:bg-zinc-800 text-white font-bold rounded-lg transition-colors shadow-2xs shrink-0 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Tải CV</span>
                          </a>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
