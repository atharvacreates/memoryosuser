export default async function handler(req, res) {
  console.log(`[SIMPLE API] ${req.method} /api/memories-simple called`);
  console.log(`[SIMPLE API] Request body:`, req.body);
  console.log(`[SIMPLE API] Request headers:`, req.headers);

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log(`[SIMPLE API] OPTIONS request handled`);
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Return a simple test response
      res.json({
        message: "Simple memories API is working!",
        memories: [
          {
            id: "test-1",
            title: "Test Memory",
            content: "This is a test memory to verify the API is working",
            type: "note",
            tags: ["test", "api"],
            createdAt: new Date().toISOString()
          }
        ],
        success: true
      });
    } catch (error) {
      console.error("Error in simple memories API:", error);
      res.status(500).json({ error: "Failed to fetch memories", success: false });
    }
  } else if (req.method === 'POST') {
    try {
      console.log(`[SIMPLE API] Received POST request with body:`, req.body);
      
      // Validate basic data
      if (!req.body.title || !req.body.content) {
        return res.status(400).json({ 
          error: "Title and content are required",
          success: false 
        });
      }

      // Return success response
      res.status(201).json({
        message: "Memory saved successfully (test mode)",
        memory: {
          id: `test-${Date.now()}`,
          title: req.body.title,
          content: req.body.content,
          type: req.body.type || "note",
          tags: req.body.tags || [],
          createdAt: new Date().toISOString()
        },
        success: true
      });
    } catch (error) {
      console.error("Error in simple memories API POST:", error);
      res.status(500).json({ error: "Failed to save memory", success: false });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
