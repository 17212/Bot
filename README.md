# IDRISIUM Corp – Facebook AI Bot

Offline-first، خصوصية، أداء عالٍ. "Mafish 2alb.. Fi bas Talaga". المؤسس: Idris Ghamid (Founder & Lead Developer).

## المكونات
- **client/**: React 19 + Vite + Tailwind 4 (وضع داكن، هوية IDRISIUM).
- **server/**: Express + tRPC + Zod + Drizzle schema (MySQL/TiDB).
- **api/**: دالة Serverless Vercel تلتف حول Express (`api/index.ts`).
- **drizzle/**: مخطط الجداول.
- **PROJECT_BLUEPRINT.md**: المعمارية الكاملة.

## متطلبات البيئة (أضفها في Vercel → Project Settings → Environment Variables)
```
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_ACCESS_TOKEN=your_access_token
FACEBOOK_VERIFY_TOKEN=your_verify_token
FACEBOOK_APP_SECRET=your_app_secret
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=3000
```

## أوامر العمل (Vercel يتولى التنفيذ آلياً)
- تثبيت: `pnpm install --frozen-lockfile=false`
- بناء العميل: `pnpm --filter facebook-ai-bot-client build` → ناتج `client/dist`
- بناء الخادم (اختياري محلياً): `pnpm --filter facebook-ai-bot-server build`
- تشغيل محلي (اختياري):
  - client: `cd client && pnpm dev`
  - server: `cd server && pnpm dev`

## النشر على Vercel (دون تشغيل محلي)
1) ادفع الكود إلى GitHub.
2) في Vercel: New Project → Import من المستودع.
3) Vercel سيقرأ `vercel.json`:
   - يبني العميل كـ static-build (`client/dist`).
   - ينشر الخادم كـ دالة Node (`api/index.ts`) مع Express/tRPC.
   - يوجه `/trpc/*` و`/api/*` إلى الدالة، وبقية المسارات إلى `client/dist`.
4) أضف متغيرات البيئة أعلاه ثم اضغط Deploy.
5) تحقق من `/api/health` للتأكد من حالة الخادم.

## ملاحظات
- أخطاء اللينت الحالية داخل IDE فقط لعدم وجود node_modules؛ تُحل عند تثبيت التبعيات في Vercel.
- الهوية البصرية: خلفية سوداء #000، أكسنت #39FF14، خطوط Orbitron/Cairo للعناوين وInter/Tajawal للنصوص.
- لا توجد أسرار مخزنة في الكود؛ كلها من env.

## الاعتمادات
IDRISIUM Corp — Idris Ghamid، Founder & Lead Developer. موقع: http://idrisium.linkpc.net/ | GitHub: https://github.com/IDRISIUM | TikTok/Instagram: @idris.ghamid | Telegram: @IDRV72 | Email: idris.ghamid@gmail.com
