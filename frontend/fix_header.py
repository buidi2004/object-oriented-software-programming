import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# 1. Insert "Giá cả" and "Đối tác"
insert_links = """
            <Link href="/pricing" className="px-3 h-full flex items-center text-[13px] font-bold text-slate-600 hover:text-slate-900 border-b-2 border-transparent hover:border-[#d09e2b] transition-colors">
              Giá cả
            </Link>
            <Link href="/partners" className="px-3 h-full flex items-center text-[13px] font-bold text-slate-600 hover:text-slate-900 border-b-2 border-transparent hover:border-[#d09e2b] transition-colors">
              Đối tác
            </Link>
"""
# Find the end of the Solutions dropdown (the div before "Tài nguyên Dropdown")
# Wait, "Tin tức & Hỗ trợ Dropdown" was changed to "Tài nguyên" text but the comment might still be "Tin tức & Hỗ trợ Dropdown"
content = content.replace('{/* Tin tức & Hỗ trợ Dropdown */}', insert_links + '\n            {/* Tin tức & Hỗ trợ Dropdown */}')


# 2. Add Right Navigation & new CTAs
old_action_icons = r"""\{\/\* Action Icons & Profile \*\/\}\s*<div className="flex items-center gap-2 sm:gap-3 shrink-0">.*?<\/div>\s*<\/div>\s*\{\/\* Hỗ trợ \*\/\}.*?<\/div>"""

# Wait, the action icons block is very long. I will just replace from `\{/\* Action Icons & Profile \*/\}` until `\{/\* Mobile Menu \*/\}` or `{mobileMenuOpen && (`
old_right_side = r"""\{\/\* Action Icons & Profile \*\/\}.*?(?=\{\mobileMenuOpen && \()"""

new_right_side = """{/* Right Nav & CTA */}
          <div className="flex items-center gap-4 shrink-0 h-full">
            <nav className="hidden xl:flex items-center gap-4 text-[13px] font-bold text-slate-600 h-full">
              <Link href="/search" className="hover:text-[#d09e2b] flex items-center gap-1 transition-colors h-full">
                <Search className="w-3.5 h-3.5" /> Tìm kiếm
              </Link>
              <Link href="/knowledge-base" className="hover:text-[#d09e2b] transition-colors flex items-center h-full">Học hỏi</Link>
              <Link href="/support" className="hover:text-[#d09e2b] transition-colors flex items-center h-full">Ủng hộ</Link>
              <Link href="/contact" className="hover:text-[#d09e2b] transition-colors flex items-center h-full">Liên hệ bộ phận bán hàng</Link>
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={() => handleOpenAuth('login')} className="px-3 py-1.5 border border-slate-300 rounded text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors hidden sm:block">Đăng nhập</button>
              <button onClick={() => handleOpenAuth('register')} className="px-3 py-1.5 bg-[#d09e2b] text-white rounded text-[13px] font-bold hover:bg-[#b58825] transition-colors hidden sm:block">Bắt đầu sử dụng Cloud</button>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        """
content = re.sub(old_right_side, new_right_side, content, flags=re.DOTALL)

# Delete the separate links like "Tài liệu", "Liên hệ" and "Hỗ trợ" dropdown which are no longer needed
# I will do this manually by replacing them with empty string.
content = re.sub(r"""<Link\s*href="/knowledge-base".*?<\/Link>""", "", content, flags=re.DOTALL)
content = re.sub(r"""<Link\s*href="/contact".*?<\/Link>""", "", content, flags=re.DOTALL)
content = re.sub(r"""<div\s*className="relative shrink-0"\s*onMouseEnter=\{.*?setSupportDropdownOpen.*?<\/div>""", "", content, flags=re.DOTALL)


with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
