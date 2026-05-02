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
  const cleanPlan = plan
    ? String(plan).replace(/^["'\s]+|["'\s]+$/g, '').trim()
    : null;

  // Çalışan sayısını temizle
  const cleanCalisanSayisi = calisan_sayisi
    ? String(calisan_sayisi).replace(/^["'\s]+|["'\s]+$/g, '').trim()
    : null;

  // Log satırları — Vercel Dashboard > Logs'ta görebilirsin
  console.log('--- YENİ FORM GÖNDERİMİ ---');
  console.log('Ad Soyad:', ad_soyad);
  console.log('Sirket:', sirket);
  console.log('Plan ham deger:', JSON.stringify(plan));
  console.log('Plan temiz deger:', cleanPlan);
  console.log('Calisan Sayisi temiz:', cleanCalisanSayisi);

  try {
    // ÖNEMLİ: Airtable'da "Single Select" tipindeki alanlara düz string değil,
    // { name: 'değer' } formatında göndermek gerekiyor.
    // Plan, Çalışan Sayısı ve Durum alanları Single Select — bu yüzden { name: ... } kullanıyoruz.
    const fields = {
      'Şirket Adı':      sirket    || '',
      'Ad Soyad':        ad_soyad  || '',
      'E-posta':         email     || '',
      'Telefon':         telefon   || '',
      'Mesaj':           mesaj     || '',
      'Trial Başlangıç': new Date().toISOString().split('T')[0],
      'Durum': 'Demo Bekleniyor',
    };

    // Plan boş gelmediyse düz string olarak ekle
    if (cleanPlan) {
      fields['Plan'] = cleanPlan;
    }

    // Çalışan Sayısı boş gelmediyse düz string olarak ekle
    if (cleanCalisanSayisi) {
      fields['Çalışan Sayısı'] = cleanCalisanSayisi;
    }

    console.log('Airtable a gonderilen fields:', JSON.stringify(fields, null, 2));

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
