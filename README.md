# Talk Screen AI

![Talk Screen AI Banner](https://files.manuscdn.com/user_upload_by_module/session_file/310519663069418526/qraGWwrreTwacZje.png)

## Overview

**Talk Screen AI** is an intelligent AI-powered assistant that analyzes your screen in real-time, provides AI-powered insights, and translates responses into multiple languages with text-to-speech support. Built with cutting-edge web technologies and powered by **Manus LLM API**, Talk Screen AI enables seamless screen sharing, analysis, and multilingual communication.

Whether you're a developer debugging code, a researcher analyzing data, or a professional collaborating across language barriers, Talk Screen AI transforms how you interact with your screen content through intelligent AI analysis and real-time translation.

---

## Key Features

### 🖥️ Screen Sharing & Capture
- **Real-time Screen Sharing**: Share your entire screen, specific windows, or individual tabs
- **Automatic Screen Capture**: Automatically captures your screen when sending questions during active screen sharing
- **Multi-Window Selection**: Choose from all available windows on your system (full support for Chrome, limited support for Safari)
- **Cross-Platform Support**: Works seamlessly on macOS, Windows, and Linux

### 🤖 AI-Powered Analysis
- **Intelligent Screen Analysis**: Powered by **Manus LLM API**, analyzes screen content and provides contextual insights
- **Context-Aware Chat**: Maintains conversation history for coherent and continuous dialogue
- **Image Understanding**: Analyzes screenshots to understand UI elements, code, documents, and visual content
- **Real-time Processing**: Instant analysis and response generation

### 🌍 Multilingual Translation
- **12-Language Support**: Translate AI responses into:
  - English, Japanese, Chinese (Simplified & Traditional)
  - Spanish, French, German, Korean
  - Russian, Arabic, Portuguese, Hindi
- **Real-time Translation**: Instant translation of AI responses
- **Beautiful Markdown Rendering**: Properly formatted text with bold, italics, code blocks, and line breaks

### 🔊 Text-to-Speech
- **Natural Voice Synthesis**: Listen to translated responses with natural-sounding voice
- **Language-Specific Voices**: Supports voice synthesis in multiple languages
- **Accessible Interface**: Enhances accessibility for users with visual impairments

### 💬 Context-Aware Chat
- **Conversation History**: Maintains full conversation context within a session
- **Smart Responses**: AI understands previous messages for more relevant answers
- **Session Management**: Separate chat sessions for different screen sharing contexts

---

## Technology Stack

### Frontend
- **React 19**: Modern UI framework with hooks and concurrent features
- **Tailwind CSS 4**: Utility-first CSS framework for responsive design
- **TypeScript**: Type-safe JavaScript for robust frontend code
- **tRPC**: End-to-end type-safe API communication
- **Wouter**: Lightweight client-side routing
- **shadcn/ui**: High-quality, accessible UI components
- **Streamdown**: Markdown rendering with streaming support

### Backend
- **Express 4**: Lightweight and flexible web framework
- **tRPC 11**: Type-safe RPC framework for end-to-end type safety
- **Drizzle ORM**: Modern, type-safe database ORM
- **MySQL/TiDB**: Scalable relational database
- **Node.js**: JavaScript runtime for server-side execution

### LLM Integration
- **Manus LLM API**: Advanced language model for screen analysis and text generation
- **Image Analysis**: Computer vision capabilities for understanding screenshots
- **Text Generation**: Natural language generation for responses

### External Services
- **Manus OAuth**: Secure authentication and authorization
- **S3 Storage**: Cloud storage for files and assets
- **Web APIs**: Screen Capture API, Web Audio API, Web Speech API

---

## Architecture

### System Architecture Diagram

![Architecture Diagram](https://files.manuscdn.com/user_upload_by_module/session_file/310519663069418526/YxXNMUxLfrrQQtps.png)

### Architecture Overview

The application follows a **modern full-stack architecture** with clear separation of concerns:

#### Client Layer (React 19 + Tailwind 4)
- **UI Components**: Reusable React components built with shadcn/ui
- **Chat Interface**: Real-time chat UI with message history display
- **Screen Sharing Module**: Handles screen capture and sharing functionality
- **Translation Panel**: Displays translated content with proper formatting

#### Frontend Services
- **tRPC Client**: Type-safe API client for backend communication
- **Auth Management**: Handles user authentication and session management
- **State Management**: React hooks for component state and side effects

#### Server Layer (Express 4 + tRPC 11)
- **tRPC Routers**: Type-safe API endpoints for chat, translation, and analysis
- **Chat Router**: Manages chat messages and conversation history
- **Translation Router**: Handles multilingual translation requests
- **Auth Handler**: Manages OAuth flow and session validation

#### LLM Integration
- **Manus LLM API**: Provides AI capabilities for screen analysis and text generation
- **Image Analysis**: Analyzes screenshots to understand content
- **Text Generation**: Generates intelligent responses based on screen content and user queries

#### Database Layer
- **MySQL/TiDB**: Stores user data, conversation history, and application state
- **Drizzle ORM**: Type-safe database queries and migrations
- **Migrations**: Version-controlled database schema changes

#### External Services
- **S3 Storage**: Cloud storage for user files and assets
- **Manus OAuth**: Secure user authentication

---

## Data Flow

### Screen Sharing & Analysis Flow

```
1. User clicks "Start Screen Share" button
   ↓
2. Browser displays screen/window selection dialog
   ↓
3. User selects screen or window to share
   ↓
4. Screen stream is captured and displayed in preview
   ↓
5. User types a question in the chat input
   ↓
6. Screen is automatically captured as image
   ↓
7. Image + question sent to backend via tRPC
   ↓
8. Backend sends to Manus LLM API for analysis
   ↓
9. AI response returned to frontend
   ↓
10. Response displayed in chat with formatting
```

### Translation Flow

```
1. AI response received from LLM
   ↓
2. User selects target language
   ↓
3. Response sent to backend translation router
   ↓
4. Backend calls Manus LLM API for translation
   ↓
5. Translated text returned to frontend
   ↓
6. Displayed in Translation Box with proper markdown formatting
   ↓
7. Optional: User clicks text-to-speech button
   ↓
8. Web Speech API synthesizes audio in target language
```

---

## Technical Specifications

### Frontend Specifications

| Component | Technology | Version |
|-----------|-----------|---------|
| UI Framework | React | 19 |
| CSS Framework | Tailwind CSS | 4 |
| Language | TypeScript | Latest |
| API Client | tRPC | 11 |
| Routing | Wouter | Latest |
| UI Components | shadcn/ui | Latest |
| Markdown Rendering | Streamdown | Latest |

### Backend Specifications

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 22.13.0 |
| Web Framework | Express | 4 |
| RPC Framework | tRPC | 11 |
| ORM | Drizzle | Latest |
| Database | MySQL/TiDB | Latest |
| Package Manager | pnpm | Latest |

### API Specifications

#### Chat Endpoint
- **Procedure**: `trpc.chat.sendMessage`
- **Input**: `{ message: string; imageUrl?: string; conversationId?: string }`
- **Output**: `{ response: string; conversationId: string; timestamp: Date }`
- **Authentication**: Protected (requires user session)

#### Translation Endpoint
- **Procedure**: `trpc.chat.translate`
- **Input**: `{ text: string; targetLanguage: string }`
- **Output**: `{ translatedText: string; sourceLanguage: string; targetLanguage: string }`
- **Authentication**: Protected (requires user session)

#### Screen Capture Endpoint
- **Method**: Client-side using Screen Capture API
- **Input**: User selection from browser dialog
- **Output**: Canvas image data
- **Processing**: Automatic capture on message send during active screen sharing

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  imageUrl VARCHAR(512),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id)
);
```

---

## Getting Started

### Prerequisites
- Node.js 22.13.0 or higher
- pnpm package manager
- Modern web browser (Chrome recommended for full window selection support)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/talk-screen-ai.git
   cd talk-screen-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Initialize database**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start
```

