import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  formatRupiah,
  formatDate,
  formatDateTimeWIB,
  getReportDateRangeLabel
} from '../utils/formatters';
import { getCachedData, setCachedData } from '../utils/dataCache';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Package,
  Download,
  FileSpreadsheet,
  FileText,
  X
} from 'lucide-react';

const ReportsPage = () => {
  const [report, setReport] = useState(() => getCachedData('salesReport_today') || null);
  const [loading, setLoading] = useState(() => !getCachedData('salesReport_today'));
  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [period, startDate, endDate]);

  const fetchReport = async () => {
    try {
      if (!report) setLoading(true);
      const res = await reportService.getSalesReport({
        period,
        startDate,
        endDate
      });
      if (res.success) {
        setReport(res.data);
        if (period === 'today') setCachedData('salesReport_today', res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dateRangeLabel = getReportDateRangeLabel(report, period, startDate, endDate);

  const handleExportExcel = () => {
    if (!report || !report.transactions) return;
    setShowExportModal(false);

    const currentPeriodLabel = getReportDateRangeLabel(report, period, startDate, endDate);
    const fileName = `Laporan_Penjualan_Boenda_Pie_${currentPeriodLabel}.xls`;

    // Build XML Spreadsheet (xls) — opens in Excel with full borders & formatting
    const txRows = (report.transactions || []).map((tx, i) =>
      `<Row>
        <Cell ss:StyleID="data"><Data ss:Type="Number">${i + 1}</Data></Cell>
        <Cell ss:StyleID="data"><Data ss:Type="String">${tx.invoiceNumber || ''}</Data></Cell>
        <Cell ss:StyleID="data"><Data ss:Type="String">${formatDate(tx.date || tx.createdAt)}</Data></Cell>
        <Cell ss:StyleID="data"><Data ss:Type="String">${tx.cashierName || ''}</Data></Cell>
        <Cell ss:StyleID="data"><Data ss:Type="String">${tx.paymentMethod || ''}</Data></Cell>
        <Cell ss:StyleID="numData"><Data ss:Type="Number">${tx.totalAmount || 0}</Data></Cell>
      </Row>`
    ).join('');

    const topProductRows = (report.topProducts || []).map((p, i) =>
      `<Row>
        <Cell ss:StyleID="data"><Data ss:Type="Number">${i + 1}</Data></Cell>
        <Cell ss:StyleID="data"><Data ss:Type="String">${p.productName || ''}</Data></Cell>
        <Cell ss:StyleID="numData"><Data ss:Type="Number">${p.quantitySold || 0}</Data></Cell>
        <Cell ss:StyleID="numData"><Data ss:Type="Number">${p.totalRevenue || 0}</Data></Cell>
      </Row>`
    ).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="title">
      <Font ss:Bold="1" ss:Size="14" ss:Color="#3d2c1e"/>
      <Alignment ss:Horizontal="Center"/>
      <Interior ss:Color="#f8cee8" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#f0a3d0"/>
      </Borders>
    </Style>
    <Style ss:ID="header">
      <Font ss:Bold="1" ss:Size="10" ss:Color="#a0336e"/>
      <Interior ss:Color="#fff0f7" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#f0a3d0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f0a3d0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f0a3d0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f0a3d0"/>
      </Borders>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="data">
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
      <Font ss:Size="10"/>
    </Style>
    <Style ss:ID="numData">
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
      <Font ss:Size="10"/>
      <NumberFormat ss:Format="#,##0"/>
    </Style>
    <Style ss:ID="summary">
      <Font ss:Bold="1" ss:Size="11" ss:Color="#3d2c1e"/>
      <Interior ss:Color="#fffbea" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f5d96b"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f5d96b"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f5d96b"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f5d96b"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="Transaksi">
    <Table>
      <Column ss:Width="40"/>
      <Column ss:Width="130"/>
      <Column ss:Width="140"/>
      <Column ss:Width="110"/>
      <Column ss:Width="100"/>
      <Column ss:Width="120"/>
      <Row>
        <Cell ss:MergeAcross="5" ss:StyleID="title"><Data ss:Type="String">LAPORAN PENJUALAN BOENDA PIE — ${currentPeriodLabel}</Data></Cell>
      </Row>
      <Row>
        <Cell ss:MergeAcross="5" ss:StyleID="data"><Data ss:Type="String">Total Omset: Rp ${(report.totalRevenue || 0).toLocaleString('id-ID')} | Jumlah Transaksi: ${report.totalTransactions || 0} | Total Produk Terjual: ${report.totalItemsSold || 0} pcs</Data></Cell>
      </Row>
      <Row/>
      <Row>
        <Cell ss:StyleID="header"><Data ss:Type="String">No</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">No Invoice</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Tanggal</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Kasir</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Metode Bayar</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Total (Rp)</Data></Cell>
      </Row>
      ${txRows || '<Row><Cell ss:StyleID="data" ss:MergeAcross="5"><Data ss:Type="String">Tidak ada data transaksi.</Data></Cell></Row>'}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Produk Terlaris">
    <Table>
      <Column ss:Width="40"/>
      <Column ss:Width="180"/>
      <Column ss:Width="120"/>
      <Column ss:Width="140"/>
      <Row>
        <Cell ss:MergeAcross="3" ss:StyleID="title"><Data ss:Type="String">PERINGKAT PRODUK TERLARIS — ${currentPeriodLabel}</Data></Cell>
      </Row>
      <Row/>
      <Row>
        <Cell ss:StyleID="header"><Data ss:Type="String">Peringkat</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Nama Produk</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Jumlah Terjual (pcs)</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Total Omset (Rp)</Data></Cell>
      </Row>
      ${topProductRows || '<Row><Cell ss:StyleID="data" ss:MergeAcross="3"><Data ss:Type="String">Tidak ada data.</Data></Cell></Row>'}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!report) return;
    setShowExportModal(false);

    const currentPeriodLabel = getReportDateRangeLabel(report, period, startDate, endDate);
    const docTitle = `Laporan_Penjualan_Boenda_Pie_${currentPeriodLabel}`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const txRows = (report.transactions || []).map((tx, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td>${i + 1}</td>
        <td>${tx.invoiceNumber || '-'}</td>
        <td>${formatDate(tx.date || tx.createdAt)}</td>
        <td>${tx.cashierName || '-'}</td>
        <td><span class="badge">${tx.paymentMethod || '-'}</span></td>
        <td class="amount">${formatRupiah(tx.totalAmount || 0)}</td>
      </tr>`).join('');

    const topRows = (report.topProducts || []).map((p, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td class="rank">${i + 1}</td>
        <td>${p.productName || '-'}</td>
        <td>${p.quantitySold || 0} pcs</td>
        <td class="amount">${formatRupiah(p.totalRevenue || 0)}</td>
      </tr>`).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 30px; background: white; }
            .header { text-align: center; margin-bottom: 24px; border-bottom: 3px solid #f0a3d0; padding-bottom: 16px; }
            .header h1 { font-size: 20px; font-weight: 900; color: #3d2c1e; letter-spacing: 1px; }
            .header p { font-size: 12px; color: #666; margin-top: 4px; }
            .header .period { display: inline-block; margin-top: 8px; background: #f8cee8; color: #a0336e; border: 1px solid #f0a3d0; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
            .summary-cards { display: flex; gap: 16px; margin-bottom: 24px; }
            .card { flex: 1; border-radius: 12px; padding: 14px 16px; border: 1.5px solid; }
            .card.blue { background: #e8f7ff; border-color: #7dcef5; }
            .card.yellow { background: #fffbea; border-color: #f5d96b; }
            .card.pink { background: #fff0f7; border-color: #f0a3d0; }
            .card p { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .card.blue p { color: #1a5a80; } .card.yellow p { color: #7a5500; } .card.pink p { color: #8a2060; }
            .card h3 { font-size: 16px; font-weight: 900; color: #3d2c1e; }
            .section { margin-bottom: 28px; }
            .section h2 { font-size: 14px; font-weight: 800; color: #3d2c1e; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #f0a3d0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            thead tr { background: #fff0f7; }
            th { padding: 9px 10px; text-align: left; font-weight: 800; color: #a0336e; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #f0a3d0; }
            td { padding: 8px 10px; border: 1px solid #e2e8f0; }
            tr.even td { background: #fffafb; }
            tr.odd td { background: white; }
            .amount { font-weight: 700; text-align: right; }
            .rank { text-align: center; font-weight: 800; }
            .badge { background: #f8cee8; color: #a0336e; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 10px; }
            @media print { 
              @page { margin: 0; }
              body { padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🥧 LAPORAN PENJUALAN BOENDA PIE</h1>
            <p>Sokawera, Berkoh, Kec. Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah | Telp/WA: 08986659534</p>
            <span class="period">Periode: ${currentPeriodLabel}</span>
          </div>
          <div class="summary-cards">
            <div class="card blue"><p>Total Omset</p><h3>${formatRupiah(report.totalRevenue || 0)}</h3></div>
            <div class="card yellow"><p>Jumlah Transaksi</p><h3>${report.totalTransactions || 0} Transaksi</h3></div>
            <div class="card pink"><p>Produk Terjual</p><h3>${report.totalItemsSold || 0} Pcs Pie</h3></div>
          </div>
          <div class="section">
            <h2>Data Transaksi</h2>
            <table>
              <thead><tr><th>No</th><th>No Invoice</th><th>Tanggal</th><th>Kasir</th><th>Metode Bayar</th><th>Total</th></tr></thead>
              <tbody>${txRows || '<tr><td colspan="6" style="text-align:center;color:#999">Tidak ada data transaksi.</td></tr>'}</tbody>
            </table>
          </div>
          <div class="section">
            <h2>Produk Terlaris</h2>
            <table>
              <thead><tr><th>Peringkat</th><th>Nama Produk</th><th>Terjual</th><th>Total Omset</th></tr></thead>
              <tbody>${topRows || '<tr><td colspan="4" style="text-align:center;color:#999">Tidak ada data.</td></tr>'}</tbody>
            </table>
          </div>
          <div class="footer">Dicetak pada: ${formatDateTimeWIB(new Date())} | Boenda Pie Purwokerto</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.document.title = docTitle;
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export */}
      <div style={{ background: 'white', borderRadius: 24, padding: '20px 24px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#fff0f7', border: '1.5px solid #f0a3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BarChart3 style={{ width: 22, height: 22, color: '#a0336e' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0 }}>Laporan Penjualan &amp; Performa Bisnis</h2>
            <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2, fontWeight: 500 }}>Analisa omset harian, mingguan, bulanan, dan varian pie paling terlaris.</p>
          </div>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2.5 bg-[#f8cee8] text-[#a0336e] border border-[#f0a3d0] hover:bg-[#f3b5db] font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download Laporan</span>
        </button>
      </div>

      {/* Period Selector Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('today')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
              period === 'today'
                ? 'bg-[#f8cee8] text-[#a0336e] border-[#f0a3d0] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-[#fff4f9]'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
              period === 'week'
                ? 'bg-[#f8cee8] text-[#a0336e] border-[#f0a3d0] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-[#fff4f9]'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
              period === 'month'
                ? 'bg-[#f8cee8] text-[#a0336e] border-[#f0a3d0] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-[#fff4f9]'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
              period === 'custom'
                ? 'bg-[#f8cee8] text-[#a0336e] border-[#f0a3d0] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-[#fff4f9]'
            }`}
          >
            Rentang Tanggal
          </button>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none"
            />
            <span className="text-slate-400 font-bold">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none"
            />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Kalkulasi data laporan penjualan..." />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div style={{
              background: 'linear-gradient(135deg, #e8f7ff 0%, #beeaff 100%)',
              padding: '18px 20px', borderRadius: 20,
              border: '1.5px solid #7dcef5',
              boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <TrendingUp style={{ width: 22, height: 22, color: '#1a6fa0' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#1a5a80', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Total Omset Penjualan</p>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0, lineHeight: 1 }}>{formatRupiah(report?.totalRevenue || 0)}</h3>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fffbea 0%, #fcf0c0 100%)',
              padding: '18px 20px', borderRadius: 20,
              border: '1.5px solid #f5d96b',
              boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Receipt style={{ width: 22, height: 22, color: '#8a6000' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#7a5500', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Jumlah Transaksi Sukses</p>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0, lineHeight: 1 }}>{report?.totalTransactions || 0} Transaksi</h3>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fff0f7 0%, #f8cee8 100%)',
              padding: '18px 20px', borderRadius: 20,
              border: '1.5px solid #f0a3d0',
              boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Package style={{ width: 22, height: 22, color: '#a0336e' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#8a2060', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Total Produk Terjual</p>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#3d2c1e', margin: 0, lineHeight: 1 }}>{report?.totalItemsSold || 0} Pcs Pie</h3>
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4">Peringkat Produk Terlaris (Top Selling Products)</h3>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 min-w-[550px]">
                <thead className="bg-[#fff4f9] text-[#a0336e] font-extrabold border-b-2 border-[#f0a3d0] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3 whitespace-nowrap">Peringkat</th>
                    <th className="p-3">Nama Produk Pie</th>
                    <th className="p-3 whitespace-nowrap">Jumlah Terjual</th>
                    <th className="p-3 whitespace-nowrap">Total Kontribusi Omset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report?.topProducts && report.topProducts.length > 0 ? (
                    report.topProducts.map((prod, index) => (
                      <tr key={prod.productId} className="hover:bg-pink-50/30 transition-colors">
                        <td className="p-3 whitespace-nowrap">
                          <span className={`w-6 h-6 rounded-full font-extrabold flex items-center justify-center text-xs ${
                            index === 0 ? 'bg-[#f8cee8] text-[#a0336e] border border-[#f0a3d0] font-black' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900 min-w-[160px]">{prod.productName}</td>
                        <td className="p-3 font-extrabold text-slate-800 whitespace-nowrap">
                          {prod.quantitySold} pcs
                        </td>
                        <td className="p-3 font-black text-slate-900 whitespace-nowrap">
                          {formatRupiah(prod.totalRevenue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-slate-400">Belum ada data penjualan pada periode ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Export Format Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(30,20,40,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-4 relative"
            style={{ border: '1.5px solid #f0a3d0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-black text-slate-900">Download Laporan</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Pilih format file yang ingin diunduh.</p>
              <div className="mt-3 p-3 rounded-2xl bg-[#fff4f9] border border-[#f8cee8]">
                <p className="text-[10px] font-extrabold text-[#a0336e] uppercase tracking-wider mb-0.5">Periode Transaksi (WIB):</p>
                <p className="text-xs font-black text-[#3d2c1e]">{dateRangeLabel}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1 break-all bg-white/70 p-1.5 rounded-lg border border-[#f8cee8]">
                  📄 Laporan_Penjualan_Boenda_Pie_{dateRangeLabel}.[xls/pdf]
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center flex-shrink-0 transition-colors">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="font-extrabold text-emerald-900 text-sm">Excel (.xls)</p>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">Tabel dengan border & format rapi, buka di Microsoft Excel</p>
                </div>
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-400 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center flex-shrink-0 transition-colors">
                  <FileText className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <p className="font-extrabold text-rose-900 text-sm">PDF (Print/Simpan)</p>
                  <p className="text-xs text-rose-700 font-medium mt-0.5">Laporan siap cetak dengan header, ringkasan, dan tabel lengkap</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
