export default async function handler(req, res) {
  console.log(`[SIMPLE CHAT API] ${req.method} /api/chat-simple called`);
  console.log(`[SIMPLE CHAT API] Request body:`, req.body);
  console.log(`[SIMPLE CHAT API] Request headers:`, req.headers);

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log(`[SIMPLE CHAT API] OPTIONS request handled`);
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log(`[SIMPLE CHAT API] Received POST request with body:`, req.body);
    
    // Validate basic data
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      return res.status(400).json({ 
        error: "Messages array is required",
        success: false 
      });
    }

    const lastMessage = req.body.messages[req.body.messages.length - 1];
    if (!lastMessage || !lastMessage.content) {
      return res.status(400).json({ 
        error: "Last message must have content",
        success: false 
      });
    }

    // Return a simple test response
    res.json({
      message: `Hello! I received your message: "${lastMessage.content}". This is a test response from the simple chat API.`,
      relevantMemories: [],
      success: true
    });
  } catch (error) {
    console.error("Error in simple chat API:", error);
    res.status(500).json({ error: "Failed to process chat message", success: false });
  }
}
