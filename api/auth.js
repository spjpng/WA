// Step 1 of the OAuth flow: redirect the browser to GitHub's authorization page.
// GitHub will redirect back to /api/callback with a `code` query param.
export default function handler(req, res) {
  const { GITHUB_CLIENT_ID } = process.env;

  if (!GITHUB_CLIENT_ID) {
    res.status(500).send('GITHUB_CLIENT_ID is not configured.');
    return;
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: 'https://srtxrp.com/api/callback',
    scope: 'repo',
    state: crypto.randomUUID(),
  });

  res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}
