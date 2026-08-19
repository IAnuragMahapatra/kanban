export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  try {
    const { title, description } = await req.json();
    
    if (!title) return new Response(JSON.stringify({ error: 'Missing title' }), { status: 400 });

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing API Key configuration' }), { status: 500 });

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: "You are a helpful assistant that decomposes broad tasks into 3 to 4 specific, actionable sub-tasks. You must reply ONLY with a valid JSON array of objects. Do not wrap it in markdown code blocks. Each object must have 'title' (string) and 'description' (string)." },
          { role: "user", content: `Please decompose this task:\nTitle: ${title}\nDescription: ${description || 'No description provided.'}` }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `NVIDIA API Error: ${err}` }), { status: 502 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';
    
    // Clean up potential markdown wrappers
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    jsonStr = jsonStr.trim();

    return new Response(jsonStr, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
