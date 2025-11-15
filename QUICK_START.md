# 🚀 Quick Start Guide - Job Portal System

## Prerequisites Installation

### 1. Install Java 17+
- Download from: https://adoptium.net/
- Set JAVA_HOME environment variable
- Add Java bin directory to PATH

### 2. Install Maven
- Download from: https://maven.apache.org/download.cgi
- Extract and add Maven bin directory to PATH

### 3. Install Node.js and npm
- Download from: https://nodejs.org/
- This will also install npm

### 4. Install MySQL
- Download from: https://dev.mysql.com/downloads/mysql/
- Create a database named `job_portal_db`
- Note your MySQL username and password

### 5. Fix PowerShell Execution Policy (if needed)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Quick Setup

### Option 1: Automated Setup (Recommended)
1. Double-click `run-project.bat`
2. Follow the on-screen instructions
3. The script will check prerequisites and start both servers

### Option 2: Manual Setup

#### Backend Setup:
1. Update database credentials in `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/job_portal_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
       username: your_mysql_username
       password: your_mysql_password
   ```

2. Run the database setup script:
   ```sql
   -- Execute setup-database.sql in MySQL
   ```

3. Start the backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

#### Frontend Setup:
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the frontend:
   ```bash
   npm start
   ```

## Access the Application

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html

## Default Login Credentials

### Admin User
- **Email**: admin@jobportal.com
- **Password**: admin123
- **Role**: Admin (full access)

### Job Seeker
- **Email**: john.doe@email.com
- **Password**: user123
- **Role**: Job Seeker

### Employer
- **Email**: jane.smith@company.com
- **Password**: employer123
- **Role**: Employer

## Features to Test

### For Job Seekers:
1. Login with job seeker credentials
2. Browse jobs at http://localhost:3000/jobs
3. Apply for jobs
4. Save jobs for later
5. Check application status
6. Update profile

### For Employers:
1. Login with employer credentials
2. Post new jobs
3. Manage job applications
4. Update company profile
5. View analytics

### For Admins:
1. Login with admin credentials
2. Manage users
3. Verify companies
4. System administration

## Troubleshooting

### Common Issues:

1. **Maven not found**: Install Maven and add to PATH
2. **Node.js not found**: Install Node.js from nodejs.org
3. **Database connection failed**: Check MySQL credentials in application.yml
4. **Port already in use**: Stop other services using ports 3000 or 8080
5. **PowerShell execution policy**: Run the Set-ExecutionPolicy command

### Getting Help:
- Check the console output for error messages
- Verify all prerequisites are installed
- Ensure MySQL is running
- Check firewall settings

## Development

### Backend Development:
- API endpoints are documented at http://localhost:8080/swagger-ui.html
- Logs are available in the console
- Database changes are auto-applied (Hibernate DDL)

### Frontend Development:
- Hot reload is enabled
- Check browser console for errors
- Use React Developer Tools extension

## Production Deployment

For production deployment:
1. Build the backend: `mvn clean package`
2. Build the frontend: `npm run build`
3. Deploy to your preferred cloud platform
4. Configure production database
5. Set environment variables

---

**Happy Coding! 🎉**
