'use strict';

async function mountStatisticsPage(definition) {
 const el = id => document.getElementById(id);
 const status = el('status');
 let rows, selected;
 function render() {
  const start = el('start').value;
  const end = el('end').value;
  selected = filterPeriod(rows, start, end);
  const period = `対象期間：${start} 〜 ${end}`;
  el('period').textContent = period;
  const pointNote = selected.length === 1 ? '1点のため点のみ表示。' : '';
  status.textContent = selected.length
   ? `${selected.length}か月。${pointNote}欠測値は「欠測」と表示し、線をつなぎません。`
   : '該当する月はありません。開始月・終了月を確認してください。';
  el('save').disabled = !selected.length;
  const body = el('values');
  body.replaceChildren();
  for (const row of selected) {
   const tr = document.createElement('tr');
   for (const value of [row.date, ...definition.series.map(({key}) => row[key])]) {
    const td = document.createElement('td');
    td.textContent = value === null ? '欠測' : value.toLocaleString();
    tr.append(td);
   }
   body.append(tr);
  }
  for (const series of definition.series) {
   drawStatisticsChart(el(series.key), selected, series, period);
  }
 }

 el('print').addEventListener('click', () => window.print());
 try {
  rows = definition.normalize(await definition.load());
  if (!rows.length) throw Error('データがありません');
  bindStatisticsPeriod(el, rows, definition.presets, render);
  el('save').addEventListener('click', () => saveStatisticsCSV(selected, definition, el('start').value, el('end').value));
  el('controls').disabled = false;
  render();
 } catch {
  status.textContent = '読み込みに失敗しました。HTTPのローカルサーバー経由で開き直してください。CSVの配置・内容も確認してください。';
  el('period').textContent = '対象期間：読み込み未完了';
 }
}
