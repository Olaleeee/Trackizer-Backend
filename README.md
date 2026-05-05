# 📊 Trackizer Backend

> *Scalable Node.js/Express API for subscription tracking – secure, fast, and production-ready.*

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

**Trackizer-Backend** is the robust server-side component of the Trackizer subscription management platform. It provides data persistence, business logic, user authentication, and secure API endpoints for tracking recurring subscriptions, payment schedules, and spending analytics.

---

## ✨ Core Features

- 🔐 **JWT Authentication** – Secure user signup, login, and protected routes.
- 👤 **User Management** – Profiles, preferences, and account settings.
- 💳 **Subscription CRUD** – Create, read, update, delete subscriptions with fields: name, cost, billing cycle (monthly/yearly), category, next billing date.
- 📅 **Billing Reminders** – Automatic calculation of upcoming payments.
- 📊 **Analytics Endpoints** – Total monthly spending, category breakdown, annual trends.
- 🛡️ **Input Validation** – Using express-validator or Joi.
- 🌐 **CORS Configured** – Securely allow specific frontend origins.
- 🚦 **Error Handling** – Centralized error middleware for consistent responses.
- 📝 **Logging** – Request/response logging with Morgan/Winston.

---

## 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Runtime        | Node.js (v18+)                      |
| Framework      | Express.js                          |
| Database       | MongoDB with Mongoose **or** PostgreSQL with Prisma/Sequelize |
| Authentication | JWT (JSON Web Tokens) + bcrypt      |
| Validation     | express-validator / Joi             |
| Logging        | Morgan + Winston                    |
| Environment    | dotenv                              |
| Security       | helmet, cors, xss-clean, express-rate-limit |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB **or** PostgreSQL running locally or on cloud (MongoDB Atlas / Neon.tech)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sholeye/Trackizer-Backend.git
cd Trackizer-Backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secret, and port
