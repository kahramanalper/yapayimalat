export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { ad_soyad, email, telefon, sirket, calisan_sayisi, plan, mesaj } = req.body;

  try {
    // Airtable'a kayıt
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
            'Şirket Adı': sirket,
            'Ad Soyad': ad_soyad,
            'E-posta': email,
            'Telefon': telefon,
            'Plan': plan,
            'Çalışan Sayısı': calisan_sayisi,
            'Mesaj': mesaj,
            'Trial Başlangıç': new Date().toISOString().split('T')[0],
            'Durum': 'Demo Bekleniyor',
          },
        }),
      }
    );

    if (!airtableRes.ok) throw new Error('Airtable hatası');

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
