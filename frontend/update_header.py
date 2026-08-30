import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# 1. Remove Top Bar
content = re.sub(r'\{\/\* Top Bar \(Secondary Actions\) \*\/\}.*?\{\/\* Main Nav \*\/\}', '{/* Main Nav */}', content, flags=re.DOTALL)

# 2. Update h-16 to h-[54px]
content = content.replace('h-16 flex items-center justify-between gap-4', 'h-[54px] flex items-center justify-between gap-4')

# 3. Update Brand area
old_brand = r"""\{\/\* Brand \*\/\}.*?<\/Link>"""
new_brand = """{/* Brand & Left Nav */}
          <div className="flex items-center gap-4 xl:gap-6 shrink-0 h-full">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <img
                src="/images/logo.png"
                alt="CloudHost VN"
                className="h-6 sm:h-7 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="w-[1px] h-4 bg-slate-300 hidden sm:block"></div>
              <span className="font-bold text-slate-800 hidden sm:block tracking-wide text-sm">Cloud</span>
            </Link>"""
content = re.sub(old_brand, new_brand, content, flags=re.DOTALL)

# 4. Change Desktop nav wrapper
old_desktop_nav = r"""\{\/\* Desktop nav \*\/\}\s*<nav className="hidden lg:flex flex-1 items-center justify-center gap-2 min-w-0">"""
new_desktop_nav = """{/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0 h-full">"""
content = content.replace(old_desktop_nav, new_desktop_nav)

# 5. Change "Trang chủ" link to "Khám phá"
old_trang_chu = r"""<Link\s*href="/"\s*className=\{`\$\{navLinkBase\} \$\{isHomeActive \? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900 font-bold'\}`\}\s*>\s*<span>Trang chủ<\/span>.*?(?=<div)"""
new_kham_pha = """<Link href="/explore" className="px-3 h-full flex items-center text-[13px] font-bold text-slate-600 hover:text-slate-900 border-b-2 border-transparent hover:border-[#d09e2b] transition-colors">
                Khám phá
              </Link>
              """
content = re.sub(old_trang_chu, new_kham_pha, content, flags=re.DOTALL)


# 6. Change "Dịch vụ" text to "Các sản phẩm"
content = content.replace('<span>Dịch vụ</span>', '<span>Các sản phẩm</span> <ChevronDown className="w-3.5 h-3.5 ml-1" />')

# 7. Change "Giải pháp" text to "Giải pháp" + Chevron
content = content.replace('<span>Giải pháp</span>', '<span>Giải pháp</span> <ChevronDown className="w-3.5 h-3.5 ml-1" />')

# 8. Change "Tin tức & Hỗ trợ" text to "Tài nguyên" + Chevron
content = content.replace('<span>Tin tức & Hỗ trợ</span>', '<span>Tài nguyên</span> <ChevronDown className="w-3.5 h-3.5 ml-1" />')

# 9. Insert "Giá cả" and "Đối tác" after Giải pháp
old_giai_phap_end = r"""\{\/\* Right Content \*\/\}.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>"""
# Wait, I need to insert them specifically after the Solutions dropdown div.
# Instead of regex, I'll find the position of the exact string for "Tin tức & Hỗ trợ" dropdown and insert before it.

# Update navLinkBase to have h-full and border-bottom styling
content = content.replace("const navLinkBase =\n    'relative px-3.5 py-2 text-xs transition-colors flex items-center shrink-0 bg-transparent';", "const navLinkBase =\n    'relative px-3 h-full text-[13px] transition-colors flex items-center shrink-0 bg-transparent border-b-2 border-transparent hover:border-[#d09e2b]';")
content = content.replace("const navLinkBase = 'relative px-3.5 py-2 text-xs transition-colors flex items-center shrink-0 bg-transparent';", "const navLinkBase = 'relative px-3 h-full text-[13px] transition-colors flex items-center shrink-0 bg-transparent border-b-2 border-transparent hover:border-[#d09e2b]';")


with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
