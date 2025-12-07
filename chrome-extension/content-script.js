// content-script.js
(() => {
  // 日本語UI想定で「説明を追加」のエリアを拾う
  const DESCRIPTION_SELECTORS = [
    'textarea[aria-label*="説明"]',
    'div[aria-label*="説明を追加"]',
    'div[aria-label*="説明"]'
  ];

  const TOGGLE_WRAPPER_ID = 'minutes-toggle-wrapper';
  const TOGGLE_INPUT_ID = 'minutes-toggle-checkbox';
  const TAG_TEXT = '#minutes_on';

  // --- スタイル定義 (修正版) ---
  function injectToggleStyles() {
    const STYLE_ID = 'minutes-toggle-style';
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* スイッチ全体のコンテナ */
      .ext-toggle-container {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        /* フォント設定を親から継承させる */
        font-family: inherit; 
      }
      
      /* スイッチ本体 (背景) */
      .ext-toggle-switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
        flex-shrink: 0; /* ラベルが長くてもスイッチが潰れないように */
      }

      /* 本来のチェックボックスは隠す */
      .ext-toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      /* スライダー部分 */
      .ext-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #ccc; /* OFF時は薄いグレー */
        transition: .3s;
        border-radius: 20px;
      }

      /* ダークモード対応: 背景が暗い場合にスイッチが浮くように微調整 (任意) */
      @media (prefers-color-scheme: dark) {
        .ext-toggle-slider {
          background-color: #5f6368;
        }
      }

      /* スライダーの丸い部分 */
      .ext-toggle-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }

      /* ONの時の背景色 (Google Blue) */
      input:checked + .ext-toggle-slider {
        background-color: #1a73e8;
      }

      /* ONの時の丸の移動 */
      input:checked + .ext-toggle-slider:before {
        transform: translateX(16px);
      }

      /* ラベルテキスト */
      .ext-toggle-label {
        font-size: 14px;
        /* color指定を削除し、親要素(Googleカレンダー)の色を継承させる */
        cursor: pointer;
        user-select: none;
        line-height: 20px; /* スイッチの高さに合わせる */
      }
    `;
    document.head.appendChild(style);
  }

  // --- ロジック部分 (変更なし) ---

  function findDescriptionElement() {
    for (const sel of DESCRIPTION_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function getDescriptionText(el) {
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      return el.value || '';
    } else {
      return el.innerText || el.textContent || '';
    }
  }

  function setDescriptionText(el, text) {
    if (!el) return;
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      el.innerText = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function addMinutesTag(el) {
    const current = getDescriptionText(el).trimEnd();
    if (current.includes(TAG_TEXT)) return;
    const newText = current ? current + '\n' + TAG_TEXT : TAG_TEXT;
    setDescriptionText(el, newText);
  }

  function removeMinutesTag(el) {
    const current = getDescriptionText(el);
    const newText = current.replace(/\s*#minutes_on\s*$/m, '').trimEnd();
    setDescriptionText(el, newText);
  }

  function insertToggle(descriptionEl) {
    if (!descriptionEl) return;
    if (document.getElementById(TOGGLE_WRAPPER_ID)) return;

    injectToggleStyles();

    const container = document.createElement('div');
    container.id = TOGGLE_WRAPPER_ID;
    container.className = 'ext-toggle-container';

    const switchLabel = document.createElement('label');
    switchLabel.className = 'ext-toggle-switch';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = TOGGLE_INPUT_ID;

    const sliderSpan = document.createElement('span');
    sliderSpan.className = 'ext-toggle-slider';

    switchLabel.appendChild(checkbox);
    switchLabel.appendChild(sliderSpan);

    const textLabel = document.createElement('label');
    textLabel.className = 'ext-toggle-label';
    textLabel.htmlFor = TOGGLE_INPUT_ID;
    textLabel.textContent = '議事録(Notion)ページの自動追加';

    container.appendChild(switchLabel);
    container.appendChild(textLabel);

    const parent = descriptionEl.parentElement || descriptionEl;
    parent.insertAdjacentElement('afterend', container);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        addMinutesTag(descriptionEl);
      } else {
        removeMinutesTag(descriptionEl);
      }
    });
  }

  function tryInit() {
    const descriptionEl = findDescriptionElement();
    if (descriptionEl) {
      insertToggle(descriptionEl);
    }
  }

  window.addEventListener('load', () => {
    tryInit();
  });

  const observer = new MutationObserver(() => {
    tryInit();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();