---

## Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/talk_screen_ai

# Authentication
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Application
VITE_APP_ID=your-app-id
VITE_APP_TITLE=Talk Screen AI
VITE_APP_LOGO=https://example.com/logo.png

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

---

## Browser Support

| Browser | Screen Sharing | Window Selection | Translation | Text-to-Speech |
|---------|---|---|---|---|
| Chrome/Edge | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Firefox | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Safari | ✅ Limited | ⚠️ Limited | ✅ Full | ✅ Full |

**Note**: Safari has limitations on window selection due to security restrictions. For full functionality, Chrome or Firefox is recommended.

---

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Automatic route-based code splitting with Vite
- **Image Optimization**: OG image and assets optimized for web
- **Lazy Loading**: Components loaded on demand
- **Caching**: Browser caching for static assets

### Backend Optimization
- **Connection Pooling**: Database connection pooling for performance
- **Response Compression**: gzip compression for API responses
- **Rate Limiting**: API rate limiting to prevent abuse
- **Caching**: Redis caching for frequently accessed data (optional)

### LLM Integration
- **Streaming Responses**: Streaming text generation for faster perceived performance
- **Image Compression**: Screenshots compressed before sending to LLM
- **Batch Processing**: Multiple translation requests batched when possible

---

## Security Considerations

