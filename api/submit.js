export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sheetUrl = process.env.SHEET_URL;
  if (!sheetUrl) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed' });
  }
}
