import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

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
        // For PDF files, read as text for now (proper PDF parsing can be added later)
        content = await fs.promises.readFile(filePath, 'utf-8');
        break;
      
      case '.docx':
        // Use mammoth to extract text from Word documents
        const docxResult = await mammoth.extractRawText({ path: filePath });
        content = docxResult.value;
        break;

      case '.xlsx':
      case '.xls':
        // Use xlsx to read Excel files and convert to text
        const workbook = XLSX.readFile(filePath);
        const sheets = workbook.SheetNames;
        let excelContent = '';
        
        sheets.forEach((sheetName, index) => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          excelContent += `\n=== Sheet: ${sheetName} ===\n`;
          sheetData.forEach((row: any[], rowIndex) => {
            if (row.some(cell => cell !== undefined && cell !== '')) {
              excelContent += row.join('\t') + '\n';
            }
          });
        });
        
        content = excelContent.trim();
        break;
      
      default:
        throw new Error(`Unsupported file type: ${fileExtension}. Supported formats: .txt, .pdf, .docx, .xlsx, .xls`);
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
    
    throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getSampleTranscripts(): Array<{ name: string; content: string; processArea: string; targetSystem: string }> {
  return [
    {
      name: "personal_loan_digitization.txt",
      content: `Workshop Transcript - Personal Loan Digital Processing

Date: March 15, 2024
Bank: HDFC Bank
Participants: Branch Manager, Credit Officer, IT Head, Compliance Officer

Branch Manager: We need to digitize our personal loan processing to compete with fintech companies. Current TAT is 7-10 days which is too long.

Credit Officer: Main challenges are CIBIL verification, income assessment, and KYC compliance. We're still doing manual verification for most documents.

IT Head: Our current Finacle system can integrate with CIBIL and other bureau APIs. We need to automate the credit scoring based on RBI guidelines.

Compliance Officer: What about KYC compliance and RBI regulations for digital lending?

Branch Manager: We want to reduce processing time to 24-48 hours for loans up to ₹5 lakh with proper risk assessment.

Credit Officer: We need automated FOIR calculation, employment verification through EPFO/ITR, and integration with bank statement analysis.

IT Head: All customer data must comply with RBI data localization norms. We need audit trails for regulatory reporting.

Branch Manager: System should auto-generate loan agreements and integrate with CBS for loan booking and disbursement.

Compliance Officer: Ensure all decisions follow RBI fair lending practices and maintain detailed logs for RBI inspection.

Credit Officer: For exceptions and high-risk cases, route to senior underwriters with complete risk profile and recommendations.`,
      processArea: "loan_processing",
      targetSystem: "finacle"
    },
    {
      name: "digital_account_opening_sbi.docx",
      content: `Digital Account Opening Workshop - YONO Integration

Workshop Date: March 14, 2024
Bank: State Bank of India
Focus: Digital Account Opening through YONO Platform

Key Requirements Discussed:

1. Aadhaar-based Digital KYC
- Integrate with UIDAI for Aadhaar authentication
- Video KYC for account opening as per RBI guidelines
- PAN verification through Income Tax database
- Digital signature using Aadhaar eSign

2. Account Types & Features
- Savings account with different variants (Basic, Regular, Premium)
- Current account for business customers
- Automatic upgrade based on customer profile
- Integration with Jan Dhan Yojana requirements

3. Mobile-First Onboarding
- YONO app integration for seamless experience
- Progressive profiling with minimal initial data
- Document upload with AI-based verification
- Real-time status updates via SMS/Push notifications

4. Regulatory Compliance
- RBI KYC norms compliance
- PMLA (Prevention of Money Laundering Act) requirements
- UBO (Ultimate Beneficial Owner) verification for entities
- FATCA/CRS compliance for NRI customers

5. System Integration
- Core Banking System (Finacle) integration
- CIBIL and other credit bureau connectivity
- Aadhaar verification through UIDAI
- PAN verification through NSDL/UTI
- Mobile number verification through telecom APIs

6. Performance & Security
- Account opening within 10 minutes for existing customers
- Fraud prevention with real-time monitoring
- Data encryption as per RBI cybersecurity guidelines
- Biometric authentication support

Success Metrics:
- 90% digital account opening by FY end
- Reduce branch visits by 70%
- Customer satisfaction score above 4.5/5`,
      processArea: "customer_onboarding",
      targetSystem: "finacle"
    },
    {
      name: "upi_integration_requirements.pdf",
      content: `UPI Integration Requirements Workshop

ICICI Bank - UPI Payment Gateway Enhancement
Date: March 13, 2024

Executive Summary:
ICICI Bank requires enhanced UPI integration capabilities to improve digital payment processing and customer experience in line with NPCI guidelines.

Current State Analysis:
- Basic UPI integration with limited features
- Manual reconciliation processes
- Delayed transaction status updates
- Limited support for UPI 2.0 features
- Inconsistent payment success rates

Future State Requirements:

1. UPI 2.0 Feature Implementation
- UPI Mandate for recurring payments
- Signed Intent QR codes
- Invoice in the Inbox functionality
- UPI ID with bank account linking
- Overdraft facility integration

2. Real-time Processing
- Instant payment confirmation
- Real-time balance updates
- Push notification integration
- Transaction status tracking
- Automated reconciliation

3. Merchant Integration
- QR code generation and management
- Merchant dashboard for transaction monitoring
- Settlement and remittance automation
- Dispute management system
- Analytics and reporting tools

4. Regulatory Compliance
- NPCI guidelines adherence
- RBI digital payment norms
- AML transaction monitoring
- Fraud detection and prevention
- Regulatory reporting automation

5. Security Framework
- Two-factor authentication
- Device fingerprinting
- Risk-based authentication
- Transaction limits management
- Secure API gateway

6. Integration Points
- Core Banking System (TCS BaNCS)
- NPCI UPI switch connectivity
- SMS gateway integration
- Push notification services
- Fraud management system

Performance Requirements:
- 99.9% transaction success rate
- Response time under 5 seconds
- Support for 10,000 TPS
- 24x7 availability
- Zero-downtime deployments

Success Metrics:
- Increase UPI transaction volume by 200%
- Reduce transaction failures to <1%
- Improve customer satisfaction to 4.8/5`,
      processArea: "payment_processing",
      targetSystem: "npci_upi"
    },
    {
      name: "loan_portfolio_analysis.xlsx",
      content: `=== Sheet: Loan Portfolio Summary ===
Month   Total Loans     Amount (Crores) NPAs    Recovery Rate
Jan 2024        2450    1250.5  45      92.3%
Feb 2024        2680    1420.8  38      94.1%
Mar 2024        2890    1580.2  52      89.7%

=== Sheet: Risk Assessment ===
Risk Category   Count   Percentage      Action Required
Low Risk        1890    65.4%   Standard Processing
Medium Risk     756     26.2%   Enhanced Due Diligence
High Risk       244     8.4%    Manual Review

=== Sheet: Process Requirements ===
Requirement     Current State   Target State    Priority
Automated Credit Scoring        Manual Review   AI-Based System High
Real-time Risk Assessment       Batch Processing        Real-time API   Medium
Document Verification   Physical Verification   Digital KYC     High
Loan Disbursement       4-5 Days        Same Day        High

Workshop Notes: The bank requires a comprehensive loan processing system that can handle increased volume while maintaining risk controls. Key focus areas include automation of credit decisions, integration with external data sources (CIBIL, GST, ITR), and compliance with RBI lending guidelines.`,
      processArea: "loan_processing",
      targetSystem: "finacle"
    }
  ];
}
