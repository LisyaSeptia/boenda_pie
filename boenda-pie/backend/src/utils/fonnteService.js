/**
 * Kirim pesan teks terformat struk ke nomor WhatsApp customer menggunakan Fonnte API
 * @param {Object} options
 * @param {string} options.target - Nomor tujuan (misal: '08123456789' atau '628123456789')
 * @param {string} options.message - Pesan teks struk terformat
 */
const sendReceiptViaWhatsApp = async ({ target, message }) => {
  const token = process.env.FONNTE_TOKEN;
  if (!token || token === 'your_fonnte_token_here') {
    return {
      success: false,
      message: 'FONNTE_TOKEN belum dikonfigurasi di file .env backend'
    };
  }

  // Format nomor target
  let cleanTarget = (target || '').replace(/[^0-9]/g, '');
  if (cleanTarget.startsWith('0')) {
    cleanTarget = '62' + cleanTarget.slice(1);
  }

  if (!cleanTarget) {
    return {
      success: false,
      message: 'Nomor WhatsApp customer tidak valid atau kosong'
    };
  }

  try {
    const formData = new FormData();
    formData.append('target', cleanTarget);
    formData.append('message', message);
    formData.append('countryCode', '62');

    console.log(`[Fonnte API] Mengirim struk teks ke ${cleanTarget}...`);

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token
      },
      body: formData
    });

    const result = await response.json();
    console.log('[Fonnte API Result]:', JSON.stringify(result));

    if (result.status === true || result.status === 'true') {
      return {
        success: true,
        message: 'Struk otomatis berhasil dikirim ke WhatsApp customer',
        data: result
      };
    } else {
      console.warn('[Fonnte API Warning]:', result);
      return {
        success: false,
        message: result.reason || result.message || 'Gagal mengirim pesan melalui Fonnte',
        data: result
      };
    }
  } catch (error) {
    console.error('[Fonnte API Error]:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat menghubungi server Fonnte'
    };
  }
};

module.exports = {
  sendReceiptViaWhatsApp
};
