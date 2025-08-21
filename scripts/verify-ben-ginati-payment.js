#!/usr/bin/env node

// Verify Ben Ginati Payment Status in QuickBooks
// This script connects to QuickBooks API to check payment status

const axios = require('axios');

class QuickBooksPaymentVerifier {
      constructor() {
    // Load fresh credentials from file
    const fs = require('fs');
    let freshCreds = {};
    try {
      const credsData = fs.readFileSync('./quickbooks-fresh-credentials.json', 'utf8');
      freshCreds = JSON.parse(credsData);
      console.log('✅ Using fresh QuickBooks credentials');
    } catch (error) {
      console.log('⚠️ Could not load fresh credentials, using defaults');
    }

    this.quickbooksConfig = {
      appId: 'ad9e9fe8-0977-4ece-a2d3-292ab583359f',
      clientId: freshCreds.clientId || 'ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f',
      clientSecret: freshCreds.clientSecret || 'Cf2WeEhdIZLoJCKs60YrR17yMeqLJmth2WaSuK3j',
      realmId: freshCreds.realmId || '9341454031329905',
      accessToken: freshCreds.accessToken || 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..r_0S72OaED8qOuTsyfaprg.J-oQTAwkRmUMtB1Rsutjp1pC-a66-uwlkLo47nuBqo3snX5yBDbl8PsmcPELWcD8fDeTW9Z3MaM9gg-uvVNFF5xx3Llqw04mOHsYEOPfWTAU-SC8Ma07w28MiYkiSNQmBsIplzfkMSyTXW5FfzA7hCyqvz1834FPmxmikpnw2Ugxep4n3I3rXqEBN0M0eNZG2MDQ6_2y51H1WRgiEvpf-FpdQZwEqdDbHMTSMnSKY-WmO4VaDya0QDMm9AdjHF3CuXFO6eHkqOHjZrcgKmUvGM3pqtDdPJgHZTbcLSr1jBhgNTwfV7oQ5LngTQFHFrMcYKH6opIyINMssPfAKGGyebikV2u8rW6opfxqvO5qJoiSuz41ac6XvR2AkoHLEeTusUjQV65U52kQcqPzjv9Ag2dJg9lLsR_zJfoeg3beCu2FmJlC_8PGGdVo6OrItBvRHOH06Mzr72APxP4_FRg0pcJEPaK9Hkoikop_zGBf_FyFrXIQ-ygbiIfry1rX2pX1vZPRqNu-N4KkYrN17op09DcO6tanYVsn2VRYOhM8qI3Mq7KMX5SKC7wAdmKhOEgMq2i_2dHOxEuN2Fh7VWIAsNcienmGksyf8i-PHQl8P3g5nJzVCQU_YftOfEy_B30G.KaNRlBMwRJd92fCDzz1HEw',
      refreshToken: freshCreds.refreshToken || 'RT1-221-H0-1763094209oksbcubkf2wk7bfh6ll6',
      baseUrl: 'https://quickbooks.api.intuit.com/v3/company'
    };
    }

    async verifyBenGinatiPayment() {
        try {
            console.log('🔍 VERIFYING BEN GINATI PAYMENT STATUS IN QUICKBOOKS');
            console.log('📊 Connecting to QuickBooks API...');

            // First, let's check if we can connect to QuickBooks
            const connectionTest = await this.testQuickBooksConnection();
            if (!connectionTest.success) {
                console.log('❌ Failed to connect to QuickBooks:', connectionTest.error);
                return;
            }

            console.log('✅ Successfully connected to QuickBooks!');

            // Search for Ben Ginati customer
            const customer = await this.findCustomer('Ben Ginati');
            if (!customer) {
                console.log('❌ Ben Ginati customer not found in QuickBooks');
                return;
            }

            console.log('✅ Found Ben Ginati customer in QuickBooks');
            console.log(`📋 Customer ID: ${customer.Id}`);
            console.log(`📋 Customer Name: ${customer.DisplayName}`);

            // Get invoices for Ben Ginati
            const invoices = await this.getCustomerInvoices(customer.Id);
            console.log(`📊 Found ${invoices.length} invoices for Ben Ginati`);

            // Calculate payment status
            const paymentStatus = this.calculatePaymentStatus(invoices);
            
            console.log('\n💰 BEN GINATI PAYMENT STATUS:');
            console.log(`📊 Total Invoiced: $${paymentStatus.totalInvoiced}`);
            console.log(`💳 Total Paid: $${paymentStatus.totalPaid}`);
            console.log(`⏳ Outstanding: $${paymentStatus.outstanding}`);
            console.log(`📈 Payment Progress: ${paymentStatus.progressPercentage}%`);

            // Update customer profile with real payment data
            await this.updateCustomerProfile(paymentStatus);

            return paymentStatus;

        } catch (error) {
            console.error('❌ Error verifying Ben Ginati payment:', error.message);
            throw error;
        }
    }

