// netlify/functions/submissions.js

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const OWNER = 'mrjswilson';
const REPO = 'an-anonymous-gallery';
const FILE_PATH = 'data/gallery.json'; // path inside your repo
const BRANCH = 'main'; // or 'master'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // set in Netlify dashboard

const API_BASE = 'https://api.github.com';

async function getFile() {
  const res = await fetch(
    `${API_BASE}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(
      FILE_PATH
    )}?ref=${BRANCH}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    }
  );

  if (res.status === 404) {
    return { sha: null, content: [] };
  }

  if (!res.ok) {
    throw new Error(`GitHub GET failed: ${res.status}`);
  }

  const json = await res.json();
  const decoded = Buffer.from(json.content, 'base64').toString('utf8') || '[]';
  return { sha: json.sha, content: JSON.parse(decoded) };
}

async function putFile(newContent, sha) {
  const body = {
    message: 'Update gallery.json via site submission',
    content: Buffer.from(
      JSON.stringify(newContent, null, 2),
      'utf8'
    ).toString('base64'),
    branch: BRANCH,
  };

  if (sha) body.sha = sha;

  const res = await fetch(
    `${API_BASE}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(
      FILE_PATH
    )}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub PUT failed: ${res.status}`);
  }

  const json = await res.json();
  return json.content.sha;
}

exports.handler = async (event) => {
  try {
    if (!GITHUB_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing GITHUB_TOKEN env var' }),
      };
    }

    if (event.httpMethod === 'GET') {
      const { content } = await getFile();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      };
    }

        if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { imageUrl, comment } = body;

      // Only require imageUrl now
      if (!imageUrl) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'imageUrl is required',
          }),
        };
      }

      const { content, sha } = await getFile();
      const updated = [
        ...content,
        {
          imageUrl,
          comment: comment || null,
          createdAt: new Date().toISOString(),
        },
      ];

      const newSha = await putFile(updated, sha);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, count: updated.length, sha: newSha }),
      };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
