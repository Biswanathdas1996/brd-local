import fs from 'fs';
import path from 'path';

export interface ProcessedFile {
  content: string;
  filename: string;
  fileType: string;
}

export async function processUploadedFile(filePath: string, originalName: string): Promise<ProcessedFile> {
  const fileExtension = path.extname(originalName).toLowerCase();
  let content: string;

  try {
    switch (fileExtension) {
      case '.txt':
        content = await fs.promises.readFile(filePath, 'utf-8');
        break;
      
      case '.pdf':
        // For PDF processing, we would use pdf-parse
        // Since we can't install packages, we'll read as text for now
        content = await fs.promises.readFile(filePath, 'utf-8');
        break;
      
      case '.docx':
        // For DOCX processing, we would use mammoth
        // Since we can't install packages, we'll read as text for now
        content = await fs.promises.readFile(filePath, 'utf-8');
        break;
      
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    // Clean up the uploaded file
    await fs.promises.unlink(filePath);

    return {
      content: content.trim(),
      filename: originalName,
      fileType: fileExtension.substring(1), // Remove the dot
    };
  } catch (error) {
    // Clean up the file even if processing failed
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkError) {
      console.error('Failed to clean up uploaded file:', unlinkError);
    }
    
    throw new Error(`Failed to process file: ${error.message}`);
  }
}

export function getSampleTranscripts(): Array<{ name: string; content: string; processArea: string; targetSystem: string }> {
  return [
    {
      name: "loan_processing_workshop.txt",
      content: `Workshop Transcript - Loan Processing Requirements

Date: March 15, 2024
Participants: Operations Manager, Credit Manager, IT Lead, Business Analyst

Operations Manager: We need to streamline our loan application process. Currently, it takes too long to approve simple loans.

Credit Manager: The main bottleneck is manual credit score verification. We're still calling credit bureaus manually for each application.

IT Lead: Our current system doesn't integrate well with external credit services. We need API integration capabilities.

Business Analyst: What's the target processing time for standard loan applications?

Operations Manager: Ideally, we want standard personal loans under $50K to be approved within 24 hours, and auto loans within 48 hours.

Credit Manager: We also need automated decision rules based on credit score, debt-to-income ratio, and employment verification.

IT Lead: For security, all customer data must be encrypted both at rest and in transit. We need audit logs for all credit checks.

Operations Manager: The system should also generate approval letters automatically and integrate with our account management system to set up the loan accounts.

Credit Manager: Don't forget about regulatory compliance - we need to ensure all decisions are documented with clear reasoning for audit purposes.

Business Analyst: What about exception handling for applications that don't meet automated criteria?

Operations Manager: Those should be flagged for manual review by our underwriting team, with all relevant data pre-populated for quick decision making.`,
      processArea: "loan_processing",
      targetSystem: "finacle"
    },
    {
      name: "customer_onboarding_session.docx",
      content: `Customer Onboarding Workshop - Digital Transformation Initiative

Workshop Date: March 14, 2024
Client: Premier Financial Services
Focus: CRM Integration for Customer Onboarding

Key Requirements Discussed:

1. Digital Account Opening
- Customers should be able to open accounts online without visiting branches
- Identity verification must be automated using government ID APIs
- Document upload and verification system needed
- Electronic signature integration required

2. Customer Data Management
- Single customer view across all channels
- Real-time data synchronization between systems
- Customer communication preferences tracking
- Marketing consent management

3. Onboarding Workflow
- Step-by-step guided process for different account types
- Progress tracking for incomplete applications
- Automated email/SMS notifications at each stage
- Customer service integration for support during onboarding

4. Compliance Requirements
- KYC (Know Your Customer) compliance automation
- AML (Anti-Money Laundering) screening integration
- Regulatory reporting capabilities
- Data privacy compliance (GDPR, CCPA)

5. Integration Points
- Core banking system integration
- Credit bureau connectivity
- Identity verification services
- Email/SMS gateway integration
- Document management system

6. Performance Requirements
- Account opening process should complete in under 15 minutes
- System must handle 1000+ concurrent users
- 99.9% uptime requirement
- Mobile-responsive design mandatory

Success Metrics:
- Reduce account opening time from 2 days to same-day
- Increase customer satisfaction scores by 25%
- Reduce manual processing by 80%`,
      processArea: "customer_onboarding",
      targetSystem: "salesforce_crm"
    },
    {
      name: "risk_management_requirements.pdf",
      content: `Risk Management System Requirements Workshop

Metro Credit Union - Risk Management Implementation
Date: March 13, 2024

Executive Summary:
Metro Credit Union requires implementation of comprehensive risk management capabilities to enhance their current risk assessment and monitoring processes.

Current State Analysis:
- Manual risk assessment processes
- Fragmented data sources
- Limited real-time monitoring
- Regulatory compliance challenges
- Inconsistent risk reporting

Future State Requirements:

1. Credit Risk Management
- Automated credit scoring models
- Portfolio risk analysis
- Concentration risk monitoring
- Early warning systems for deteriorating loans
- Stress testing capabilities

2. Operational Risk
- Incident tracking and management
- Key Risk Indicator (KRI) monitoring
- Control effectiveness assessment
- Risk event correlation analysis
- Business continuity planning integration

3. Market Risk
- Interest rate risk measurement
- Liquidity risk monitoring
- Asset-liability management
- Value at Risk (VaR) calculations
- Scenario analysis capabilities

4. Regulatory Compliance
- Automated regulatory reporting
- Compliance monitoring dashboards
- Audit trail maintenance
- Policy exception tracking
- Regulatory change management

5. Risk Reporting
- Executive dashboard development
- Risk appetite monitoring
- Regulatory report generation
- Board-level risk presentations
- Trend analysis and forecasting

Technical Requirements:
- Real-time data processing capabilities
- Integration with core banking systems
- Advanced analytics and modeling tools
- Secure data handling and storage
- Scalable architecture for future growth

Performance Criteria:
- Sub-second response times for risk queries
- 24/7 system availability
- Processing of 10M+ transactions daily
- Support for 500+ concurrent users
- 99.95% system uptime requirement`,
      processArea: "risk_management",
      targetSystem: "sas_risk"
    }
  ];
}
