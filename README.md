# Job Portal System (Naukri/LinkedIn Lite)

A comprehensive full-stack job portal application built with Spring Boot and React, designed to connect job seekers with employers in a modern, user-friendly platform.

## 🚀 Features

### For Job Seekers
- **User Registration & Authentication** - Secure JWT-based authentication
- **Job Search & Filtering** - Advanced search with filters for location, job type, experience level
- **Job Applications** - Apply to jobs with cover letters and resume uploads
- **Saved Jobs** - Save interesting jobs for later review
- **Application Tracking** - Track application status and receive notifications
- **Profile Management** - Complete profile with skills, experience, and portfolio links
- **Notifications** - Real-time notifications for application updates

### For Employers
- **Company Registration** - Create and manage company profiles
- **Job Posting** - Post detailed job listings with requirements and benefits
- **Application Management** - Review, shortlist, and manage job applications
- **Interview Scheduling** - Schedule interviews and communicate with candidates
- **Analytics Dashboard** - View job performance metrics and application statistics

### General Features
- **Responsive Design** - Mobile-first design that works on all devices
- **Modern UI/UX** - Clean, intuitive interface built with Material-UI
- **Real-time Updates** - Live notifications and status updates
- **Search & Discovery** - Powerful search capabilities for jobs and companies
- **Security** - Secure authentication and authorization
- **API Documentation** - Complete Swagger/OpenAPI documentation

## 🛠️ Technology Stack

### Backend
- **Java 17** - Modern Java with latest features
- **Spring Boot 3.2.0** - Rapid application development framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence layer
- **MySQL** - Primary database
- **JWT** - JSON Web Tokens for authentication
- **Maven** - Dependency management
- **Swagger/OpenAPI** - API documentation

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - React component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Framer Motion** - Animations

## 📁 Project Structure

```
JobPortalSystem/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/jobportal/
│   │   ├── controller/      # REST controllers
│   │   ├── service/         # Business logic
│   │   ├── repository/      # Data access layer
│   │   ├── entity/          # JPA entities
│   │   ├── dto/             # Data transfer objects
│   │   ├── security/        # Security configuration
│   │   └── JobPortalApplication.java
│   ├── src/main/resources/
│   │   └── application.yml  # Configuration
│   └── pom.xml             # Maven dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # NPM dependencies
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JobPortalSystem
   ```

2. **Configure Database**
   - Create a MySQL database named `job_portal_db`
   - Update database credentials in `backend/src/main/resources/application.yml`

3. **Run the Backend**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will be available at `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- API Docs: `http://localhost:8080/api-docs`

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. After successful login, the token is stored in localStorage and included in all subsequent API requests.

### User Roles
- **JOB_SEEKER** - Can search jobs, apply, and manage applications
- **EMPLOYER** - Can post jobs, manage applications, and company profile
- **ADMIN** - Full system access and user management

## 🗄️ Database Schema

The application includes the following main entities:
- **Users** - User accounts and profiles
- **Companies** - Company information and profiles
- **Jobs** - Job postings and details
- **Job Applications** - Application records and status
- **Categories** - Job categories
- **Skills** - Skills and competencies
- **Notifications** - User notifications
- **Saved Jobs** - User's saved job listings

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme** - User preference support
- **Accessibility** - WCAG compliant components
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Animations** - Subtle animations for better UX

## 🔧 Configuration

### Backend Configuration
Key configuration options in `application.yml`:
- Database connection settings
- JWT secret and expiration
- File upload settings
- CORS configuration
- Email settings (for notifications)

### Frontend Configuration
Environment variables in `.env`:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_ENVIRONMENT` - Environment (development/production)

## 🚀 Deployment

### Backend Deployment
1. Build the JAR file: `mvn clean package`
2. Deploy to your preferred cloud platform (AWS, Azure, GCP)
3. Configure environment variables for production

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `build` folder to a static hosting service
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Real-time Chat** - Direct messaging between employers and candidates
- **Video Interviews** - Integrated video calling for interviews
- **AI Job Matching** - Machine learning-based job recommendations
- **Mobile App** - Native mobile applications
- **Advanced Analytics** - Detailed analytics and reporting
- **Multi-language Support** - Internationalization
- **Social Features** - Professional networking features

---

**Built with ❤️ by the JobPortal Team**