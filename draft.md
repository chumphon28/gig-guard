# Software Requirements Specification: GigGuard DAO (Commerce Edition)


**Project Name:** GigGuard DAO
**Concept:** The Trust Layer for Direct Booking & Marketplace

---


## 1. Project Objective
สร้างระบบตัวกลาง (Escrow Layer) สำหรับการสั่งซื้อสินค้าหรือจองที่พักโดยตรง (Direct Booking) เพื่อป้องกันปัญหาการโดนโกง รูปไม่ตรงปก หรือการยกเลิกโดยไม่เป็นธรรม โดยใช้ Smart Contract เป็นป้อมปราการล็อคเงินมัดจำ


---


## 2. Core Functional Requirements (Phase 1)

### 2.1 The Secure Checkout (ระบบน้องป้อมล็อคเงิน)
- **Escrow Deposit:** เมื่อลูกค้าสั่งของหรือจองโรงแรม เงินจะถูกล็อคไว้ในระบบ (ไม่ได้โอนให้ร้านค้าทันที)
- **Check-in/Arrival Confirmation:** - **กรณีจองที่พัก:** เงินจะปลดล็อคเมื่อลูกค้าทำการ Check-in หรือผ่านไป 24 ชม. หลังเข้าพัก
   - **กรณีสั่งของ:** เงินจะปลดล็อคเมื่อลูกค้ากดยืนยันได้รับสินค้าและตรวจสอบสภาพแล้ว
- **Auto-Refund:** หากร้านค้าไม่ส่งของหรือโรงแรมยกเลิกกะทันหัน เงินจะถูกคืนให้ลูกค้าอัตโนมัติ 100%


### 2.2 Decentralized Inspection (ระบบลูกขุนพิสูจน์ความจริง)
- **"Not as Described" Dispute:** หากสินค้าพัง หรือห้องพัก "ไม่ตรงปก" อย่างแรง ลูกค้ากดเปิด Dispute
- **Jury Verification:** ระบบสุ่มลูกขุน (Human Jury) เข้ามาดูหลักฐาน:
   - รูปถ่ายเทียบกับรูปโฆษณา
   - คลิปวิดีโอตอนแกะกล่องสินค้า
- **Fair Settlement:** ลูกขุนตัดสินว่าจะ "คืนเงินเต็มจำนวน", "คืนเงินบางส่วน" หรือ "ปลดล็อคเงินให้ร้านค้า"


### 2.3 Verified Merchant Score (On-chain Reputation)
- **Genuine Reviews:** เฉพาะคนที่เคยล็อคเงินและทำธุรกรรมสำเร็จเท่านั้นถึงจะรีวิวได้ (ป้องกันรีวิวปลอม)
- **Trust Badge:** ร้านค้าหรือโรงแรมที่จบงานผ่านน้องป้อมบ่อยๆ จะได้ตราสัญลักษณ์ "Porm-Verified"

---

## 3. Technical Stack
- **Integration:** Widget ที่สามารถไปแปะบนเว็บร้านค้า หรือหน้าเพจ Facebook/Line ของพ่อค้าแม่ค้าได้เลย

### 
- nextjs (ใช้ nextjs ทำทั้ง fe และ be ใน app เดียว ออกแบบ ui responsiveให้ด้วย )
- mongodb

---

## 4. Revenue Model
- **Transaction Fee:** 1-2% จากยอดธุรกรรม (ถูกกว่าแพลตฟอร์มใหญ่ๆ แต่ปลอดภัยกว่า)
  - can config // default 1%
- **Dispute Insurance:** ค่าธรรมเนียมเล็กน้อยเพื่อเป็นกองทุนประกันความเสี่ยง
  - คือเงินมัดจำ เช่น user A ต้องการซื้อของจาก User B และมีการวางมัดจำในระบบ เมื่อมีการทำธุระกรรม ระบบ โอนให้ user B และ user A ชำระส่วนที่เหลือให้ user B

---

## 5. Social Impact
- **SME Empowerment:** ช่วยให้ร้านค้าเล็กๆ หรือที่พักบูติกได้รับความเชื่อใจเท่ากับแบรนด์ใหญ่
- **Anti-Scam Ecosystem:** ลดวงจร "บัญชีม้า" ในการขายของออนไลน์ เพราะเงินจะถูกสตัฟฟ์ไว้ที่น้องป้อมก่อนเสมอ



## db

```
database: supabase
user: gig-guard
pass: EE86D4jsmwSQGEyv
 
connStr: postgresql://postgres:[YOUR-PASSWORD]@db.qhiipwjmozgijhwjtfxd.supabase.co:5432/postgres

```