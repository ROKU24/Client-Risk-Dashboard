# Credit Risk Dashboard 🎯

A modern, responsive web application for managing and analyzing credit risk assessments built with React, TypeScript, and Ant Design.

![Dashboard Screenshot](screenshots/dashboard.png)

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
git clone https://github.com/yourusername/credit-risk-dashboard.git
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
The risk assessment uses a weighted scoring system based on:
- Credit Score (40%)
- Loan Repayment History (30%)
- Loan-to-Income Ratio (30%)

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