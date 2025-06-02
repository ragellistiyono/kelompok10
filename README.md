# 📋 Aspri - AI-Powered Task Management Application

## 🌟 Deskripsi Proyek

**Aspri** adalah aplikasi manajemen tugas (task management) yang canggih dan modern dengan integrasi kecerdasan buatan (AI). Aplikasi ini dirancang untuk membantu pengguna mengorganisir tugas-tugas harian mereka dengan lebih efisien menggunakan berbagai fitur inovatif seperti asisten AI, voice-to-text, dan dukungan multi-bahasa.

Proyek ini dikembangkan oleh **Kelompok 10** dalam mata kuliah **Workshop Pengembangan Perangkat Lunak (WPPL)** sebagai bagian dari Semester 4.

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - Library JavaScript untuk membangun user interface
- **TypeScript** - Superset JavaScript dengan type safety
- **Vite 6.0.4** - Build tool dan development server yang cepat
- **Tailwind CSS 3.4.16** - Utility-first CSS framework untuk styling
- **React Router DOM 6.8.1** - Routing untuk aplikasi React
- **React i18next 14.1.0** - Internationalization framework untuk multi-bahasa

### UI Components & Libraries
- **Radix UI** - Komponen UI yang accessible dan customizable
  - `@radix-ui/react-avatar`
  - `@radix-ui/react-separator` 
  - `@radix-ui/react-slot`
  - `@radix-ui/react-tabs`
- **Lucide React 0.453.0** - Icon library
- **Class Variance Authority** - Utility untuk variant styling
- **Date-fns 4.1.0** - Library untuk manipulasi tanggal

### Backend
- **Node.js** dengan **TypeScript**
- **Express.js 4.18.3** - Web framework untuk Node.js
- **Prisma 5.11.0** - ORM untuk database management
- **CORS 2.8.5** - Middleware untuk Cross-Origin Resource Sharing
- **dotenv 16.4.5** - Environment variables management

### Development Tools
- **ESBuild 0.24.0** - Fast JavaScript bundler
- **Nodemon** - Development server dengan auto-restart
- **ts-node** - TypeScript execution environment

### Deployment
- **Netlify** - Frontend hosting dan deployment
- **SPA (Single Page Application)** configuration

## ✨ Fitur-Fitur Utama

### 🎯 Manajemen Tugas Komprehensif
- **Tambah Tugas** - Membuat tugas baru dengan detail lengkap
- **Kategorisasi** - Organisasi tugas berdasarkan kategori (Personal, Work)
- **Prioritas** - Sistem prioritas untuk tugas (High, Medium, Low)
- **Due Date** - Penjadwalan tugas dengan tanggal tenggat
- **Status Tracking** - Pelacakan status tugas (Pending, In Progress, Completed)

### 🗂️ Organisasi Berdasarkan Waktu
- **Tugas Hari Ini** - Menampilkan tugas yang harus diselesaikan hari ini
- **Tugas Besok** - Preview tugas untuk hari berikutnya
- **Tugas Mendatang** - Daftar tugas yang akan datang
- **Semua Tugas** - Tampilan komprehensif semua tugas
- **Tugas Selesai** - Archive tugas yang telah diselesaikan

### 🤖 Asisten AI (Ask Aspri)
- **Multi-Provider AI** - Dukungan untuk beberapa provider AI:
  - Google Gemini API
  - OpenAI GPT
  - Anthropic Claude
  - DeepSeek API
- **Intelligent Task Assistance** - AI membantu dalam perencanaan dan optimisasi tugas
- **Natural Language Processing** - Pemahaman bahasa natural untuk interaksi yang lebih intuitif
- **Task Suggestions** - Rekomendasi tugas berdasarkan pattern dan konteks

### 🎤 Voice-to-Text
- **Speech Recognition** - Konversi suara menjadi teks untuk input tugas
- **Real-time Processing** - Proses konversi suara secara real-time
- **Multi-language Support** - Dukungan pengenalan suara dalam berbagai bahasa