### Authentication & Authorization
- **OAuth 2.0**: Secure authentication via Manus OAuth
- **Session Management**: HTTP-only cookies for session tokens
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Role-Based Access Control**: Admin and user roles for access control

### Data Protection
- **HTTPS**: All communications encrypted with TLS
- **Database Encryption**: Sensitive data encrypted at rest
- **Input Validation**: Server-side validation of all user inputs
- **XSS Prevention**: Content Security Policy headers

### Privacy
- **Screen Data**: Screenshots processed server-side and not stored permanently
- **User Data**: Compliant with GDPR and privacy regulations
- **Third-party Services**: Minimal data sharing with external services

---

## Testing

### Run Tests
```bash
pnpm test
```

### Test Coverage
- Unit tests for backend procedures
- Integration tests for API endpoints
- Component tests for React components

### Test Files
- `server/auth.logout.test.ts` - Authentication tests
- `server/routers/chat.test.ts` - Chat functionality tests

---

## Deployment

### Deploy to Manus Platform
1. Create a checkpoint in the Manus dashboard
2. Click the "Publish" button to deploy
3. Access your application at the provided URL

### Deploy to Other Platforms
The application can be deployed to any platform supporting Node.js:
- Vercel, Netlify (frontend only)
- Railway, Render, Heroku (full-stack)
- AWS, Google Cloud, Azure (custom deployment)

---

## Troubleshooting

### Screen Sharing Issues

**Problem**: Window selection dialog shows only current browser window

**Solution**: 
- On macOS: Grant screen recording permission in System Preferences → Security & Privacy → Screen Recording
- Use Chrome or Firefox for full window selection support
- Safari has limitations on window selection

### Translation Issues

**Problem**: Translation returns empty or incorrect results

**Solution**:
- Ensure Manus LLM API credentials are correctly configured
- Check network connectivity to API endpoint
- Verify target language is supported (12 languages available)

### Performance Issues

**Problem**: Slow response times or lag

**Solution**:
- Check network connection speed
- Verify database connection is stable
- Monitor API rate limits
- Consider enabling caching

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support & Feedback

For support, feature requests, or bug reports, please:
- Open an issue on GitHub
- Contact support@talkscreenai.com
- Visit our documentation at https://docs.talkscreenai.com

---

## Roadmap

### Upcoming Features
- 📊 **Analytics Dashboard**: Track usage patterns and insights
- 🎨 **Dark Mode**: Dark theme support for reduced eye strain
- ⌨️ **Keyboard Shortcuts**: Quick access to common functions
- 💾 **Chat Export**: Export conversations as PDF or Markdown
- 🔄 **Session History**: Access previous chat sessions
- 🌐 **Multi-language UI**: Interface in multiple languages
- 🎙️ **Voice Input**: Speak queries instead of typing
- 🔌 **Plugin System**: Extend functionality with plugins

---

## Credits

Built with ❤️ using:
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Express](https://expressjs.com)
- [Manus LLM API](https://manus.im)

---

## Version History

### v1.0.0 (Current)
- Initial release
- Screen sharing and analysis
- Multilingual translation (12 languages)
- Text-to-speech support
- Context-aware chat
- Manus LLM API integration

---

**Last Updated**: January 2026

For the latest updates and documentation, visit [Talk Screen AI Documentation](https://docs.talkscreenai.com)
