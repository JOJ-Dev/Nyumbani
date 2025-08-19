# 🏠 Nyumbani - Property Management System

A comprehensive property management platform that connects landlords and tenants, streamlining rental property management with integrated payment processing and role-based dashboards.

## 📸 Project Overview

Nyumbani is a full-stack web application built with Django REST API backend and React frontend, designed to simplify property management for both landlords and tenants. The platform provides secure authentication, property management, tenant assignment, and integrated Stripe payment processing.

## ✨ Key Features

### 🏢 For Landlords
- **Property Management**: Create, edit, and manage multiple properties
- **Tenant Assignment**: Assign tenants to specific properties
- **Payment Tracking**: Monitor rent payments and payment history
- **Dashboard Analytics**: View property occupancy and financial summaries

### 👥 For Tenants
- **Property Viewing**: Browse available rental properties
- **Payment Processing**: Secure rent payments via Stripe integration
- **Payment History**: Track all past payments and receipts
- **Tenant Dashboard**: Personalized dashboard with assigned properties

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Separate dashboards for landlords and tenants
- **Protected Routes**: Role-specific navigation and access control

## 🛠️ Tech Stack

### Backend (Django)
- **Framework**: Django 5.1.3 with Django REST Framework
- **Authentication**: JWT via django-rest-framework-simplejwt
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **Payment Processing**: Stripe API integration
- **CORS**: django-cors-headers for frontend communication

### Frontend (React)
- **Framework**: React 19.1.1 with React Router v6
- **Styling**: CSS3 with responsive design
- **HTTP Client**: Axios for API communication
- **Payment UI**: Stripe React components
- **Icons**: React Icons library

## 📁 Project Structure

```
nyumbani/
├── backend/
│   ├── accounts/           # User management (landlords & tenants)
│   ├── dashboard/          # Property & rental management
│   ├── payments/           # Stripe payment processing
│   └── backend/            # Django project settings
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-based pages
│   │   ├── context/        # React Context (Auth)
│   │   ├── utils/          # Route protection utilities
│   │   └── styles/         # Global CSS styles
│   └── public/             # Static assets
└── screenshots/            # Project documentation images
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Stripe account (for payment processing)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```
   SECRET_KEY=your-secret-key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   Also remember to updata Paymentform.js with your publishable stripe key !
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start backend server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 📊 Database Models

### User Model
- **Custom User**: Extended Django User model with landlord/tenant roles
- **Fields**: email, first_name, last_name, phone, landlord (boolean), tenant (boolean)

### Property Model
- **Fields**: title, description, address, price, bedrooms, bathrooms, available, landlord (FK)

### Payment Model
- **Fields**: tenant (FK), property (FK), amount, stripe_payment_intent_id, status, created_at

## 🔐 Authentication Flow

1. **Registration**: Users register as either landlord or tenant
2. **Login**: JWT tokens generated for authenticated sessions
3. **Role Detection**: System automatically routes to appropriate dashboard
4. **Token Management**: Automatic token refresh and blacklisting on logout

## 💳 Payment Integration

### Stripe Setup
- **Payment Intents**: Secure payment processing
- **Webhooks**: Real-time payment status updates
- **Receipts**: Automatic email receipts via Stripe

### Payment Flow
1. Tenant selects property
2. System creates Stripe Payment Intent
3. Secure payment via Stripe Elements
4. Webhook confirms payment status
5. Payment record updated in database

## 🖥️ User Interface

### Landing Page
![Home Page](screenshots/Screenshot%202025-08-18%20204309.png)
*Welcome page with navigation to login/register*

### Authentication Pages
![Login Page](screenshots/Screenshot%202025-08-19%20073459.png)
*Secure login with role-based routing*

![Register Page](screenshots/Screenshot%202025-08-19%20073526.png)
*Registration form with landlord/tenant selection*

### Landlord Dashboard
![Landlord Dashboard](screenshots/Screenshot%202025-08-19%20073635.png)
*Comprehensive property management interface*

### Property Management
![Property Creation](screenshots/Screenshot%202025-08-19%20073804.png)
*Add new properties with detailed information*

### Tenant Dashboard
![Tenant Dashboard](screenshots/Screenshot%202025-08-19%20073826.png)
*Personalized dashboard with assigned properties*

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend (Django)
- **Platform**: Heroku, Railway, or DigitalOcean
- **Database**: PostgreSQL for production
- **Static Files**: WhiteNoise or AWS S3

### Frontend (React)
- **Platform**: Vercel, Netlify, or AWS Amplify
- **Build Command**: `npm run build`
- **Environment Variables**: REACT_APP_API_URL

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Token refresh

### Properties
- `GET /api/properties/` - List all properties
- `POST /api/properties/` - Create new property (landlords only)
- `GET /api/properties/:id/` - Property details
- `PUT /api/properties/:id/` - Update property
- `DELETE /api/properties/:id/` - Delete property

### Payments
- `POST /api/payments/create/` - Create payment intent
- `GET /api/payments/history/` - Payment history
- `POST /api/payments/webhook/` - Stripe webhook endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contact

- **Project Maintainer**: GEORGE MWANGI
- **LinkedIn**: [\[My LinkedIn Profile\]](https://www.linkedin.com/in/georgemgichuru/)

## 🙏 Acknowledgments

- [Django](https://www.djangoproject.com/) for the robust backend framework
- [React](https://reactjs.org/) for the powerful frontend library
- [Stripe](https://stripe.com/) for secure payment processing
- [Django REST Framework](https://www.django-rest-framework.org/) for API development
