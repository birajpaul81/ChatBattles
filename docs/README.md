# ChatBattles.ai 🔥⚔️

A production-ready AI chat platform where users can compare responses from multiple AI models side-by-side in real-time "Battle Mode."

![ChatBattles.ai](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)

## ✨ Features

- **Battle Mode**: Compare 4 top AI models (GPT-5, Lima-4, DeepSeek v3.1, Google Gemini 2.5 Pro) side-by-side
- **Real-time Streaming**: Typewriter effect for responses
- **Authentication**: Secure sign-in/sign-up with Clerk
- **Chat History**: Store and view past conversations
- **Responsive Design**: Beautiful UI on all devices
- **Neon Theme**: Futuristic dark theme with orange accents
- **100% Free**: No subscriptions or hidden fees

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Clerk
- **Database**: Supabase
- **AI API**: A4F (https://www.a4f.co/)
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd ChatBattles
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   # A4F API Configuration
   A4F_API_KEY=your_a4f_api_key

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Clerk Configuration
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
   ```

4. **Set up Supabase Database**:
   Run the migration SQL from `supabase/schema.sql` in your Supabase SQL editor.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Supabase Schema

The application uses a single `chats` table to store user conversations:

```sql
create table chats (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  prompt text,
  responses jsonb,
  created_at timestamp default now()
);
```

Run this SQL in your Supabase SQL Editor to set up the database.

## 🔑 API Configuration

### A4F API

1. Sign up at [https://www.a4f.co/](https://www.a4f.co/)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file

The application uses these 4 models:
- `provider-3/gpt-5-nano` (GPT-5)
- `provider-3/llama-4-scout` (Lima-4)
- `provider-1/deepseek-v3.1` (DeepSeek v3.1)
- `provider-3/gemini-2.5-flash-lite-preview-09-2025` (Google Gemini 2.5 Pro)

### Clerk Authentication

1. Create a project at [https://clerk.com](https://clerk.com)
2. Get your API keys from the dashboard
3. Add them to your `.env.local` file
4. Configure the sign-in/sign-up URLs in Clerk dashboard

### Supabase

1. Create a project at [https://supabase.com](https://supabase.com)
2. Get your project URL and keys:
   - Go to Project Settings > API
   - Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)
3. Run the schema SQL in the SQL Editor:
   - Go to SQL Editor in Supabase dashboard
   - Run the SQL from `supabase/schema.sql`
4. Add all credentials to your `.env.local` file

**Note**: This app uses Clerk for authentication (not Supabase Auth). The service role key bypasses Row Level Security (RLS) in API routes while Clerk handles user authentication.

## 📂 Project Structure

```
ChatBattles/
├── app/
│   ├── api/
│   │   ├── a4f-battle/      # AI battle endpoint
│   │   └── chats/           # Chat CRUD operations
│   ├── chat/                # Main chat interface
│   ├── profile/             # User profile & history
│   ├── sign-in/             # Clerk sign-in
│   ├── sign-up/             # Clerk sign-up
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── AnimatedBackground.tsx
│   ├── BattleCard.tsx
│   ├── ChatInput.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
├── lib/
│   ├── a4fClient.ts         # A4F API client
│   └── supabaseClient.ts    # Supabase client
├── middleware.ts            # Clerk auth middleware
├── tailwind.config.ts       # Tailwind configuration
└── package.json
```

## 🎨 Design System

### Colors
- **Background**: `#0D0D0D` (Deep Black)
- **Accent**: `#FD6316` (Neon Orange)
- **Text**: `#FFFFFF` (White)
- **Soft Gray**: `#BFBFBF`

### Typography
- **Primary**: Inter (body text)
- **Display**: Orbitron (headings)

### Effects
- Neon glow on interactive elements
- Smooth transitions with Framer Motion
- Animated gradients on backgrounds
- Typewriter effect for AI responses

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
npm run build
```

## 🔒 Security

- All routes under `/chat` and `/profile` are protected by Clerk
- API keys are stored securely in environment variables
- Database queries use Supabase's built-in security
- User data is isolated by `user_id`

## 📝 Features Roadmap

- [ ] Export chat history
- [ ] Custom model selection
- [ ] Voting system for best response
- [ ] Share battles via link
- [ ] Dark/Light theme toggle
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Biraj**

Made with ⚡ by ChatBattles.ai

---

## 🐛 Troubleshooting

### Common Issues

**"API key not found"**
- Ensure `.env.local` exists and contains all required keys
- Restart your development server after adding env variables

**"Unauthorized" errors**
- Check your Clerk configuration
- Ensure middleware is correctly set up

**Database errors**
- Verify Supabase schema is created
- Check your Supabase credentials
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

**Chat history not showing in profile**
- Make sure you've added the `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local`
- Verify the `chats` table exists in Supabase (run `supabase/schema.sql`)
- Restart your development server after adding environment variables
- Check browser console and server logs for specific error messages

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with Next.js 15, TypeScript, Tailwind CSS, Clerk, and Supabase**

