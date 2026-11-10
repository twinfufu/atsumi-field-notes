'use strict';

function csvCell(value){let s=String(value);if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}

function exportCSV(rows, {series, source}) {
 const header = ['年月日', ...series.map(item => item.csvHeader),
  '単位注記', '出典URL', 'ライセンス', 'データ対象', '取得日', '加工区分'];
 const metadata = [series.map(item => `${item.label}：${item.unit}`).join('／'),
  source.url, source.license, source.target, source.retrievedOn, '選択抽出'];
 const records = rows.map(row => [row.date, ...series.map(({key}) => row[key] ?? ''), ...metadata]);
 return '\uFEFF' + [header, ...records].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

function saveStatisticsCSV(rows, definition, start, end) {
 const url = URL.createObjectURL(new Blob([exportCSV(rows, definition)], {type: 'text/csv;charset=utf-8'}));
 const link = document.createElement('a');
 link.href = url;
 link.download = `${definition.filename}-${start}-${end}.csv`;
 link.click();
 setTimeout(() => URL.revokeObjectURL(url), 1000);
}
