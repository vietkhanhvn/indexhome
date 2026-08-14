// Vercel Serverless function to save contact settings to the GitHub repo via GitHub Contents API.
// Requirements (set in Vercel Environment Variables):
// - GITHUB_TOKEN: personal access token with `repo` scope
// - GITHUB_OWNER: repo owner (username or org)
// - GITHUB_REPO: repo name (this repository)

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const method = req.method || 'GET';

  // Collect params (support JSON POST and GET querystring)
  let params = {};
  if (method === 'POST') {
    try { params = await req.json(); } catch (e) { params = {}; }
  } else {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      url.searchParams.forEach((v, k) => { params[k] = v; });
    } catch (e) { params = {}; }
  }

  const payload = {
    zalo: String(params.zalo || ''),
    facebook: String(params.facebook || ''),
    modalTitle: String(params.modalTitle || ''),
    modalBody: String(params.modalBody || ''),
    modalContactText: String(params.modalContactText || ''),
    modalButtonLabel: String(params.modalButtonLabel || ''),
    modalAlwaysShow: (params.modalAlwaysShow === 'false' || params.modalAlwaysShow === '0') ? false : (params.modalAlwaysShow === 'true' || params.modalAlwaysShow === '1' ? true : true)
  };

  const owner = process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER;
  const repo = process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    res.status(500).json({ success: false, message: 'Missing GITHUB_OWNER, GITHUB_REPO, or GITHUB_TOKEN in environment' });
    return;
  }

  const path = 'data/contact-settings.json';
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

  try {
    // Get existing file to obtain sha (if any)
    const getResp = await fetch(apiBase, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' }
    });

    let sha = null;
    if (getResp.ok) {
      const getData = await getResp.json();
      if (getData && getData.sha) sha = getData.sha;
    }

    const content = Buffer.from(JSON.stringify(payload, null, 2), 'utf8').toString('base64');

    const body = {
      message: 'Update contact-settings via Vercel function',
      content: content
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(apiBase, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const putData = await putResp.json();
    if (!putResp.ok) {
      const msg = putData && putData.message ? putData.message : 'GitHub API error';
      res.status(500).json({ success: false, message: msg, detail: putData });
      return;
    }

    res.status(200).json({ success: true, commit: putData && putData.commit ? putData.commit.sha : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || String(err) });
  }
}
