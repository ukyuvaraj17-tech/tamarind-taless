// Vercel serverless function -- the ONLY place the Razorpay Key Secret is ever
// used. Creates a Razorpay order for the given amount and hands back just the
// order id + the (non-secret) Key ID the browser widget needs to open.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    res.status(500).json({ error: 'Payment gateway is not configured.' });
    return;
  }

  const { amount, receipt } = req.body || {};
  const amountPaise = Math.round(Number(amount) * 100);
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    res.status(400).json({ error: 'Invalid amount.' });
    return;
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: receipt || undefined,
      }),
    });
    const data = await rzpRes.json();
    if (!rzpRes.ok) {
      res.status(502).json({ error: data?.error?.description || 'Could not create payment order.' });
      return;
    }
    res.status(200).json({ id: data.id, amount: data.amount, currency: data.currency, key_id: keyId });
  } catch (err) {
    res.status(500).json({ error: 'Could not reach the payment gateway.' });
  }
}
