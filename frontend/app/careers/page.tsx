'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Send, CheckCircle2, Clock, FileText, Upload, 
  Search, AlertCircle, ArrowRight, Sparkles, Building2, 
  ShieldCheck, Zap, DollarSign, Calendar, User, Mail, Phone, 
  ExternalLink, Eye, ChevronRight, Check, X, Award, Laptop, Terminal
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/src/components/animations/ScrollReveal';

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
    title: 'Chuyên Viên Tư Vấn Giải Pháp Đám Mây Doanh Nghiệp (B2B)',
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
      setTrackError('Không tìm thấy hồ sơ. Vui lòng kiểm tra lại mã (vd: APP-1234) hoặc email.');
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
      case 5: return 4; // Rejected
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-white selection:bg-emerald-500 selection:text-white">
      
      {/* 1. CYBER HERO BANNER */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-white/10 px-4 sm:px-6 lg:px-8">
        {/* Animated Cyber Grid Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/20 to-transparent blur-3xl opacity-50 z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black border border-emerald-500/30 text-emerald-400 text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Terminal className="w-4 h-4" />
            <TypewriterText text="> RUN: RECRUITMENT_PROTOCOL.exe" speed={30} delay={0.2} />
          </motion.div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white leading-[1.1]">
            GIA NHẬP ĐỘI NGŨ <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-600">
               <TypewriterText text="KỸ SƯ ĐÁM Mây." speed={50} delay={1.5} />
            </span>
          </h1>

          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            <TypewriterText text="Kiến tạo hạ tầng đám mây tốc độ cao, bảo mật và ổn định cho hàng triệu người dùng. Đãi ngộ xứng tầm, môi trường khai phóng và thử thách công nghệ đỉnh cao." speed={15} delay={3} />
          </p>

          {/* Cyber Tab Switcher */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-8 py-4 rounded-xl font-black text-sm transition-all flex items-center gap-2 relative overflow-hidden group ${
                activeTab === 'jobs'
                  ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] border-emerald-400'
                  : 'bg-black hover:bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Briefcase className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Vị Trí Đang Tuyển</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`px-8 py-4 rounded-xl font-black text-sm transition-all flex items-center gap-2 relative overflow-hidden ${
                activeTab === 'track'
                  ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] border-emerald-400'
                  : 'bg-black hover:bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Search className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Tra Cứu Hồ Sơ</span>
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24 relative z-10">
        
        {/* ================= TAB 1: JOB OPENINGS & APPLICATION FORM ================= */}
        {activeTab === 'jobs' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-24"
          >
            
            {/* 2. BENTO GRID BENEFITS */}
            <section className="space-y-12">
               <ScrollReveal animation="fade" className="text-center">
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">Đãi ngộ <span className="text-emerald-400">Đặc Quyền</span></h2>
                  <p className="text-zinc-500 mt-4 font-mono text-sm">Beyond standard benefits. We care about your growth.</p>
               </ScrollReveal>

               <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
                  {/* Large Card */}
                  <StaggerItem className="md:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-8 flex flex-col justify-between group hover:border-emerald-500/50 transition-colors">
                     <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700">
                        <DollarSign className="w-64 h-64 text-emerald-500" />
                     </div>
                     <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4 backdrop-blur-md">
                        <DollarSign className="w-7 h-7" />
                     </div>
                     <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Thu Nhập Không Giới Hạn</h3>
                        <p className="text-zinc-400 leading-relaxed">Lương Net cạnh tranh thị trường. Thưởng tháng 13, 14 &amp; thưởng dự án theo quý. Đặc biệt có chính sách cấp Cổ phần ESOP cho Key Members.</p>
                     </div>
                  </StaggerItem>

                  {/* Tall Card */}
                  <StaggerItem className="md:col-span-1 md:row-span-2 relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 p-8 flex flex-col group hover:border-emerald-500/50 transition-colors">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 text-emerald-500">
                        <Laptop className="w-32 h-32" />
                     </div>
                     <div className="mt-auto relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-white flex items-center justify-center font-bold mb-6 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                           <Laptop className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">Vũ Khí Sắc Bén</h3>
                        <p className="text-zinc-400 leading-relaxed">Cấp mới Macbook Pro M3 Max / Dell Workstation & màn hình 4K cho toàn bộ kỹ sư. Môi trường làm việc thoải mái, ghế công thái học Herman Miller.</p>
                     </div>
                  </StaggerItem>

                  {/* Standard Card 1 */}
                  <StaggerItem className="md:col-span-1 relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 p-8 flex flex-col group hover:border-emerald-500/50 transition-colors">
                     <div className="w-12 h-12 rounded-xl bg-zinc-800 text-white flex items-center justify-center font-bold mb-4 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                        <Award className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-black text-white mb-2 uppercase">Chứng Chỉ Quốc Tế</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed">Tài trợ 100% học & thi chứng chỉ CKA, RHCE, OSCP, AWS Architect.</p>
                  </StaggerItem>

                  {/* Standard Card 2 */}
                  <StaggerItem className="md:col-span-1 relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 p-8 flex flex-col group hover:border-emerald-500/50 transition-colors">
                     <div className="w-12 h-12 rounded-xl bg-zinc-800 text-white flex items-center justify-center font-bold mb-4 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-black text-white mb-2 uppercase">Chăm Sóc Hàng Đầu</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed">Bảo hiểm PVI Care VIP, khám sức khỏe tại Vinmec, Teambuilding chuẩn 5 sao.</p>
                  </StaggerItem>
               </StaggerContainer>
            </section>

            {/* 3. INTERACTIVE JOB LISTINGS */}
            <section className="space-y-10">
               <ScrollReveal animation="slide-up" className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
                  <div>
                     <h2 className="text-3xl font-black text-white flex items-center gap-3 uppercase">
                        <Terminal className="w-8 h-8 text-emerald-500" />
                        <span>Mở Khóa Sự Nghiệp</span>
                     </h2>
                     <p className="text-zinc-500 mt-2 font-mono text-sm">Select a role to initiate recruitment protocol.</p>
                  </div>
                  <div className="text-2xl font-black text-emerald-500 font-mono mt-4 md:mt-0">
                     [{JOB_POSITIONS.length} OPENINGS]
                  </div>
               </ScrollReveal>

               <div className="space-y-6">
                  {JOB_POSITIONS.map((job, idx) => (
                     <ScrollReveal 
                        key={job.id} 
                        animation={idx % 2 === 0 ? "slide-right" : "slide-left"}
                     >
                        <div className="group bg-[#111] rounded-3xl border border-white/10 p-8 shadow-2xl hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden">
                           {/* Hover Glow Background */}
                           <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                           
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                              <div className="flex-1">
                                 <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                       {job.department}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                       {job.type}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                       {job.location}
                                    </span>
                                 </div>
                                 <h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-emerald-400 transition-colors mb-3">
                                    {job.title}
                                 </h3>
                                 <p className="text-zinc-400 text-sm leading-relaxed">{job.description}</p>
                              </div>

                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0 md:border-l md:border-white/10 md:pl-8">
                                 <div className="text-left md:text-right">
                                    <div className="text-emerald-400 font-black text-xl tracking-tight">{job.salary}</div>
                                    <div className="text-[11px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">{job.experience}</div>
                                 </div>

                                 <button
                                    onClick={() => handleSelectJob(job.title)}
                                    className="px-6 py-3.5 rounded-full bg-white text-black font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105"
                                 >
                                    <span>Gửi Lệnh Ứng Tuyển</span>
                                    <ArrowRight className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>

                           {/* Details Accordion style (Visible on hover via CSS for cool effect or just static) */}
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 mt-8 border-t border-white/5 text-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                              <div>
                                 <h4 className="font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wide text-xs">
                                    <Terminal className="w-4 h-4 text-emerald-500" /> Yêu Cầu Chuyên Môn
                                 </h4>
                                 <ul className="space-y-2 text-zinc-400 font-mono text-xs">
                                    {job.requirements.map((req, i) => (
                                       <li key={i} className="flex items-start gap-2">
                                          <span className="text-emerald-500 mt-0.5">{'>'}</span> 
                                          <span className="leading-relaxed">{req}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>

                              <div>
                                 <h4 className="font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wide text-xs">
                                    <Sparkles className="w-4 h-4 text-emerald-500" /> Đặc Quyền Bổ Sung
                                 </h4>
                                 <ul className="space-y-2 text-zinc-400 font-mono text-xs">
                                    {job.benefits.map((ben, i) => (
                                       <li key={i} className="flex items-start gap-2">
                                          <span className="text-emerald-500 mt-0.5">{'>'}</span> 
                                          <span className="leading-relaxed">{ben}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </ScrollReveal>
                  ))}
               </div>
            </section>

            {/* 4. GLASSMORPHISM APPLICATION FORM */}
            <ScrollReveal animation="fade">
               <div id="apply-form-section" className="bg-[#111]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-10 scroll-mt-32 relative overflow-hidden">
                  
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                  <div className="border-b border-white/10 pb-6 relative z-10">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono mb-4 border border-emerald-500/20 uppercase tracking-widest">
                        <Send className="w-3.5 h-3.5" />
                        <span>SECURE SUBMISSION PROTOCOL</span>
                     </div>
                     <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Thiết Lập Hồ Sơ Ứng Tuyển</h2>
                     <p className="text-sm text-zinc-400 mt-2 font-mono">Dữ liệu được mã hóa E2E. Ban tuyển dụng sẽ liên hệ trong vòng 24-48 giờ.</p>
                  </div>

                  {applicationSuccess && (
                     <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-white space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                           <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                           <h3 className="text-xl font-black uppercase text-emerald-400">UPLOAD COMPLETE!</h3>
                        </div>
                        <p className="text-sm text-zinc-300 font-mono">
                           Hồ sơ của <strong>{applicationSuccess.candidateName}</strong> cho vị trí <strong>{applicationSuccess.jobPosition}</strong> đã được đồng bộ vào hệ thống.
                        </p>
                        <div className="p-4 bg-black/50 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                           <div>
                              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Mã Tra Cứu (Tracking ID):</span>
                              <div className="text-2xl font-mono font-black text-white mt-1">{applicationSuccess.code}</div>
                           </div>
                           <button
                              onClick={() => {
                                 setTrackQuery(applicationSuccess.code);
                                 setActiveTab('track');
                              }}
                              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                           >
                              <Search className="w-4 h-4" />
                              <span>Tra Cứu Lộ Trình Xét Duyệt</span>
                           </button>
                        </div>
                     </motion.div>
                  )}

                  {errorMessage && (
                     <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 relative z-10">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{errorMessage}</span>
                     </div>
                  )}

                  <form onSubmit={handleSubmitApplication} className="space-y-8 relative z-10">
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                           <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 group-focus-within:text-emerald-400 transition-colors">Vị Trí Ứng Tuyển *</label>
                           <select
                              value={selectedJob}
                              onChange={(e) => setSelectedJob(e.target.value)}
                              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
                           >
                              {JOB_POSITIONS.map((j) => (
                                 <option key={j.id} value={j.title}>{j.title}</option>
                              ))}
                              <option value="Khác (General Talent Pool)">Ứng Tuyển Vị Trí Khác (General Talent Pool)</option>
                           </select>
                        </div>

                        <div className="space-y-2 group">
                           <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 group-focus-within:text-emerald-400 transition-colors">Họ Tên Đầy Đủ *</label>
                           <input
                              type="text"
                              required
                              placeholder="Nhập tên của bạn..."
                              value={candidateName}
                              onChange={(e) => setCandidateName(e.target.value)}
                              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-zinc-600 shadow-inner"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 group">
                           <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 group-focus-within:text-emerald-400 transition-colors">Email *</label>
                           <input
                              type="email"
                              required
                              placeholder="email@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-zinc-600 font-mono"
                           />
                        </div>

                        <div className="space-y-2 group">
                           <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 group-focus-within:text-emerald-400 transition-colors">Số Điện Thoại *</label>
                           <input
                              type="tel"
                              required
                              placeholder="0988..."
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-zinc-600 font-mono"
                           />
                        </div>

                        <div className="space-y-2 group">
                           <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 group-focus-within:text-emerald-400 transition-colors">Mức Lương (Net)</label>
                           <input
                              type="text"
                              placeholder="Ví dụ: 30.000.000 đ"
                              value={expectedSalary}
                              onChange={(e) => setExpectedSalary(e.target.value)}
                              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-zinc-600 font-mono"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                           <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 group-focus-within:text-emerald-400 transition-colors">Kinh Nghiệm</label>
                           <select
                              value={experienceLevel}
                              onChange={(e) => setExperienceLevel(e.target.value)}
                              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                           >
                              <option value="Dưới 1 năm / Mới tốt nghiệp">Dưới 1 năm / Fresher</option>
                              <option value="1 - 2 năm">1 - 2 năm (Junior)</option>
                              <option value="2 - 3 năm">2 - 3 năm (Middle)</option>
                              <option value="3 - 5 năm">3 - 5 năm (Senior)</option>
                              <option value="Trên 5 năm (Lead / Expert)">Trêm 5 năm (Lead / Expert)</option>
                           </select>
                        </div>

                        <div className="space-y-2 group">
                           <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 group-focus-within:text-emerald-400 transition-colors">Portfolio / Github / Linkedin</label>
                           <input
                              type="url"
                              placeholder="https://github.com/..."
                              value={portfolioUrl}
                              onChange={(e) => setPortfolioUrl(e.target.value)}
                              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-zinc-600 font-mono"
                           />
                        </div>
                     </div>

                     {/* Upload Area */}
                     <div className="space-y-2">
                        <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400">Tải File CV (PDF / DOCX) *</label>
                        <input
                           type="file"
                           ref={fileInputRef}
                           onChange={handleFileChange}
                           accept=".pdf,.doc,.docx,.zip"
                           className="hidden"
                        />
                        <div 
                           onClick={() => fileInputRef.current?.click()}
                           className={`w-full p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${
                              cvFile 
                                 ? 'border-emerald-500 bg-emerald-500/5' 
                                 : 'border-white/20 bg-black/30 hover:border-emerald-500/50 hover:bg-black/60'
                           }`}
                        >
                           {cvFile ? (
                              <>
                                 <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <FileText className="w-8 h-8" />
                                 </div>
                                 <div className="text-center">
                                    <div className="text-sm font-bold text-white mb-1 font-mono">{cvFile.name}</div>
                                    <div className="text-xs text-zinc-500 font-mono">{(cvFile.size / (1024 * 1024)).toFixed(2)} MB • Nhấp để thay đổi</div>
                                 </div>
                              </>
                           ) : (
                              <>
                                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                                    <Upload className="w-8 h-8" />
                                 </div>
                                 <div className="text-center">
                                    <div className="text-sm font-bold text-white mb-1">Kéo thả hoặc nhấp để chọn file</div>
                                    <div className="text-xs text-zinc-500 font-mono">Dung lượng tối đa 25MB (PDF, DOCX)</div>
                                 </div>
                              </>
                           )}
                        </div>
                     </div>

                     <div className="space-y-2 group">
                        <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 group-focus-within:text-emerald-400 transition-colors">Cover Letter / Giới Thiệu Ngắn</label>
                        <textarea
                           rows={4}
                           placeholder="Hãy nói ngắn gọn vì sao bạn phù hợp với vị trí này..."
                           value={introduction}
                           onChange={(e) => setIntroduction(e.target.value)}
                           className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-zinc-600 resize-none font-mono"
                        ></textarea>
                     </div>

                     <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-5 bg-white text-black font-black text-lg uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {submitting ? (
                           <>
                              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                              <span>ENCRYPTING & SENDING...</span>
                           </>
                        ) : (
                           <>
                              <span>EXECUTE UPLOAD</span>
                              <Send className="w-5 h-5" />
                           </>
                        )}
                     </button>
                  </form>
               </div>
            </ScrollReveal>
          </motion.div>
        )}

        {/* ================= TAB 2: TRACK APPLICATION ================= */}
        {activeTab === 'track' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="bg-[#111]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-6 border border-emerald-500/20">
                  <Search className="w-10 h-10" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase">Kiểm tra Radar</h2>
                <p className="text-zinc-400 font-mono">Nhập mã hồ sơ (APP-xxxx) hoặc Email để truy xuất trạng thái mã hóa.</p>
              </div>

              <form onSubmit={handleTrackApplication} className="relative max-w-2xl mx-auto mb-12">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-emerald-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nhập mã APP-XXXX hoặc Email..."
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="w-full pl-16 pr-40 py-6 bg-black/60 border-2 border-white/10 rounded-full text-lg text-white font-mono focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all placeholder:text-zinc-600"
                />
                <div className="absolute inset-y-2 right-2">
                   <button
                     type="submit"
                     disabled={trackLoading}
                     className="h-full px-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2"
                   >
                     {trackLoading ? 'SEARCHING...' : 'PULL DATA'}
                   </button>
                </div>
              </form>

              {trackError && (
                <div className="max-w-2xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold flex justify-center items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{trackError}</span>
                </div>
              )}

              {/* Tra cứu Results */}
              {trackResults && trackResults.length > 0 && (
                <div className="space-y-8 mt-12 border-t border-white/10 pt-12">
                  <h3 className="text-xl font-black text-white text-center uppercase tracking-widest">
                     [{trackResults.length} RECORD(S) FOUND]
                  </h3>
                  
                  {trackResults.map((app: any, idx: number) => {
                    const currentStep = getPipelineStep(app.status);
                    const steps = [
                      { num: 1, title: 'Hồ Sơ Được Tiếp Nhận', desc: 'Đã lưu trữ an toàn.' },
                      { num: 2, title: 'Đang Xét Duyệt', desc: 'HR & Tech Lead đánh giá năng lực.' },
                      { num: 3, title: 'Đang Phỏng Vấn', desc: 'Bài test chuyên môn & Văn hóa.' },
                      { num: 4, title: app.status === 5 ? 'Chưa Phù Hợp' : 'Chào Đón Gia Nhập', desc: app.status === 5 ? 'Hẹn bạn ở cơ hội sau.' : 'Offer Letter đã được gửi.' }
                    ];

                    return (
                      <div key={idx} className="bg-black/40 rounded-3xl border border-white/10 p-6 sm:p-10">
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/10">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                               <div className="text-sm font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                                 {app.applicationCode}
                               </div>
                               <div className="text-xs text-zinc-500 font-mono">
                                 {new Date(app.appliedAt).toLocaleString('vi-VN')}
                               </div>
                            </div>
                            <h4 className="text-2xl font-black text-white">{app.candidateName}</h4>
                            <p className="text-zinc-400 font-mono text-sm mt-1">Apply for: {app.jobPosition}</p>
                          </div>
                          
                          <div className={`px-4 py-2 rounded-lg font-black text-sm border font-mono uppercase tracking-widest ${
                            app.status === 4 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            app.status === 5 ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}>
                            {app.status === 1 && 'RECEIVED'}
                            {app.status === 2 && 'REVIEWING'}
                            {app.status === 3 && 'INTERVIEWING'}
                            {app.status === 4 && 'ACCEPTED'}
                            {app.status === 5 && 'REJECTED'}
                          </div>
                        </div>

                        {/* Pipeline Progress */}
                        <div className="relative">
                           <div className="absolute top-6 left-6 right-6 h-1 bg-white/10 rounded-full hidden sm:block"></div>
                           <div 
                              className="absolute top-6 left-6 h-1 bg-emerald-500 rounded-full hidden sm:block transition-all duration-1000"
                              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                           ></div>

                           <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
                              {steps.map((step) => {
                                 const isActive = currentStep >= step.num;
                                 const isCurrent = currentStep === step.num;
                                 const isRejectedFinal = step.num === 4 && app.status === 5;
                                 
                                 let iconColor = isActive ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-[#111] text-zinc-600 border-white/10';
                                 if (isRejectedFinal) iconColor = 'bg-red-500 text-white border-red-500';

                                 return (
                                    <div key={step.num} className="flex flex-row sm:flex-col items-center sm:text-center gap-4 group">
                                       <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 shadow-xl transition-all duration-500 ${iconColor} ${isCurrent ? 'scale-110 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}`}>
                                          {isRejectedFinal ? <X className="w-5 h-5" /> : (isActive ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />)}
                                       </div>
                                       <div className="flex-1">
                                          <div className={`font-black text-sm uppercase ${isActive ? (isRejectedFinal ? 'text-red-400' : 'text-emerald-400') : 'text-zinc-500'}`}>
                                             {step.title}
                                          </div>
                                          <div className="text-[11px] text-zinc-500 font-mono mt-1 leading-relaxed">
                                             {step.desc}
                                          </div>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