### 🌐 Multi-Language Support
- **3 Bahasa Didukung:**
  - 🇺🇸 English (Bahasa Inggris)
  - 🇮🇩 Bahasa Indonesia
  - 🇯🇵 日本語 (Bahasa Jepang)
- **Dynamic Language Switching** - Pergantian bahasa secara real-time
- **Localized Content** - Konten yang disesuaikan dengan budaya lokal

### 🔍 Pencarian & Filter
- **Advanced Search** - Pencarian tugas berdasarkan judul, deskripsi, atau kategori
- **Smart Filtering** - Filter berdasarkan status, prioritas, kategori, dan tanggal
- **Real-time Results** - Hasil pencarian yang update secara real-time

### 💾 Local Storage & Offline Mode
- **Offline Capability** - Aplikasi tetap berfungsi tanpa koneksi internet
- **Local Data Persistence** - Penyimpanan data lokal dengan browser localStorage
- **Sync Management** - Sinkronisasi data ketika koneksi tersedia
- **Data Export/Import** - Backup dan restore data tugas

### 🎨 Formalization & Standardization
- **Task Templates** - Template tugas untuk konsistensi
- **Standardized Format** - Format tugas yang terstandarisasi
- **Bulk Operations** - Operasi massal pada multiple tugas
- **Data Validation** - Validasi input untuk integritas data

### 📱 Responsive Design
- **Mobile-First Approach** - Design yang mengutamakan pengalaman mobile
- **Cross-Device Compatibility** - Kompatibel di desktop, tablet, dan smartphone
- **Adaptive UI** - Interface yang menyesuaikan ukuran layar
- **Touch-Friendly** - Optimized untuk interaksi touch

## 🏗️ Arsitektur Aplikasi

### Frontend Architecture
```
src/
├── components/          # Reusable components
│   ├── ui/             # UI components (buttons, cards, etc.)
│   ├── LanguageSelector.tsx
│   └── UserProfile.tsx
├── screens/            # Main application screens
│   └── Desktop/        # Desktop layout
├── lib/                # Utility functions & services
│   ├── api.ts          # API communication
│   ├── aiService.ts    # AI integration
│   ├── categoryUtils.ts # Category management
│   ├── dateTime.ts     # Date utilities
│   └── taskUtils.ts    # Task utilities
├── i18n/               # Internationalization
│   └── locales/        # Language files
└── index.tsx           # Application entry point
```

### Backend Architecture
```
backend/
├── src/
│   ├── routes/         # API routes
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── services/       # Business logic
│   ├── models/         # Data models
│   ├── utils/          # Utility functions
│   └── config/         # Configuration files
├── prisma/             # Database schema & migrations
└── package.json        # Dependencies & scripts
```

## 🚀 Cara Menjalankan Aplikasi

### Prerequisites
- **Node.js** (versi 18 atau lebih baru)
- **npm** atau **yarn** package manager
- **Git** untuk version control

### 1. Clone Repository
```bash
git clone <repository-url>
cd project
```

