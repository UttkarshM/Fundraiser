# Fundraiser Platform 🚀

A modern, full-stack crowdfunding platform that enables organizations and individuals to create, manage, and support fundraising campaigns. Built with Next.js 15, Supabase, and enhanced with AI-powered sentiment analysis.

## ✨ Features

### 🎯 Core Functionality
- **Campaign Management**: Create, edit, and manage fundraising campaigns
- **Donation System**: Secure donation processing with multiple payment methods
- **User Authentication**: Complete user registration and authentication system
- **Real-time Updates**: Live campaign progress tracking and updates
- **Category-based Browsing**: Organize campaigns by categories and causes

### 🎨 User Experience
- **Responsive Design**: Beautiful, mobile-first UI with Tailwind CSS
- **Dark/Light Mode**: Theme switching with next-themes
- **Interactive Components**: Rich UI components powered by Radix UI
- **Dashboard**: Comprehensive user dashboard for managing campaigns and donations
- **Admin Panel**: Administrative interface for platform management

### 🤖 AI-Powered Features
- **Sentiment Analysis**: AI-powered analysis of campaign content and feedback
- **Company News Scraping**: Automated web scraping for company-related news
- **Hindi Language Support**: Multi-language sentiment analysis capabilities

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **State Management**: React Server Components
- **Authentication**: Supabase Auth
- **Charts**: Recharts for data visualization
 
### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Flask (Python) for AI services
- **AI/ML**: Transformers, PyTorch, Sentence Transformers
- **Web Scraping**: Beautiful Soup, Requests, Pyppeteer

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Bundler**: Turbopack (Next.js)
- **Deployment**: Vercel (Frontend), Gunicorn (Backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Supabase account

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fundraiser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   GOOGLE_API_KEY=your_google_api_key
   # Add other required environment variables
   ```

5. **Run the Flask server**
   ```bash
   python api.py
   ```
   The API will be available at [http://localhost:5000](http://localhost:5000)

## 📁 Project Structure

```
fundraiser/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── campaign/          # Campaign pages
│   ├── dashboard/         # User dashboard
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                   # Utility libraries
│   ├── actions/          # Server actions
│   └── supabase.ts       # Supabase client
├── backend/              # Python Flask API
│   ├── api.py           # Main Flask application
│   ├── utils.py         # Utility functions
│   └── requirements.txt # Python dependencies
└── public/              # Static assets
```

## 📊 Database Schema

The application uses Supabase with the following main tables:
- `user_profiles` - User information and profiles
- `campaigns_table` - Fundraising campaigns
- `donations` - Donation records
- `campaign_categories` - Campaign categories
- `campaign_updates` - Campaign updates and announcements
- `campaign_comments` - User comments on campaigns

## 🔧 Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Scripts
```bash
python api.py        # Start Flask development server
gunicorn app:app     # Start production server with Gunicorn
```

## 🌟 Key Features

### Campaign Management
- Create and customize fundraising campaigns
- Set goals, descriptions, and end dates
- Upload campaign images
- Track progress with real-time updates

### User Dashboard
- View personal campaigns and donations
- Track campaign performance
- Manage user profile and settings

### Admin Panel
- Platform-wide campaign management
- User administration
- Analytics and reporting

### AI Integration
- Sentiment analysis of campaign content
- Automated news scraping for companies
- Multi-language support (Hindi)

## 🔐 Authentication & Security

- Secure authentication with Supabase Auth
- Row-level security (RLS) policies
- Protected API routes
- Middleware-based route protection

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Production)
1. Set up a Python hosting service (e.g., Railway, Heroku)
2. Configure environment variables
3. Use Gunicorn for production deployment:
   ```bash
   gunicorn --bind 0.0.0.0:$PORT api:app
   ```

## 📝 API Documentation

### Main Endpoints
- `GET /fetch/<company>` - Fetch and analyze company news articles

### Supabase Integration
- Real-time subscriptions for live updates
- Server-side rendering with SSR
- Optimistic UI updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend-as-a-service
- Radix UI for accessible component primitives
- Tailwind CSS for utility-first styling
- The open-source community for various packages and tools
