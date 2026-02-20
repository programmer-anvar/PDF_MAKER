# PDF Maker

PDF dizaynini yaratish: keylarni sidebar dan tortib sahifaga qo'yish, layout saqlash.

## Ishlatish

- `npm run dev` — Vite dev server (layout uchun `/api` → localhost:3001 ga proxy).
- `npm run server` — json-server `db.json` ni port 3001 da ishga tushiradi.

Layout saqlanadi: `GET/PUT /api/layout/1` → json-server (db.json).

## kefa-dev-front bilan

Agar **kefa-dev-front** da `/api` proxy qilinsa `http://localhost:3001` ga (xuddi pdf-maker dagi kabi), **bitta json-server** yetarli: pdf-maker da `npm run server` ni ishga tushirsangiz, kefa-dev-front ham shu `db.json` dan layout ni oladi. Dizayn pdf-maker da, sampling PDF kefa-dev-front da (layout + sampling ma'lumoti).