### 2. Setup Frontend
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Aplikasi akan berjalan di: [http://localhost:5173/](http://localhost:5173/)

### 3. Setup Backend (Optional)
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env file dengan konfigurasi database dan API keys

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend akan berjalan di: [http://localhost:3000/](http://localhost:3000/)

### 4. Build untuk Production
```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
npm start
```

## 🔧 Konfigurasi Environment

### Frontend Environment Variables
Buat file `.env` di root directory:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_CLAUDE_API_KEY=your_claude_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Backend Environment Variables
Buat file `.env` di folder `backend/`:
```env
DATABASE_URL="your_database_connection_string"
JWT_SECRET=your_jwt_secret
API_PORT=3000
NODE_ENV=development
```

## 📊 Business Value Analysis

Proyek ini dirancang dengan fokus pada lima jenis business value:

### 1. **Nilai Efisiensi** 🚀
- Manajemen task yang terorganisir menghemat waktu pengguna
- Kategorisasi otomatis mengurangi overhead administratif
- Tampilan berdasarkan waktu meningkatkan fokus dan produktivitas

### 2. **Nilai Pasar** 🎯
- Integrasi AI memberikan competitive advantage
- Multi-language support memperluas target market
- Modern tech stack menarik early adopters

### 3. **Nilai Pelanggan** ❤️
- Voice-to-text meningkatkan aksesibilitas
- Offline mode menjamin reliabilitas
- Responsive design memberikan user experience yang konsisten

### 4. **Nilai Masa Depan** 🔮
- Arsitektur modular memudahkan pengembangan fitur baru
- API-first approach memungkinkan integrasi eksternal
- Data standardization membuka peluang analytics

### 5. **Nilai Komersial** 💰
- Model freemium dengan fitur premium
- Integrasi dengan enterprise tools
- Subscription-based advanced features

## 🎨 Design System

### Color Palette
- **Primary**: Modern blue tones untuk aksi utama
- **Secondary**: Gray scale untuk konten sekunder  
- **Accent**: Green untuk success, Red untuk urgent tasks
- **Background**: Clean white/light gray dengan dark mode support

### Typography
- **Headings**: Clear hierarchy dengan font weights yang konsisten
- **Body Text**: Readable dengan proper line spacing
- **Monospace**: Untuk code dan technical content

### Components
- **Consistent spacing** menggunakan Tailwind CSS utilities
- **Accessible design** dengan proper ARIA labels
- **Interactive states** dengan hover/focus indicators

## 🔐 Security Features

- **Input Validation** - Validasi semua input pengguna
- **XSS Protection** - Proteksi dari Cross-Site Scripting
- **CORS Configuration** - Pengaturan Cross-Origin requests
- **Environment Variables** - Sensitive data disimpan secara aman
- **API Rate Limiting** - Proteksi dari abuse API

## 📱 Progressive Web App (PWA) Ready

- **Service Worker** support untuk offline functionality
- **App Manifest** untuk installable web app
- **Responsive Design** untuk semua device sizes
- **Performance Optimization** dengan lazy loading dan code splitting

## 🤝 Kontribusi

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/nama-fitur`
3. Commit changes: `git commit -m 'Menambahkan fitur baru'`
4. Push branch: `git push origin feature/nama-fitur`
5. Submit Pull Request

### Code Standards
- **TypeScript** untuk type safety
- **ESLint** untuk code consistency
- **Prettier** untuk code formatting
- **Conventional Commits** untuk commit messages

## 📈 Roadmap

### Phase 1 (Current) ✅
- ✅ Basic task management
- ✅ AI integration
- ✅ Multi-language support
- ✅ Voice-to-text
- ✅ Responsive design

### Phase 2 (Planning) 🚧
- 🔲 Calendar integration
- 🔲 Team collaboration features
- 🔲 Advanced analytics
- 🔲 Mobile app (React Native)
- 🔲 API webhooks

### Phase 3 (Future) 🔮
- 🔲 Machine learning for task prediction
- 🔲 Integration with popular productivity tools
- 🔲 Advanced reporting and insights
- 🔲 Enterprise features
- 🔲 Third-party plugin system

## 📄 License

Proyek ini dikembangkan untuk keperluan akademik dalam mata kuliah Workshop Pengembangan Perangkat Lunak (WPPL).

## 👥 Tim Pengembang

**Kelompok 10 - WPPL Semester 4**

---

## 📞 Support & Contact

Untuk pertanyaan, bug reports, atau feature requests, silakan hubungi tim pengembang melalui:
- 📧 Email: [root@ragel.io]
- 🐛 Issues: [GitHub Issues]
- 📖 Documentation: [Project Wiki]

---

*Dibuat dengan ❤️ oleh Kelompok 10 - WPPL 2024*
