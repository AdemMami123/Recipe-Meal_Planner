# AI-Powered Recipe Sharing & Meal Planner App

A full-stack web application built with Next.js and Firebase that allows users to upload, share, discover, and plan meals using recipes. Features user authentication, bookmarking, a weekly meal planner, and AI-powered recipe generation using Google's Gemini AI.

## 🔧 Tech Stack

- **Frontend**: Next.js 14 (React + App Router)
- **Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **AI Integration**: Google Gemini 2.0 Flash API (via AI SDK)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## 🚀 Features

### 📸 Recipe Upload and Sharing
- Upload recipes with images, ingredients, instructions, and tags
- Images stored securely in Firebase Storage
- Public recipe browsing and discovery

### 📁 Bookmarking & Favorites
- Save favorite recipes for later
- Real-time syncing using Firestore
- Private "Saved Recipes" collection per user

### 📆 Weekly Meal Planner
- Drag and drop interface for meal planning
- 7-day calendar view
- Assign recipes to specific meals (breakfast, lunch, dinner, snacks)

### 🤖 AI-Powered Recipe Generator
- Generate unique recipes using Google Gemini AI
- Input available ingredients or dietary preferences
- Structured recipe output with ingredients, instructions, and nutrition info

### 🔍 Advanced Search & Filter
- Filter by dietary tags (vegan, gluten-free, etc.)
- Search by ingredient, recipe name, or user
- Sort by popularity, date, or AI-generated status

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe-sharing-meal-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add:
   ```env
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_CLIENT_EMAIL=your_client_email
   
   # Client-side Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # Gemini AI API Key
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   ```

4. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Enable Firebase Storage
   - Download the service account key and configure admin SDK

5. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your environment variables

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── layout.tsx
│   ├── (root)/
│   │   ├── recipes/
│   │   ├── meal-planner/
│   │   ├── ai-generator/
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   ├── globals.css
│   └── layout.tsx
├── components/
├── firebase/
│   ├── config.ts
│   └── admin.ts
├── lib/
│   ├── actions/
│   └── gemini.ts
└── types/
    └── index.ts
```

## 🔐 Authentication Flow

1. **User Registration**: Email/password or Google OAuth
2. **Session Management**: Firebase Admin SDK with HTTP-only cookies
3. **Route Protection**: Server-side authentication checks
4. **User Data**: Stored in Firestore with user profiles

## 🤖 AI Recipe Generation

The app uses Google's Gemini Pro model to generate recipes based on:
- Available ingredients
- Dietary preferences
- Cooking skill level
- Meal type preferences

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for styling
- Responsive grid layouts
- Touch-friendly interactions

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## 🔮 Future Enhancements

- [ ] Nutrition data integration (Spoonacular API)
- [ ] Recipe ratings and reviews
- [ ] Social features (follow users, share meal plans)
- [ ] AI-powered grocery list generation
- [ ] Offline PWA support
- [ ] Recipe video uploads
- [ ] Meal prep calculator
- [ ] Nutrition tracking
- [ ] Recipe collections/cookbooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- TypeScript errors will resolve after running `npm install`
- Ensure all environment variables are correctly set
- Firebase Admin SDK requires proper service account configuration

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.
