// Standalone memories API for Vercel deployment
export default async function handler(req, res) {
  console.log(`[MEMORIES API] ${req.method} /api/memories called`);
  console.log(`[MEMORIES API] Request body:`, req.body);
  console.log(`[MEMORIES API] Request headers:`, req.headers);

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log(`[MEMORIES API] OPTIONS request handled`);
    res.status(200).end();
    return;
  }

  const userId = "shared-user";

  if (req.method === 'GET') {
    try {
      // For now, return empty array - we'll implement database later
      res.json([]);
    } catch (error) {
      console.error("Error fetching memories:", error);
      res.status(500).json({ error: "Failed to fetch memories" });
    }
  } else if (req.method === 'POST') {
    try {
      console.log(`[MEMORIES API] Creating memory:`, req.body);
      
      // Basic validation
      if (!req.body.title || !req.body.content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      // Create a simple memory object
      const memory = {
        id: `memory-${Date.now()}`,
        title: req.body.title,
        content: req.body.content,
        type: req.body.type || 'note',
        tags: req.body.tags || [],
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log(`[MEMORIES API] Memory created successfully:`, memory);
      res.status(201).json(memory);
    } catch (error) {
      console.error("Error creating memory:", error);
      res.status(500).json({ error: "Failed to create memory" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      console.log(`[MEMORIES API] Updating memory ${id}:`, req.body);
      
      // For now, just return success
      res.json({ 
        message: "Memory updated successfully",
        id: id,
        success: true 
      });
    } catch (error) {
      console.error("Error updating memory:", error);
      res.status(500).json({ error: "Failed to update memory" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      console.log(`[MEMORIES API] Deleting memory ${id}`);
      
      // For now, just return success
      res.json({ 
        message: "Memory deleted successfully",
        id: id,
        success: true 
      });
    } catch (error) {
      console.error("Error deleting memory:", error);
      res.status(500).json({ error: "Failed to delete memory" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}