# RateSphere - FullStack Store Rating Platform

A fullstack web application built strictly according to the **FullStack Intern Coding Challenge** specification document, utilizing **React.js**, **Express.js**, and **MySQL**, with a modern UI.

---

## 🚀 Tech Stack

- **Backend**: Express.js (Node.js) with JWT authentication & MySQL2
- **Database**: MySQL (`store_rating_db` with relational schema, foreign keys, and indexes)
- **Frontend**: React.js (Vite) + Tailwind CSS + Lucide Icons
- **Security**: Bcrypt password hashing, JWT bearer tokens, role-based authorization middleware

---

## 👥 User Roles & Features

### 1. System Administrator
- **Dashboard Metrics**:
  - Total number of registered users
  - Total number of registered stores
  - Total number of submitted ratings
- **Stores Management**:
  - View list of stores with **Store Name**, **Email**, **Address**, and **Overall Rating**
  - Sort by any column (ascending / descending)
  - Filter by Store Name, Email, or Address
  - Add new stores (creates store and links store owner account)
- **Users Management**:
  - View list of all users with **Name**, **Email**, **Address**, **Role**, and **Store Rating** (if Store Owner)
  - Filter users by Name, Email, Address, and Role (All, Normal User, Administrator, Store Owner)
  - Sort by any column (ascending / descending)
  - Add new users (Admin, Normal User, or Store Owner) with strict validation
  - View detailed user profile modal (with Store Owner rating breakdown if applicable)
- **Log out** from the system

### 2. Normal User
- **Sign Up**: Registration page with live validation rules
- **Single Login**: Log in to access normal user capabilities
- **Stores Directory**:
  - Search stores by **Store Name** and **Address**
  - Sort table by Store Name, Address, Overall Rating, and User's Submitted Rating
  - Displays: **Store Name**, **Address**, **Overall Rating**, and **User's Submitted Rating**
  - **Submit Rating** (1 to 5 stars) if not yet rated
  - **Modify Rating** (1 to 5 stars) if already submitted
- **Update Password**: Change account password after logging in
- **Log out** from the system

### 3. Store Owner
- **Log In**: Single login system
- **Dashboard Functionalities**:
  - View store overview and **Average Rating** (with rating distribution breakdown 1-5 stars)
  - View table of **Users who have submitted ratings** for their store (User Name, Email, Rating, Date)
  - Sort user ratings table by Name, Email, Rating, or Date
  - Instant search for reviewing users
- **Update Password**: Change password after logging in
- **Log out** from the system

---

## 📋 Strict Form Validations

All validation rules from the specification document are strictly enforced on both frontend and backend:

| Field | Rule |
| :--- | :--- |
| **Name** | Minimum 20 characters, Maximum 60 characters |
| **Address** | Maximum 400 characters |
| **Password** | 8 to 16 characters, at least one uppercase letter and at least one special character |
| **Email** | Standard RFC-compliant email validation |
| **Rating** | Integer between 1 and 5 |

---

## 🔑 Demo Accounts

The database comes pre-seeded with accounts satisfying all validation criteria:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `Admin@12345` | System Administrator Officer |
| **Store Owner** | `alex.organic@stores.com` | `Owner@12345` | Apex Organic Market & Grocers |
| **Store Owner** | `samantha.tech@stores.com` | `Owner@12345` | Nexus Digital Tech Emporium |
| **Store Owner** | `chris.bakery@stores.com` | `Owner@12345` | Artisan Delight Gourmet Bakery |
| **Normal User** | `benjamin.harrison@gmail.com` | `User@123456` | Benjamin Edward Harrison |
| **Normal User** | `katherine.parker@gmail.com` | `User@123456` | Katherine Michelle Parker |

*(Quick demo buttons are also provided on the login page for convenience).*

---

## 🛠️ How to Run

### 1. Database Setup
Ensure MySQL is running on `127.0.0.1:3306`.
The database name is `store_rating_db`.
To re-seed or initialize:
```bash
cd backend
npm run seed
```

### 2. Backend Server
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

### 3. Frontend Client
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

### 4. Run Automated Test Suite
```bash
cd backend
node test_suite.js
```
*(All 22 requirement checks pass with 0 errors).*
