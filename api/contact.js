module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { ad_soyad, email, telefon, sirket, calisan_sayisi, plan, mesaj } = req.body;

  console.log('--- YENİ FORM GÖNDERİMİ ---');
  console.log('Ad Soyad:', ad_soyad);
  console.log('Sirket:', sirket);
  console.log('Plan ham:', JSON.stringify(plan));
  console.log('Calisan ham:', JSON.stringify(calisan_sayisi));

  try {
    // Sadece text alanlarını gönder — Single Select alanları (Plan, Çalışan Sayısı, Durum) çıkarıldı
    // Önce sistemin çalıştığını doğrulayalım
    const fields = {
      'Şirket Adı':      sirket    || '',
      'Ad Soyad':        ad_soyad  || '',
      'E-posta':         email     || '',
      'Telefon':         telefon   || '',
      'Mesaj':           mesaj     || '',
      'Trial Başlangıç': new Date().toISOString().split('T')[0],
    };

    console.log('Gonderilen fields:', JSON.stringify(fields, null, 2));

    const airtableRes = await fetch(
      'https://api.airtable.com/v0/appE6eca0FMKhIPX7/M%C3%BC%C5%9Fteriler',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    const responseText = await airtableRes.text();
    console.log('Airtable HTTP status:', airtableRes.status);
    console.log('Airtable yanit:', responseText);

    if (!airtableRes.ok) {
      return res.status(500).json({ error: 'Airtable hatasi', detail: responseText });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.log('Sunucu hatasi:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
