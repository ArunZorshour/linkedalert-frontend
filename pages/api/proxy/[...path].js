export default async function handler(req, res) {
  const { path } = req.query
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${path.join('/')}`
  
  try {
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'DELETE' 
        ? JSON.stringify(req.body) 
        : undefined,
    })
    
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ error: 'API Error' })
  }
}
