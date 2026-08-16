<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ZeroUp — loyiha qoidalari (Next.js blokidan tashqari, qo'lda yozilgan)

Bu qism `<!-- END:nextjs-agent-rules -->` belgisidan keyin joylashadi, shuning
uchun `next dev` uni qayta yozib yubormaydi va o'chirib tashlamaydi.

## Jamoa bo'linishi

- **Frontend dasturchi** — UI, sahifalar, komponentlar, kontekstlar ustida ishlaydi
- **Backend dasturchi** — server logikasi, API route'lar, ma'lumotlar bazasi bilan ishlaydi

## Mas'uliyat chegaralari

### Frontend zonasi (faqat frontend dasturchi tegadi)
```
src/app/**/page.tsx
src/app/**/layout.tsx
src/components/**
src/contexts/**
src/styles/**
public/**
```

### Backend zonasi (faqat backend dasturchi tegadi)
```
src/app/api/**/route.ts
src/lib/db/**
src/lib/server/**
prisma/**
.env* (server o'zgaruvchilari)
```

### Umumiy / ehtiyot bilan (ikkovi ham tegishi mumkin, lekin oldindan xabar berib)
```
src/types/**          (interfeys/type o'zgarsa ikkalasiga ham ta'sir qiladi)
src/lib/shared/**
package.json          (yangi paket qo'shishdan oldin xabar bering)
```

## Claude Code uchun asosiy qoida

> **MUHIM:** Agar so'ralgan o'zgarish "Backend zonasi"ga tegishli bo'lsa va
> foydalanuvchi frontend dasturchi bo'lsa (yoki aksincha), avval
> ogohlantirish va tasdiqlashni so'ra, avtomatik o'zgartirma. Masalan:
> "Bu o'zgarish `src/app/api/grader/route.ts` fayliga tegadi — bu backend
> zonasi. Davom etaversammi?"

## Git ish tartibi (ikkala kompyuter uchun umumiy)

1. Ish boshlashdan oldin har doim: `git pull`
2. Kichik va tez-tez commitlar qiling
3. Push qilishdan oldin yana bir bor `git pull` qiling (konfliktni oldini olish uchun)
4. Agar `src/types/` yoki `package.json` o'zgarsa — boshqa tomonga alohida xabar bering (chat/Slack orqali)
5. Merge conflict chiqsa, konfliktni tahlil qilib, ikkala tomon o'zgarishini
   mantiqan birlashtir

## Branch nomlash

- `frontend-dev` — frontend dasturchi ishlaydigan branch
- `backend-dev` — backend dasturchi ishlaydigan branch (agar shunday bo'linish bo'lsa)
- `main` — ikkalasi ham test qilib, kelishib merge qiladigan barqaror branch
