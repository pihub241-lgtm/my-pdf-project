const primaryApiBase =
  process.env.REACT_APP_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

const localApiBase = `${window.location.protocol}//${window.location.hostname}:5000`;
const isLocalDevHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const REQUEST_TIMEOUT_MS = 12000;

function joinUrl(base, endpoint) {
  const normalizedBase = String(base || '').replace(/\/+$/, '');
  const normalizedEndpoint = String(endpoint || '').startsWith('/')
    ? endpoint
    : `/${String(endpoint || '')}`;
  return `${normalizedBase}${normalizedEndpoint}`;
}

function parseFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : fallback;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function processPdf({ endpoint, formData, fallbackFileName }) {
  let response;
  let lastError = null;
  const attemptedUrls = [];

  const candidateBases = isLocalDevHost
    ? [localApiBase, primaryApiBase]
    : [primaryApiBase, localApiBase];

  const uniqueCandidateBases = candidateBases.filter(
    (base, index, list) => base && list.indexOf(base) === index
  );

  for (const base of uniqueCandidateBases) {
    const requestUrl = joinUrl(base, endpoint);
    attemptedUrls.push(requestUrl);

    try {
      response = await fetchWithTimeout(requestUrl, {
        method: 'POST',
        body: formData,
      }, REQUEST_TIMEOUT_MS);
      break;
    } catch (error) {
      if (error?.name === 'AbortError') {
        lastError = new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`);
      } else {
        lastError = error;
      }
    }
  }

  if (!response) {
    throw new Error(
      `Cannot reach backend server. Tried: ${attemptedUrls.join(', ')}. ${
        lastError?.message || ''
      }`.trim()
    );
  }

  if (!response.ok) {
    const text = await response.text();
    let message = text || 'Processing failed';

    try {
      const parsed = JSON.parse(text);
      message = parsed.error || message;
    } catch {
      // ignore parse failure
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const filename = parseFilename(response.headers.get('content-disposition'), fallbackFileName);

  return { blob, filename };
}

export function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
