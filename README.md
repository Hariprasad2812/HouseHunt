# 🏡 HouseHunt — House Rental Platform

**HouseHunt** is a full-stack web application designed to simplify the process of finding and managing rental properties. It provides a user-friendly interface for exploring available properties and a backend for handling application data.

## 🚀 Features

- 🏠 Browse and explore rental properties
- 🔍 Search and filter properties
- 👤 User-friendly frontend interface
- 🔐 Backend support for application and user management
- 🗄️ Database integration
- 📱 Responsive web design
- 🐳 Docker Compose support for local development

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Java | Backend programming |
| Spring Boot | REST API and backend services |
| MySQL / H2 | Database support |
| Maven | Build and dependency management |
| Docker | Containerization and development setup |
| Git & GitHub | Version control and source code hosting |

## 📂 Project Structure

```text
HouseHunt/
├── frontend/          # React frontend
├── backend/           # Spring Boot backend
├── docker-compose.yml # Docker services configuration
├── README.md          # Project documentation
└── .gitignore         # Git ignored files
```

*The directory names above are illustrative; adjust them if your repository structure differs.*

## ⚙️ Prerequisites

Install the following tools before running the project:

- Java JDK
- Maven
- Node.js and npm
- MySQL, if using MySQL configuration
- Docker Desktop (optional)

## ▶️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Hariprasad2812/HouseHunt.git
cd HouseHunt
```

### 2. Run the backend

Navigate to the backend directory:

```bash
cd backend
```

Build the application:

```bash
mvn clean package
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

Configure the required database connection and environment variables before starting the backend.

### 3. Run the frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Use the local URL printed by the frontend development server.

> **Note:** The exact commands and configuration may vary depending on your project's scripts and application settings.

## 🔧 Configuration

Configure the following as required by your local setup:

- Database URL and credentials
- Backend server port
- Frontend API base URL
- Authentication secrets and other environment variables

**Security:** Never commit passwords, API keys, JWT secrets, or production credentials. Use environment variables and provide a sanitized `.env.example` file if needed.

## 🐳 Docker

If Docker Compose is configured for your environment, you can start the configured services using:

```bash
docker compose up --build
```

To stop the services:

```bash
docker compose down
```

## 🎯 Project Objective

The goal of HouseHunt is to demonstrate full-stack development skills, including frontend development, Java backend programming, REST API integration, database connectivity, and application deployment practices.

## 👨‍💻 Developer

**Hari Prasad**

- GitHub: [Hariprasad2812](https://github.com/Hariprasad2812)
- Project Repository: [HouseHunt](https://github.com/Hariprasad2812/HouseHunt)

## 📄 License

Add a license if you intend to distribute this project for reuse. Until then, all rights are reserved by the copyright holder.
