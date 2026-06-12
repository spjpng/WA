// Step 2 of the OAuth flow: GitHub redirects here with ?code=...
// Exchange the code for an access token, then hand it back to the CMS
// opener window via postMessage and close the popup.
export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error || !code) {
    return sendScript(res, 'error', {
      message: error_description || error || 'Authorization denied.',
    });
  }

  let tokenData;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: 'https://srtxrp.com/api/callback',
      }),
    });
    tokenData = await tokenRes.json();
  } catch (err) {
    return sendScript(res, 'error', { message: 'Failed to reach GitHub token endpoint.' });
  }

  if (tokenData.error || !tokenData.access_token) {
    return sendScript(res, 'error', {
      message: tokenData.error_description || tokenData.error || 'Token exchange failed.',
    });
  }

  return sendScript(res, 'success', {
    token: tokenData.access_token,
    provider: 'github',
  });
}

// Decap CMS listens for postMessage in the format:
//   "authorization:{provider}:{status}:{JSON payload}"
function sendScript(res, status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body>
<script>
(function () {
  var msg = ${JSON.stringify(message)};
  if (window.opener) {
    window.opener.postMessage(msg, 'https://srtxrp.com');
  }
  window.close();
})();
</script>
</body></html>`);
}
