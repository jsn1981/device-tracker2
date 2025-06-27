const axios = require('axios'); // Add at the top
exports.handler = async (event) => {
    try {
        // 1. Decode the tracking data
        const rawData = event.queryStringParameters.d;
        const trackingData = JSON.parse(Buffer.from(rawData, 'base64').toString());
        
        
        // 2. Add server-side verified data
        trackingData.serverVerified = {
            ip: event.headers['x-nf-client-connection-ip'],
            country: event.headers['x-nf-ip-country'],
            city: event.headers['x-nf-ip-city'],
            asn: event.headers['x-nf-ip-asn']
        };

        // 3. Log the complete data
        console.log("📡 Tracking Data:", trackingData);

        
        // Get API key from environment variables
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
        if (!SENDGRID_API_KEY) throw new Error("SendGrid API key missing");

        // Send email
        await axios.post(
            'https://api.sendgrid.com/v3/mail/send',
            {
                personalizations: [{ 
                to: [
                    { email: "jyotisankar.nayak@gmail.com" },
                    { email: "sridivyasuryanarayana@example.com" }
                ],
                from: { 
                    email: "jyotisankar.nayak@gmail.com", // MUST be verified
                    name: "Device Tracker" 
                },
                subject: "New Visitor Data Logged",
                content: [{
                    type: "text/plain",
                    value: `New tracking data:\n${JSON.stringify(trackingData, null, 2)}`
                }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 4. Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({
                status: "success",
                message: "Data logged successfully"
            })
        };
        
    } catch (error) {
        // 5. Handle errors gracefully
        console.error("❌ Error:", error);
        return {
            statusCode: 200, // Still return 200 to prevent breaking the redirect
            body: JSON.stringify({
                status: "error",
                message: "Data logging failed but PDF will still load"
            })
        };
    }
};
