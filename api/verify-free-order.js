import crypto from 'crypto';

// Vercel serverless function -- confirms an order that needed no payment (a coupon or
// gift card covered it entirely) was actually computed that way by
// razorpay-create-order, not just claimed by the client. Same HMAC pattern as
// razorpay-verify-payment.js, just verifying a "this needs Rs. 0" token instead of a
// Razorpay payment signature.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    res.status(500).json({ verified: false, error: 'Payment gateway is not configured.' });
    return;
  }

  const { receipt, freeToken } = req.body || {};
  if (!receipt || !freeToken) {
    res.status(400).json({ verified: false, error: 'Missing verification details.' });
    return;
  }

  const expected = crypto.createHmac('sha256', keySecret).update(`free|${receipt}|0`).digest('hex');
  // Timing-safe comparison -- a plain === would return on the first mismatched
  // character, leaking (via response timing) how many leading characters of a
  // guessed token were correct. Both buffers must be equal length for
  // timingSafeEqual to run at all, which a same-length hex digest guarantees here.
  const expectedBuf = Buffer.from(expected, 'hex');
  const givenBuf = Buffer.from(String(freeToken), 'hex');
  const verified = expectedBuf.length === givenBuf.length && crypto.timingSafeEqual(expectedBuf, givenBuf);
  res.status(verified ? 200 : 400).json({ verified });
}
