# Credit Risk Dashboard 🎯

A modern, responsive web application for managing and analyzing credit risk assessments built with React, TypeScript, and Ant Design.

![Dashboard Screenshot](/credit-risk-dashboard/client/public/screenshots/dashboard_Dark.png)

## 🌟 Features

### 📊 Dashboard Overview
- Real-time customer financial metrics
- Interactive income vs. expenses charts
- Risk distribution visualization
- Customer data table with sorting and filtering

### 🔍 Risk Assessment
- Sophisticated risk scoring algorithm
- Risk factor breakdown analysis
- Visual risk indicators and trends
- Customizable risk thresholds

### 🔄 Workflow Management
- Status tracking (Review, Approved, Rejected)
- High-risk alerts
- Automated workflow triggers
- Decision notes and history

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Ant Design UI Framework
- Recharts for data visualization
- React Router for navigation

### Backend
- Node.js
- Express
- TypeScript
- RESTful API architecture

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository
```bash

Client: git clone https://github.com/ROKU24/Client-Risk-Dashboard

Server: git clone https://github.com/ROKU24/client-risk-dashboard-backend

cd credit-risk-dashboard
```

2. Install dependencies for server
```bash
cd server
npm install
```

3. Install dependencies for client
```bash
cd ../client
npm install
```

4. Start the development server
```bash
# In server directory
npm run dev

# In client directory (new terminal)
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:50001

## 📋 API Documentation

### Endpoints

#### Get Customers
```http
GET /api/customers
```
Returns a list of all customers with their financial data.

#### Update Customer Status
```http
PUT /api/customers/:id
```
Update a customer's approval status.

#### High Risk Alerts
```http
POST /api/alerts
```
Log high-risk customer approvals.

## 🏗️ Project Structure

```
credit-risk-dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Utility functions
│   │   ├── types/        # TypeScript type definitions
│   │   └── App.tsx       # Main application component
│   └── public/           # Static assets
├── server/                # Backend Node.js server
│   ├── data/            # JSON data storage
│   ├── controllers/     # Request handlers
│   ├── routes/         # API routes
│   └── index.ts        # Server entry point
└── README.md            # Project documentation
```

## 🎨 Features in Detail

### Risk Scoring Algorithm
The risk assessment uses a sophisticated weighted scoring system based on three key factors:

#### Credit Score (40% of total risk score)
- Excellent (800-850): 0-10 points
- Very Good (740-799): 11-15 points
- Good (670-739): 16-25 points
- Fair (580-669): 26-35 points
- Poor (300-579): 36-40 points

#### Loan Repayment History (30% of total risk score)
- Based on the last 6 months of payments
- Each missed payment adds 5 points
- Perfect payment history: 0 points
- Multiple consecutive missed payments have increased weight
- Maximum impact: 30 points

#### Loan-to-Income Ratio (30% of total risk score)
- < 20%: 0-5 points (Low risk)
- 20-36%: 6-15 points (Moderate risk)
- 37-42%: 16-25 points (High risk)
- > 42%: 26-30 points (Very high risk)

#### Final Risk Score Interpretation
- 0-40: Low Risk (Green)
- 41-70: Medium Risk (Orange)
- 71-100: High Risk (Red)

The system automatically calculates these scores and provides visual indicators for quick assessment. Risk factors are weighted and normalized to provide a final score out of 100, where lower scores indicate lower risk.

### Dark Mode Support
Full dark mode support with:
- Consistent theming
- High contrast ratios

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interfaces


## 🙏 Acknowledgments

- [Ant Design](https://ant.design/) for the beautiful UI components
- [Recharts](https://recharts.org/) for the charting library
- [TypeScript](https://www.typescriptlang.org/) for type safety