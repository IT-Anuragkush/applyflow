# ApplyFlow

A full-stack Job Application Tracking System that helps users manage and track their job applications efficiently. Users can register, log in securely, add jobs, update application status, filter jobs, and view dashboard statistics.

## Live Demo

https://smart-job-tracker-co69.onrender.com

---

## Features

### Authentication

* User Registration
* User Login
* JWT Authentication
* Secure Password Hashing with bcrypt
* Protected Routes

### Job Management

* Add Job Applications
* Edit Existing Jobs
* Delete Jobs
* Search Jobs by Company or Role
* Filter Jobs by Status
* Sort Jobs by Date

### Dashboard

* Total Jobs Statistics
* Applied Jobs Count
* Interview Jobs Count
* Offer Jobs Count
* Rejected Jobs Count
* Interactive Chart.js Dashboard

### User Experience

* Responsive Design
* Loading Spinner
* Toast Notifications
* Clean and Modern UI

### Deployment

* MongoDB Atlas Database
* Render Cloud Deployment

---

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT (JSON Web Token)
* bcrypt

### Deployment

* Render

---

## Project Structure

```text
applyflow/
│
├── config/
│   └── db.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── User.js
│   └── Job.js
│
├── public/
│   ├── css/
│   └── js/
│
├── routes/
│   ├── authRoutes.js
│   └── jobRoutes.js
│
├── views/
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── jobs.html
│   └── profile.html
│
├── server.js
├── package.json
├── .env
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/IT-Anuragkush/applyflow.git

cd applyflow
```

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
```

---

## Screenshots

### Login Page

Add screenshot here

### Register Page

Add screenshot here

### Dashboard

Add screenshot here

### Jobs Page

Add screenshot here

---

## Future Improvements

* Email Verification
* Password Reset Feature
* Dark Mode
* Resume Upload
* Interview Tracking
* AI-Based Job Insights

---

## Author

**Anurag Kushwaha**

GitHub:
https://github.com/IT-Anuragkush

---

## License

This project is licensed under the MIT License.
