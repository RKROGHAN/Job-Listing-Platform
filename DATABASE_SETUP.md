# Database Setup Instructions

## Issue Found
The backend is failing to connect to MySQL with the error:
```
Access denied for user 'root'@'localhost' (using password: YES)
```

## Solution Options

### Option 1: Update MySQL Password (Recommended)
If your MySQL root user has no password or a different password, update the `application.yml` file:

1. Open: `JobPortalSystem/backend/src/main/resources/application.yml`
2. Find the `datasource` section (around line 10-14)
3. Update the `password` field:
   ```yaml
   password: ${DB_PASSWORD:}  # Empty password by default
   # OR
   password: ${DB_PASSWORD:your_actual_password}  # Your actual password
   ```

### Option 2: Set Environment Variables
You can set environment variables before starting the backend:

**Windows (CMD):**
```cmd
set DB_USERNAME=root
set DB_PASSWORD=your_password
```

**Windows (PowerShell):**
```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
```

### Option 3: Reset MySQL Root Password
If you forgot your MySQL root password:

1. Stop MySQL service
2. Start MySQL in safe mode (skip grant tables)
3. Connect and reset password:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
   FLUSH PRIVILEGES;
   ```

### Option 4: Create a New MySQL User
Create a dedicated user for the application:

```sql
CREATE USER 'jobportal'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON job_portal_db.* TO 'jobportal'@'localhost';
FLUSH PRIVILEGES;
```

Then update `application.yml`:
```yaml
username: jobportal
password: secure_password
```

## Current Configuration
The application is configured to:
- Connect to: `localhost:3306`
- Database: `job_portal_db` (will be created automatically)
- Username: `root` (configurable via `DB_USERNAME` env var)
- Password: Empty by default (configurable via `DB_PASSWORD` env var)

## Verify MySQL is Running
Before starting the backend, make sure MySQL is running:

**Windows:**
```cmd
net start MySQL80
# OR check services:
services.msc
```

## Test Connection
You can test the connection using MySQL command line:
```cmd
mysql -u root -p
# Enter your password when prompted
```

If connection works, the backend should also work with the same credentials.

