/* JavaScriptが無効でも全ての本文とナビゲーションを利用できます。 */
(function () {
  'use strict';

  var button = document.querySelector('.menu-toggle');
  var navigation = document.getElementById('site-nav');
  if (button && navigation && window.matchMedia) {
    var mobile = window.matchMedia('(max-width: 760px)');

    function closeMenu() {
      navigation.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      button.textContent = 'メニュー';
    }

    function updateLayout() {
      // 幅が変わった際、非表示になる要素にキーボードフォーカスを残さない。
      var active = document.activeElement;
      if (mobile.matches) button.hidden = false;
      else document.documentElement.classList.remove('menu-ready');
      if (mobile.matches && navigation.contains(active)) button.focus();
      if (!mobile.matches && active === button) navigation.querySelector('a').focus();
      closeMenu();
      button.hidden = !mobile.matches;
      document.documentElement.classList.toggle('menu-ready', mobile.matches);
    }

    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') !== 'true';
      navigation.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '閉じる' : 'メニュー';
    });

    navigation.addEventListener('click', function (event) {
      var link = event.target;
      if (link.tagName !== 'A' || !mobile.matches) return;
      var section = document.getElementById(link.hash.slice(1));
      if (section) {
        section.setAttribute('tabindex', '-1');
        section.focus();
      }
      closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        button.focus();
      }
    });

    // 古いSafariでも表示切り替えが可能なフォールバック。
    if (mobile.addEventListener) mobile.addEventListener('change', updateLayout);
    else if (mobile.addListener) mobile.addListener(updateLayout);
    updateLayout();
  }

  // 市民の声一覧：data-categories による分野絞り込み（任意機能）。
  var filterRoot = document.querySelector('[data-voice-filter]');
  var voiceList = document.querySelector('[data-voice-list]');
  if (!filterRoot || !voiceList) return;

  var buttons = filterRoot.querySelectorAll('[data-filter]');
  var cards = voiceList.querySelectorAll('[data-categories]');
  var status = filterRoot.querySelector('[data-filter-status]');
  var categoryNames = {
    '1': '医療・医療費',
    '2': '公共交通・高齢者の移動',
    '3': '農業・燃料費・補助制度',
    '4': '移住・定住',
    '5': '雇用・若者流出',
    '6': '子育て・福祉',
    '7': '消防・防災',
    '8': '少子高齢化・公共事業',
    '9': '空き家・草木管理',
    '10': 'エネルギー・災害時の電気',
    '11': 'ゴミ・資源'
  };

  function currentFilterFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      var value = params.get('c');
      if (value && (value === 'all' || categoryNames[value])) return value;
    } catch (error) {}
    return 'all';
  }

  function setFilter(value) {
    var visible = 0;
    var index;
    for (index = 0; index < cards.length; index += 1) {
      var card = cards[index];
      var categories = (card.getAttribute('data-categories') || '').split(/\s+/);
      var match = value === 'all' || categories.indexOf(value) !== -1;
      card.classList.toggle('is-filtered-out', !match);
      if (match) visible += 1;
    }
    for (index = 0; index < buttons.length; index += 1) {
      var btn = buttons[index];
      var active = btn.getAttribute('data-filter') === value;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    if (status) {
      if (value === 'all') status.textContent = '';
      else if (visible === 0) status.textContent = 'この分野の聞き取り記録はまだありません。';
      else status.textContent = categoryNames[value] + '：' + visible + '件';
    }
    try {
      var url = new URL(window.location.href);
      if (value === 'all') url.searchParams.delete('c');
      else url.searchParams.set('c', value);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (error) {}
  }

  filterRoot.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.getAttribute) return;
    var value = target.getAttribute('data-filter');
    if (!value) return;
    setFilter(value);
  });

  setFilter(currentFilterFromUrl());
}());
