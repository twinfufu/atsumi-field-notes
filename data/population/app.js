'use strict';

const populationSchema = {
 dateColumn: '年月日',
 parseMonth(date) {
  const match = /^(\d{4})\/(\d{1,2})\/1$/.exec(date);
  if (match && +match[2] >= 1 && +match[2] <= 12) return `${match[1]}-${match[2].padStart(2, '0')}`;
  return null;
 },
 series: [
  {
   key: 'population', label: '総人口', unit: '人', csvHeader: '総人口_人',
   column: '総人口（日本人人口+外国人人口）[人]'
  },
  {
   key: 'households', label: '世帯数', unit: '世帯', csvHeader: '世帯数_世帯',
   column: '総人口（日本人人口+外国人人口）世帯数[世帯]'
  }
 ]
};

const censusSchema = {
 dateColumn: '年月日',
 parseMonth(date) {
  const match = /^(\d{4})\/10\/1$/.exec(date);
  return match ? `${match[1]}-10` : null;
 },
 series: [
  {key: 'censusPopulation', label: '国勢調査の総人口', unit: '人', column: '総人口_人'},
  {key: 'censusHouseholds', label: '国勢調査の世帯数', unit: '世帯', column: '世帯数_世帯'}
 ]
};

async function mountCensus() {
 const el = id => document.getElementById(id);
 try {
  const rows = normalizeMonthlyCSV(await loadStatisticsCSV('./census.csv'), censusSchema);
  if (!rows.length) throw Error('データがありません');
  const period = `対象期間：${rows[0].month} 〜 ${rows.at(-1).month}（各年10月1日）`;
  el('census-period').textContent = period;
  const body = el('census-values');
  body.replaceChildren();
  for (const row of rows) {
   const tr = document.createElement('tr');
   for (const value of [row.date, ...censusSchema.series.map(({key}) => row[key])]) {
    const td = document.createElement('td');
    td.textContent = value === null ? '欠測' : value.toLocaleString();
    tr.append(td);
   }
   body.append(tr);
  }
  for (const series of censusSchema.series) {
   drawStatisticsChart(el(series.key), rows, series, period);
  }
  el('census-status').textContent = `${rows.length}時点。月次の表示期間とは独立した全期間を表示しています。`;
 } catch {
  el('census-status').textContent = '国勢調査CSVの読み込みに失敗しました。HTTPのローカルサーバーとCSVの配置・内容を確認してください。';
  el('census-period').textContent = '対象期間：読み込み未完了';
 }
}

document.addEventListener('DOMContentLoaded', async () => {
 await Promise.all([
  mountStatisticsPage({
   series: populationSchema.series,
   source: readStatisticsSource(document),
   filename: 'tahara-population',
   presets: {recent: ['2025-01', '2025-12'], first: ['2025-01', '2025-06'], second: ['2025-07', '2025-12']},
   load: () => loadStatisticsCSV('./population.csv'),
   normalize: text => normalizeMonthlyCSV(text, populationSchema)
  }),
  mountCensus()
 ]);
});
