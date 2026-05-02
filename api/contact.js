export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { ad_soyad, email, telefon, sirket, calisan_sayisi, plan, mesaj } = req.body;

  try {
    const airtableRes = await fetch(
      'https://api.airtable.com/v0/appE6eca0FMKhIPX7/M%C3%BC%C5%9Fteriler',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            '\u015eirket Ad\u0131': sirket,
            'Ad Soyad': ad_soyad,
            'E-posta': email,
            'Telefon': telefon,
            'Plan': plan,
            '\u00c7al\u0131\u015fan Say\u0131s\u0131': calisan_sayisi,
            'Mesaj': mesaj,
            'Trial Ba\u015flang\u0131\u00e7': new Date().toISOString().split('T')[0],
            'Durum': 'Demo Bekleniyor',
          },
        }),
      }
    );

    const responseText = await airtableRes.text();
    console.log('Airtable status:', airtableRes.status);
    console.log('Airtable response:', responseText);

    if (!airtableRes.ok) {
      return res.status(500).json({ error: responseText });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.log('Catch error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
