export default async function handler(req, res) {
    console.log(`[TEST API] ${req.method} /api/test called`);

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // Check environment variables
        const envCheck = {
            NODE_ENV: process.env.NODE_ENV,
            SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL ? 'SET' : 'NOT SET',
            OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET',
            VERCEL: process.env.VERCEL ? 'YES' : 'NO',
            timestamp: new Date().toISOString()
        };

        console.log(`[TEST API] Environment check:`, envCheck);

        res.json({
            message: "API is working!",
            environment: envCheck,
            success: true
        });
    } catch (error) {
        console.error("Error in test endpoint:", error);
        res.status(500).json({
            error: "Failed to process test request",
            details: error.message,
            success: false
        });
    }
}
