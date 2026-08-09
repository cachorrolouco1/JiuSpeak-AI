const DID_API_URL = 'https://api.d-id.com';
export async function createTalkingVideo(imageUrl: string, audioUrl: string): Promise<string | null> {
  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) { console.warn('D-ID API key not set'); return null; }
  try {
    const createRes = await fetch(`${DID_API_URL}/talks`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_url: imageUrl, script: { type: 'audio', audio_url: audioUrl }, config: { stitch: true } }),
    });
    if (!createRes.ok) { console.error('D-ID create error:', await createRes.text()); return null; }
    const createData = await createRes.json();
    const talkId = createData.id;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const statusRes = await fetch(`${DID_API_URL}/talks/${talkId}`, { headers: { 'Authorization': `Basic ${apiKey}` } });
      const statusData = await statusRes.json();
      if (statusData.status === 'done' && statusData.result_url) return statusData.result_url;
      if (statusData.status === 'error') { console.error('D-ID error:', statusData); return null; }
    }
    return null;
  } catch (err) { console.error('D-ID error:', err); return null; }
}
