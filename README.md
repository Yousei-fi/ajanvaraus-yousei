# ajanvaraus.yousei.fi

Express + Vue 3 ajanvaraus (booking) MVP, valmis Coolify-deployhin. Taustalla Prisma/PostgreSQL + Google Calendar (Meet) -integraatio jotka kirjaavat tapaamiset sekä julkiseen **AJANVARAUS_CAL_ID**-kalenteriin että omaan `primary`-kalenteriin.

## Projektirakenne

```
ajanvaraus-yousei/
├─ backend/           # Node/Express + Prisma API
├─ frontend/          # Vue 3 (Vite) SPA + FullCalendar + Tailwind CSS
└─ docker-compose.yml # paikallinen stack / Coolify-palvelu
```

## Kehitysympäristö

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

Frontend palvelee osoitteessa `http://localhost:5173`, backend `http://localhost:8090`.

## Ympäristömuuttujat (`backend/.env`)

```
PORT=8090
DATABASE_URL=postgresql://user:pass@host:5432/ajanvaraus
AJANVARAUS_CAL_ID=your_calendar_id@group.calendar.google.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://ajanvaraus.yousei.fi/api/oauth2/callback
GOOGLE_ACCESS_TOKEN=...
GOOGLE_REFRESH_TOKEN=...
JWT_SECRET=supersecret
ALLOWED_ORIGIN=https://ajanvaraus.yousei.fi
```

Lisäksi frontendin buildissa (Vite) pitää asettaa `VITE_API_BASE`, esim. tuotannossa `https://ajanvaraus.yousei.fi/api` ja paikallisesti `http://localhost:8090/api`.

## Google API -integraatio

* OAuth2 client (Web) jossa redirect `https://ajanvaraus.yousei.fi/api/oauth2/callback`.
* Scopet: `https://www.googleapis.com/auth/calendar.events` + offline access.
* Luo erillinen **Ajanvaraukset**-kalenteri ja täytä sen ID `AJANVARAUS_CAL_ID`-muuttujaan.
* Hae kertaluonteisesti `GOOGLE_ACCESS_TOKEN` + `GOOGLE_REFRESH_TOKEN` käyttäen yllä olevia tunnuksia.

## Docker & Coolify

Paikallinen ajelu (sisältää Postgres 16):

```bash
cd /home/yousei/repos/ajanvaraus-yousei
cp backend/.env.example backend/.env   # täytä arvot
docker compose up --build
```

Coolifyssä luo kaksi palvelua (backend + frontend static). Voit käyttää samoja Dockerfilejä ja `docker-compose.yml`:ää pohjana:

* **Backend**: Node-palvelu `backend/Dockerfile` → käynnistä komennolla `npx prisma migrate deploy && node dist/index.js`. Muista liittää PostgreSQL ja `.env`-muuttujat.
* **Frontend**: Static build `frontend/Dockerfile`. Aseta build-arg `VITE_API_BASE=https://ajanvaraus.yousei.fi/api`. Julkaise domainiin `ajanvaraus.yousei.fi` ja varmista, että backend on saatavilla `/api`-polussa.

## Admin token

Generoi backendissä Node REPLissä:

```bash
node -e "import('./dist/auth.js').then(m => console.log(m.signAdminToken()))"
```

Aseta token Admin-näkymässä `Authorization: Bearer <token>`.

## GitHub-julkaisu (Yousei-fi -org)

1. Luo uusi tyhjä repo GitHubissa organisaation alle, esim. `Yousei-fi/ajanvaraus-yousei`.
2. Lisää origin tälle projektille:
   ```bash
   cd /home/yousei/repos/ajanvaraus-yousei
   git init
   git remote add origin git@github.com:Yousei-fi/ajanvaraus-yousei.git
   git add .
   git commit -m "feat: ajanvaraus MVP"
   git push -u origin main
   ```
3. Liitä Coolify-projektit kyseiseen repoonsa ja automatisoi deploy.

## Seuraavat sprintit

* FreeBusy-check myös `primary`-kalenterista ennen varausta.
* Peruutuslinkki ja tapahtumien poisto.
* Säätö UI: FullCalendar event renderer.
* hCaptcha/Rate limiting.
* Monikielisyys (fi/en) ja custom sähköpostit.