    async testQuickBooksConnection() {
        try {
            const response = await axios.get(`${this.quickbooksConfig.baseUrl}/${this.quickbooksConfig.realmId}/companyinfo/${this.quickbooksConfig.realmId}`, {
                headers: {
                    'Authorization': `Bearer ${this.quickbooksConfig.accessToken}`,
                    'Accept': 'application/json'
                }
            });
            
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async findCustomer(customerName) {
        try {
            const response = await axios.get(`${this.quickbooksConfig.baseUrl}/${this.quickbooksConfig.realmId}/query`, {
                headers: {
                    'Authorization': `Bearer ${this.quickbooksConfig.accessToken}`,
                    'Accept': 'application/json'
                },
                params: {
                    query: `SELECT * FROM Customer WHERE DisplayName = '${customerName}'`
                }
            });

            const customers = response.data.QueryResponse.Customer;
            return customers && customers.length > 0 ? customers[0] : null;
        } catch (error) {
            console.error('Error finding customer:', error.message);
            return null;
        }
    }

    async getCustomerInvoices(customerId) {
        try {
            const response = await axios.get(`${this.quickbooksConfig.baseUrl}/${this.quickbooksConfig.realmId}/query`, {
                headers: {
                    'Authorization': `Bearer ${this.quickbooksConfig.accessToken}`,
                    'Accept': 'application/json'
                },
                params: {
                    query: `SELECT * FROM Invoice WHERE CustomerRef = '${customerId}'`
                }
            });

            return response.data.QueryResponse.Invoice || [];
        } catch (error) {
            console.error('Error getting invoices:', error.message);
            return [];
        }
    }

    calculatePaymentStatus(invoices) {
        let totalInvoiced = 0;
        let totalPaid = 0;

        invoices.forEach(invoice => {
            const amount = parseFloat(invoice.TotalAmt) || 0;
            const balance = parseFloat(invoice.Balance) || 0;
            
            totalInvoiced += amount;
            totalPaid += (amount - balance);
        });

        const outstanding = totalInvoiced - totalPaid;
        const progressPercentage = totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : 0;

        return {
            totalInvoiced: totalInvoiced.toFixed(2),
            totalPaid: totalPaid.toFixed(2),
            outstanding: outstanding.toFixed(2),
            progressPercentage,
            invoices: invoices.length
        };
    }

    async updateCustomerProfile(paymentStatus) {
        try {
            // Update the customer profile with real QuickBooks data
            const customerProfile = {
                customer: {
                    name: "Ben Ginati",
                    email: "ai@tax4us.co.il",
                    company: "Tax4Us",
                    website: "https://tax4us.co.il",
                    industry: "Tax Services",
                    businessSize: "small",
                    primaryUseCase: "Content automation for tax services website and podcast",
                    currentAutomationLevel: "none",
                    plan: "enterprise",
                    status: "partially_active",
                    billingCycle: "project",
                    projectTimeline: "2-3 months",
                    budget: "$5000",
                    successMetrics: "Content automation, podcast production, social media engagement",
                    notes: "Needs 4 agents: WordPress content, WordPress blog/posts, podcast, social media. Payment: $5000 in 2 installments (start + completion).",
                    paymentStatus: {
                        totalInvoiced: parseFloat(paymentStatus.totalInvoiced),
                        totalPaid: parseFloat(paymentStatus.totalPaid),
                        outstanding: parseFloat(paymentStatus.outstanding),
                        progressPercentage: parseFloat(paymentStatus.progressPercentage),
                        invoices: paymentStatus.invoices,
                        lastUpdated: new Date().toISOString()
                    },
                    createdAt: "2025-01-15T00:00:00.000Z",
                    updatedAt: new Date().toISOString()
                }
            };

            // Save updated profile
            const fs = require('fs');
            const path = require('path');
            
            const profilePath = path.join(__dirname, '../archived/data/customers/ben-ginati/customer-profile.json');
            fs.writeFileSync(profilePath, JSON.stringify(customerProfile, null, 2));

            console.log('✅ Updated Ben Ginati customer profile with real QuickBooks data');
            console.log(`📁 Profile saved to: ${profilePath}`);

        } catch (error) {
            console.error('❌ Error updating customer profile:', error.message);
        }
    }
}

// Execute the verification
async function main() {
    const verifier = new QuickBooksPaymentVerifier();
    
    try {
        const paymentStatus = await verifier.verifyBenGinatiPayment();
        
        if (paymentStatus) {
            console.log('\n🎯 PAYMENT VERIFICATION COMPLETE');
            console.log('📊 Real QuickBooks data retrieved and profile updated');
            console.log('🚀 Ready to proceed with Ben Ginati agent deployment');
        }
    } catch (error) {
        console.error('❌ Payment verification failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = QuickBooksPaymentVerifier;
