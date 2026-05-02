module.exports = async function handler(req, res) {
  // CORS ayarları — tarayıcının bu API'ye erişmesine izin verir
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Tarayıcı bazen OPTIONS isteği atar, bunu boş 200 ile geçiştiriyoruz
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Formdan gelen alanları al
  const { ad_soyad, email, telefon, sirket, calisan_sayisi, plan, mesaj } = req.body;

  // Plan değerini temizle — eğer tırnak içinde geldiyse soyuyoruz
  // Örnek sorun: "Başlangıç" → Başlangıç
  const cleanPlan = plan
    ? String(plan).replace(/^["'\s]+|["'\s]+$/g, '').trim()
    : null;

  // Log satırları — Vercel Dashboard > Logs'ta görebilirsin
  console.log('--- YENİ FORM GÖNDERİMİ ---');
  console.log('Ad Soyad:', ad_soyad);
  console.log('Şirket:', sirket);
  console.log('Plan ham değer:', JSON.stringify(plan));
  console.log('Plan temiz değer:', cleanPlan);

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
            'Şirket Adı':    sirket        || '',
            'Ad Soyad':      ad_soyad      || '',
            'E-posta':       email         || '',
            'Telefon':       telefon       || '',
            'Çalışan Sayısı': calisan_sayisi || '',
            'Mesaj':         mesaj         || '',
            'Trial Başlangıç': new Date().toISOString().split('T')[0],
            'Durum':         'Demo Bekleniyor',
            // Plan alanı — eğer boş geldiyse hiç gönderme (Airtable hata verir)
            ...(cleanPlan ? { 'Plan': cleanPlan } : {}),
          },
        }),
      }
    );

    const responseText = await airtableRes.text();
    console.log('Airtable HTTP status:', airtableRes.status);
    console.log('Airtable yanıt:', responseText);

    if (!airtableRes.ok) {
      // Airtable hata döndürdü — detayı logluyoruz ve client'a da gönderiyoruz
      return res.status(500).json({ error: 'Airtable hatası', detail: responseText });
    }

    // Her şey yolunda
    return res.status(200).json({ success: true });

  } catch (err) {
    console.log('Sunucu hatası:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
