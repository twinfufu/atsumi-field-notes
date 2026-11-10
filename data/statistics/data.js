'use strict';

function parseCSV(text) {
 const rows=[]; let row=[], cell='', quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++) { const c=text[i];
  if(c==='"') { if(quoted && text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted; }
  else if(c===','&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw Error('CSVの引用符が閉じていません');
 if(cell||row.length){row.push(cell);rows.push(row);} return rows;
}

async function loadStatisticsCSV(url) {
 const response = await fetch(url);
 if (!response.ok) throw Error(`HTTP ${response.status}`);
 return response.text();
}

function normalizeMonthlyCSV(text, {dateColumn, parseMonth, series}) {
 const [headers = [], ...records] = parseCSV(text);
 const indices = [dateColumn, ...series.map(item => item.column)].map(name => headers.indexOf(name));
 if (indices.includes(-1)) throw Error('必要な列がありません');
 const months = new Set();
 return records.map(record => {
  const date = record[indices[0]];
  const month = parseMonth(date);
  if (!month || months.has(month)) throw Error('対象外または重複の年月日です');
  months.add(month);
  const row = {date, month};
  series.forEach(({key}, i) => {
   const raw = record[indices[i + 1]];
   const value = Number(raw);
   row[key] = /^\d+$/.test(raw ?? '') && Number.isSafeInteger(value) ? value : null;
  });
  return row;
 }).sort((a, b) => a.month.localeCompare(b.month));
}
