import { NextRequest, NextResponse } from 'next/server';
import { ESignaturesApi } from '@/lib/esignatures';

// Rensto contract template
const CONTRACT_TEMPLATE = `
AUTOMATION SERVICES AGREEMENT

This Automation Services Agreement ("Agreement") is entered into as of {date} between:

RENSTO ("Service Provider")
And
{client_name} ("Client")
Email: {client_email}

---

1. SCOPE OF SERVICES

Service Provider agrees to provide the following automation services:

{service_description}

Selected Package: {package_name}
Package Price: {package_price}
Monthly Maintenance: {monthly_fee}

Deliverables:
{deliverables}

---

2. PAYMENT TERMS

2.1 Initial Payment: Client agrees to pay {package_price} USD upon signing this Agreement.
2.2 Monthly Maintenance: Client agrees to pay {monthly_fee} USD per month, billed on the same day each month.
2.3 Payment Method: All payments will be processed via Stripe.

---

3. TIMELINE

Estimated Project Duration: {timeline}

The timeline begins upon:
a) Receipt of full initial payment
b) Receipt of all required assets and access credentials listed below

Required from Client:
{requirements}

---

4. INTELLECTUAL PROPERTY

4.1 Client owns all custom automations created specifically for their use.
4.2 Service Provider retains rights to general frameworks and reusable components.
4.3 Third-party integrations remain subject to their respective terms.

---

5. CONFIDENTIALITY

Both parties agree to maintain confidentiality of proprietary information shared during the project.

---

6. LIMITATION OF LIABILITY

Service Provider's liability is limited to the amount paid for services. Neither party shall be liable for indirect, incidental, or consequential damages.

---

7. TERMINATION

7.1 Either party may terminate with 30 days written notice.
7.2 Client is responsible for payment of services rendered up to termination date.
7.3 Monthly maintenance can be cancelled with 30 days notice.

---

8. AGREEMENT

By signing below, both parties acknowledge and agree to all terms stated above.

Client Signature: _________________________ Date: _________
Name: {client_name}

Service Provider: RENSTO
Authorized Representative: Shai Friedman

---

Questions? Contact support@rensto.com
`;

interface ContractData {
    clientName: string;
    clientEmail: string;
    packageName: string;
    packagePrice: number;
    monthlyFee: number;
    serviceDescription: string;
    deliverables: string[];
    requirements: string[];
    timeline: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: ContractData = await request.json();
        const esign = new ESignaturesApi();

        // Format the contract with actual values
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedContract = CONTRACT_TEMPLATE
            .replace(/{date}/g, today)
            .replace(/{client_name}/g, body.clientName)
            .replace(/{client_email}/g, body.clientEmail)
            .replace(/{package_name}/g, body.packageName)
            .replace(/{package_price}/g, `$${body.packagePrice.toLocaleString()}`)
            .replace(/{monthly_fee}/g, `$${body.monthlyFee}`)
            .replace(/{service_description}/g, body.serviceDescription)
            .replace(/{deliverables}/g, (body.deliverables || []).map((d, i) => `${i + 1}. ${d}`).join('\n'))
            .replace(/{requirements}/g, (body.requirements || []).map((r, i) => `${i + 1}. ${r}`).join('\n'))
            .replace(/{timeline}/g, body.timeline);

        const result = await esign.createContract({
            template_id: null,
            title: `Rensto Automation Agreement - ${body.clientName}`,
            metadata: {
                client_email: body.clientEmail,
                package: body.packageName,
                price: body.packagePrice,
            },
            signers: [{ name: body.clientName, email: body.clientEmail }],
            content: formattedContract,
            redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rensto.com'}/custom/payment?signed=true`,
            webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rensto.com'}/api/webhooks/esignatures`,
            expires_in_days: 2,
            send_email: true,
            email_subject: `Your Rensto Automation Agreement - ${body.packageName}`,
            email_message: `Hi ${body.clientName},\n\nPlease review and sign your automation services agreement.\n\nThis document is valid for 48 hours.\n\nBest,\nThe Rensto Team`,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            contractId: result.contractId,
            signingUrl: result.signingUrl,
        });

    } catch (error) {
        console.error('Contract creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create contract' },
            { status: 500 }
        );
    }
}
