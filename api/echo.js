export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({ success: true, now: new Date().toISOString(), method: req.method });
}
