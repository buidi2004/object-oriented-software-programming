import React from 'react';
import { Globe2 } from 'lucide-react';

export const HomePartnersGlobe = () => {
  return (
    <section className="py-12 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-10 items-center">
          
          {/* Partners Left */}
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 md:mb-8 text-center md:text-left">Đối tác</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 sm:gap-4">
              <LogoImage src="https://icon.horse/icon/microsoft.com" alt="Microsoft" />
              <LogoImage src="https://icon.horse/icon/aws.amazon.com" alt="AWS" />
              <LogoImage src="https://icon.horse/icon/cloud.google.com" alt="Google Cloud" />
              <LogoImage src="https://icon.horse/icon/vmware.com" alt="VMware" />
              <LogoImage src="https://icon.horse/icon/fortinet.com" alt="Fortinet" />
              <LogoImage src="https://icon.horse/icon/veeam.com" alt="Veeam" />
            </div>
          </div>

          {/* Center Globe (Realistic 3D Earth) */}
          <div className="flex justify-center relative py-6 md:py-0">
            <div className="absolute inset-0 bg-slate-100/50 rounded-full blur-3xl" />
            <div className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full shadow-[0_0_50px_rgba(37,99,235,0.2)] flex items-center justify-center relative z-10">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/2/22/Earth_Western_Hemisphere_transparent_background.png" 
                alt="Realistic Earth" 
                className="w-full h-full object-contain animate-[spin_60s_linear_infinite]"
              />
            </div>
          </div>

          {/* Customers Right */}
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 md:mb-8 text-center md:text-right">Khách hàng</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 sm:gap-4">
              <LogoImage src="https://icon.horse/icon/vtv.vn" alt="VTV" />
              <LogoImage src="https://icon.horse/icon/mbbank.com.vn" alt="MB Bank" />
              <LogoImage src="https://icon.horse/icon/shopee.vn" alt="Shopee" />
              <LogoImage src="https://icon.horse/icon/fpt.com.vn" alt="FPT" />
              <LogoImage src="https://icon.horse/icon/vingroup.net" alt="Vingroup" />
              <div className="h-14 sm:h-16 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-sm font-black text-[#1F1F1F] shadow-xs cursor-pointer hover:scale-105 transition-transform">
                25,000+
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const LogoImage = ({ src, alt }: { src: string, alt: string }) => (
  <div className="h-16 bg-white border border-slate-100 rounded flex items-center justify-center p-3 hover:border-slate-300 transition-all shadow-xs hover:shadow-md cursor-pointer group">
    <img src={src} alt={alt} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300" />
  </div>
);
