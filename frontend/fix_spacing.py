import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# 1. Update max-w-7xl to w-full with larger horizontal padding
content = content.replace('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', 'w-full px-4 sm:px-6 lg:px-12 xl:px-20')

# 2. Update Left Nav to not be centered but aligned next to logo
old_desktop_nav = r"""\{\/\* Desktop nav \*\/\}\s*<nav className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0 h-full">"""
new_desktop_nav = """{/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 min-w-0 h-full ml-6">"""
content = re.sub(old_desktop_nav, new_desktop_nav, content)

# 3. Update the Right Nav structure
old_right_nav = r"""\{\/\* Right Nav \& CTA \*\/\}.*?<div className="flex items-center gap-2\.5 ml-2">"""
new_right_nav = """{/* Right Nav & CTA */}
          <div className="flex items-center gap-3 shrink-0 h-full">
            <nav className="hidden xl:flex items-center gap-3 text-[13px] text-slate-700 h-full mr-2">
              <Link href="/search" className="px-3 hover:text-black hover:underline decoration-1 underline-offset-[6px] flex items-center gap-2 transition-colors h-full">
                <span className="hidden lg:block font-semibold">Tìm kiếm</span> <Search className="w-3.5 h-3.5 text-slate-700" />
              </Link>
              <Link href="/knowledge-base" className="px-3 hover:text-black hover:underline decoration-1 underline-offset-[6px] transition-colors flex items-center h-full">Học hỏi</Link>
              <Link href="/support" className="px-3 hover:text-black hover:underline decoration-1 underline-offset-[6px] transition-colors flex items-center h-full">Ủng hộ</Link>
              <Link href="/contact" className="px-3 hover:text-black hover:underline decoration-1 underline-offset-[6px] transition-colors flex items-center h-full">Liên hệ bộ phận bán hàng</Link>
            </nav>

            <div className="flex items-center gap-2.5">"""
content = re.sub(old_right_nav, new_right_nav, content, flags=re.DOTALL)

# 4. Make "Cloud" bold and slightly bigger, matching Azure. Azure is 16px font-semibold.
content = content.replace('className="font-semibold text-slate-900 hidden sm:block tracking-wide text-base"', 'className="font-semibold text-slate-900 hidden sm:block tracking-wide text-[16px]"')

# 5. Make ChevronDown a tiny bit smaller (from w-3 to w-2.5 or w-[10px])
content = content.replace('w-3 h-3 ml-1.5 text-slate-500', 'w-[10px] h-[10px] ml-1.5 text-slate-500 mt-0.5')

# 6. Change hover border of buttons for consistency
content = content.replace('border border-slate-600 rounded-sm', 'border border-slate-900 rounded-sm')


with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
