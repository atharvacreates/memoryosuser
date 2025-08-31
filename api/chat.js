// Standalone chat API for Vercel deployment
export default async function handler(req, res) {
  console.log(`[CHAT API] ${req.method} /api/chat called`);
  console.log(`[CHAT API] Request body:`, req.body);

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log(`[CHAT API] OPTIONS request handled`);
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log(`[CHAT API] Processing chat message`);
    
    // Basic validation
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const lastMessage = req.body.messages[req.body.messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return res.status(400).json({ error: "Last message must be from user" });
    }

    // For now, return a simple response - we'll implement AI later
    const response = `Hello! I received your message: "${lastMessage.content}". This is a test response from the chat API. In the full version, I would use AI to provide intelligent responses based on your memories.`;
    
    console.log(`[CHAT API] Chat response generated successfully`);
    res.json({ 
      message: response,
      relevantMemories: [],
      success: true
    });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
}