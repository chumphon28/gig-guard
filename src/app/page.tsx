import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NONG POMz" className="h-10 w-auto" />
            <span className="text-[17px] font-extrabold tracking-tight text-on-surface">NONG POMz</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-[13px] font-bold text-on-surface-variant hover:text-on-surface transition-colors">
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="px-4 py-2 brand-gradient text-white rounded-full text-[13px] font-bold hover:opacity-90 transition-all shadow-sm">
              เริ่มใช้งานฟรี
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-16 overflow-hidden">
        <div className="brand-gradient min-h-[580px] flex items-center relative">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-6 py-20 md:py-28 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse" />
                <span className="text-white/90 text-[12px] font-bold uppercase tracking-widest">Trust Layer สำหรับ P2P</span>
              </div>
              <h1 className="text-[38px] md:text-[52px] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                ซื้อ-ขายออนไลน์<br />
                <span className="text-secondary-fixed-dim">ปลอดภัย</span> กว่าที่เคย
              </h1>
              <p className="text-white/75 text-[17px] leading-relaxed mb-8 max-w-[480px]">
                NONG POMz เป็นระบบ Escrow กลางสำหรับการซื้อ-ขายระหว่างบุคคล
                เงินถูกพักไว้ในกระเป๋ากลางจนกว่า Buyer ยืนยันรับของ — ทั้ง Buyer และ Seller จึงปลอดภัย
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 green-gradient text-white rounded-full font-bold text-[15px] hover:opacity-90 transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  เริ่มใช้งานฟรี
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/15 border border-white/30 text-white rounded-full font-bold text-[15px] hover:bg-white/25 transition-all"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            </div>

            {/* Right: mock deal card */}
            <div className="hidden md:block">
              <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-[360px] ml-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-on-surface text-[14px]">ขาย iPhone 15 Pro Max</p>
                    <p className="text-[11px] text-on-surface-variant">DEAL #A4F2C8B1</p>
                  </div>
                  <span className="ml-auto px-2.5 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase">ยืนยันแล้ว</span>
                </div>

                {/* Steps */}
                <div className="space-y-3 mb-5">
                  {[
                    { icon: 'check_circle', label: 'Seller สร้าง Deal', done: true },
                    { icon: 'check_circle', label: 'Buyer โอนเงิน ฿42,000', done: true },
                    { icon: 'check_circle', label: 'Seller ยืนยันและจัดส่ง', done: true },
                    { icon: 'radio_button_unchecked', label: 'Buyer ยืนยันรับของ', done: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-[18px] ${s.done ? 'text-secondary' : 'text-outline'}`}
                        style={s.done ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        {s.icon}
                      </span>
                      <span className={`text-[13px] font-semibold ${s.done ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Amount */}
                <div className="bg-surface-container-low rounded-2xl p-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">ยอดรวม</p>
                    <p className="text-[18px] font-extrabold text-on-surface">฿42,000</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">wallet</span>กระเป๋ากลาง
                    </p>
                    <p className="text-[18px] font-extrabold text-secondary">฿42,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="h-12 brand-gradient relative">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none">
            <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-white py-10 border-b border-outline-variant">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100%', label: 'เงินปลอดภัยในกระเป๋ากลาง', icon: 'lock' },
              { value: '0 บาท', label: 'ค่าใช้จ่ายเริ่มต้น', icon: 'payments' },
              { value: '< 1 นาที', label: 'เวลาสร้าง Deal', icon: 'speed' },
              { value: '1%', label: 'Fee ต่อ Deal', icon: 'percent' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">{s.icon}</span>
                </div>
                <p className="text-[28px] font-extrabold text-on-surface">{s.value}</p>
                <p className="text-[13px] text-on-surface-variant font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 bg-background">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-primary text-[12px] font-extrabold uppercase tracking-widest mb-3">วิธีใช้งาน</p>
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-on-surface leading-tight">
              ง่าย 3 ขั้นตอน
            </h2>
            <p className="text-on-surface-variant mt-3 text-[16px] max-w-[480px] mx-auto">
              ไม่ต้องมีทักษะเทคนิค สร้าง Deal และแชร์ลิงก์ได้ทันที
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-outline-variant z-0" />

            {[
              {
                step: '01',
                icon: 'add_circle',
                title: 'Seller สร้าง Deal',
                desc: 'กรอกชื่อสินค้า ราคา และข้อมูลบัญชีรับโอน ระบบสร้างลิงก์ให้ทันที',
                color: 'bg-primary-container',
                textColor: 'text-primary',
              },
              {
                step: '02',
                icon: 'wallet',
                title: 'Buyer โอนเงินเข้ากระเป๋ากลาง',
                desc: 'Buyer กด Join Deal และโอนเงินเต็มจำนวนเข้าบัญชีกระเป๋ากลาง ก่อนรับของ',
                color: 'bg-secondary-container',
                textColor: 'text-on-secondary-container',
              },
              {
                step: '03',
                icon: 'lock_open',
                title: 'ยืนยันรับของ — ปลดล็อกเงิน',
                desc: 'เมื่อ Buyer ได้รับของและยืนยัน ระบบโอนเงินให้ Seller ทันที',
                color: 'bg-tertiary-container',
                textColor: 'text-on-tertiary-container',
              },
            ].map((item, i) => (
              <div key={i} className="relative z-10 bg-white rounded-2xl p-6 border border-outline-variant shadow-card text-center">
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <span className={`material-symbols-outlined ${item.textColor} text-[28px]`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {item.icon}
                  </span>
                </div>
                <div className={`inline-block px-2 py-0.5 ${item.color} ${item.textColor} rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3`}>
                  ขั้นตอน {item.step}
                </div>
                <h3 className="text-[16px] font-extrabold text-on-surface mb-2">{item.title}</h3>
                <p className="text-[14px] text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left text */}
            <div>
              <p className="text-secondary text-[12px] font-extrabold uppercase tracking-widest mb-3">ทำไมต้องเลือก NONG POMz</p>
              <h2 className="text-[32px] md:text-[38px] font-extrabold text-on-surface leading-tight mb-6">
                ปกป้องทั้ง<br />Buyer และ Seller
              </h2>
              <p className="text-on-surface-variant text-[16px] leading-relaxed mb-8">
                ปัญหาหลักของการซื้อ-ขายออนไลน์คือความไม่ไว้วางใจกัน NONG POMz แก้ปัญหานี้ด้วยระบบ Escrow ที่โปร่งใส ตรวจสอบได้ทุกขั้นตอน
              </p>
              <div className="space-y-4">
                {[
                  { icon: 'verified_user', title: 'Buyer ปลอดภัย', desc: 'เงินถูกพักในกระเป๋ากลาง ไม่ถึงมือ Seller จนกว่าจะได้รับของ' },
                  { icon: 'store', title: 'Seller ปลอดภัย', desc: 'ระบบยืนยันว่า Buyer โอนเงินแล้วก่อน Seller จัดส่ง ไม่มีการโกง' },
                  { icon: 'gavel', title: 'มีระบบ Dispute', desc: 'หากมีปัญหา Buyer เปิด Dispute ได้ Admin ตัดสินเป็นกลาง' },
                  { icon: 'link', title: 'แชร์ลิงก์ง่าย', desc: 'ไม่ต้อง Install App สร้าง Deal และส่งลิงก์ให้คู่ค้าได้เลย' },
                ].map(f => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-[15px]">{f.title}</p>
                      <p className="text-on-surface-variant text-[13px] mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: 'lock', label: 'เงินปลอดภัย', desc: 'Escrow ระดับมืออาชีพ', bg: 'brand-gradient', text: 'text-white', subtext: 'text-white/70' },
                { icon: 'receipt_long', label: 'ติดตามสถานะ', desc: 'Stepper ชัดเจนทุกขั้น', bg: 'bg-secondary-container', text: 'text-on-secondary-container', subtext: 'text-on-secondary-container/70' },
                { icon: 'speed', label: 'เริ่มได้เลย', desc: 'ไม่ต้องรอ approval', bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', subtext: 'text-on-tertiary-container/70' },
                { icon: 'star', label: 'ระบบรีวิว', desc: 'ดู reputation ก่อนตัดสินใจ', bg: 'bg-surface-container-high', text: 'text-on-surface', subtext: 'text-on-surface-variant' },
              ].map(c => (
                <div key={c.label} className={`${c.bg} rounded-2xl p-5 flex flex-col gap-3`}>
                  <span className={`material-symbols-outlined ${c.text} text-[28px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                  <div>
                    <p className={`font-extrabold text-[15px] ${c.text}`}>{c.label}</p>
                    <p className={`text-[12px] mt-0.5 ${c.subtext}`}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section className="py-20 bg-background">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-primary text-[12px] font-extrabold uppercase tracking-widest mb-3">Use Cases</p>
            <h2 className="text-[32px] md:text-[38px] font-extrabold text-on-surface">ใช้ได้กับทุกการซื้อ-ขาย</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'directions_car', label: 'รถมือสอง', desc: 'ซื้อ-ขายรถ มูลค่าสูง ต้องการความมั่นใจ' },
              { icon: 'smartphone', label: 'มือถือ / IT', desc: 'อุปกรณ์อิเล็กทรอนิกส์ ของมือสองทั่วไป' },
              { icon: 'cottage', label: 'อสังหาฯ', desc: 'มัดจำบ้าน คอนโด ที่ดิน' },
              { icon: 'handyman', label: 'Freelance', desc: 'จ้างงาน รับงาน มีสัญญาอิเล็กทรอนิกส์' },
            ].map(u => (
              <div key={u.label} className="bg-white rounded-2xl p-5 border border-outline-variant shadow-card text-center hover:shadow-card-hover hover:border-primary/20 transition-all">
                <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-white text-[24px]">{u.icon}</span>
                </div>
                <p className="font-extrabold text-on-surface text-[15px] mb-1">{u.label}</p>
                <p className="text-on-surface-variant text-[12px]">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="brand-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="max-w-[640px] mx-auto px-6 text-center relative z-10">
          <img src="/logo.png" alt="NONG POMz" className="h-20 w-auto mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-[32px] md:text-[40px] font-extrabold text-white leading-tight mb-4">
            พร้อมซื้อ-ขายอย่างปลอดภัย?
          </h2>
          <p className="text-white/75 text-[16px] mb-8">
            เริ่มต้นสร้าง Deal แรกได้เลย ไม่มีค่าใช้จ่าย ไม่ต้อง Install App
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 green-gradient text-white rounded-full font-extrabold text-[15px] hover:opacity-90 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              เริ่มใช้งานฟรี
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 border border-white/30 text-white rounded-full font-bold text-[15px] hover:bg-white/25 transition-all"
            >
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-on-surface py-10">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NONG POMz" className="h-8 w-auto" />
            <span className="text-[14px] font-extrabold tracking-tight text-white">NONG POMz</span>
          </div>
          <p className="text-inverse-on-surface/50 text-[13px]">
            The Trust Layer for P2P Transactions
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-inverse-on-surface/60 text-[13px] font-semibold hover:text-white transition-colors">เข้าสู่ระบบ</Link>
            <Link href="/register" className="text-inverse-on-surface/60 text-[13px] font-semibold hover:text-white transition-colors">สมัครสมาชิก</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
