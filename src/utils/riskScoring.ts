import { CustomerData, RiskScore } from '../types/customer';

// Risk scoring configuration constants
const CREDIT_SCORE_WEIGHT = 40;
const REPAYMENT_HISTORY_WEIGHT = 30;
const LOAN_RATIO_WEIGHT = 30;
const DEFAULT_LOAN_PERIOD_MONTHS = 24;

const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 60
} as const;

/**
 * Calculate risk score for a customer based on:
 * 1. Credit score (weight: 40%)
 * 2. Loan repayment history (weight: 30%)
 * 3. Outstanding loans vs income ratio (weight: 30%)
 * 
 * Higher score = Higher risk (0-100 scale)
 */
export const calculateRiskScore = (
  customer: CustomerData,
  loanPeriodMonths: number = DEFAULT_LOAN_PERIOD_MONTHS
): RiskScore => {
  // Input validation
  if (customer.creditScore < 300 || customer.creditScore > 850) {
    throw new Error('Credit score must be between 300 and 850');
  }
  if (customer.monthlyIncome < 0) {
    throw new Error('Monthly income cannot be negative');
  }
  if (customer.outstandingLoans < 0) {
    throw new Error('Outstanding loans cannot be negative');
  }

  // 1. Credit Score Impact (40% of total)
  const minCreditScore = 300;
  const maxCreditScore = 850;
  const normalizedCreditScore = Math.max(0, Math.min(1, (maxCreditScore - customer.creditScore) / (maxCreditScore - minCreditScore)));
  const creditScoreImpact = normalizedCreditScore * CREDIT_SCORE_WEIGHT;

  // 2. Loan Repayment History Impact (30% of total)
  const repaymentHistoryLength = customer.loanRepaymentHistory.length;
  const repaymentHistoryImpact = repaymentHistoryLength === 0
    ? REPAYMENT_HISTORY_WEIGHT / 2 // Neutral score if no history
    : (customer.loanRepaymentHistory.filter(payment => payment === 0).length / repaymentHistoryLength) * REPAYMENT_HISTORY_WEIGHT;

  // 3. Outstanding Loans vs Income Ratio Impact (30% of total)
  const monthlyLoanBurden = customer.outstandingLoans / loanPeriodMonths;
  const loanToIncomeRatio = monthlyLoanBurden / customer.monthlyIncome;
  const normalizedRatio = Math.min(1, loanToIncomeRatio / 0.5);
  const loanToIncomeRatioImpact = normalizedRatio * LOAN_RATIO_WEIGHT;

  // Calculate total risk score (0-100)
  const totalScore = creditScoreImpact + repaymentHistoryImpact + loanToIncomeRatioImpact;

  // Determine risk level
  let riskLevel: 'Low' | 'Medium' | 'High';
  if (totalScore < RISK_THRESHOLDS.LOW) {
    riskLevel = 'Low';
  } else if (totalScore < RISK_THRESHOLDS.MEDIUM) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'High';
  }

  return {
    customerId: customer.customerId,
    score: Math.round(totalScore),
    level: riskLevel,
    factors: {
      creditScoreImpact: Math.round(creditScoreImpact),
      repaymentHistoryImpact: Math.round(repaymentHistoryImpact),
      loanToIncomeRatioImpact: Math.round(loanToIncomeRatioImpact)
    }
  };
};

/**
 * Calculate risk scores for all customers
 */
export const calculateAllRiskScores = (customers: CustomerData[]): RiskScore[] => {
  return customers.map(customer => calculateRiskScore(customer));
};

/**
 * Get color based on risk level
 */
export const getRiskColor = (score: number): string => {
  if (score < 30) {
    return '#52c41a'; // Green for low risk
  } else if (score < 60) {
    return '#faad14'; // Yellow/Orange for medium risk
  } else {
    return '#f5222d'; // Red for high risk
  }
};