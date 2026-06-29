import type { ContractArtifact } from '../types/contracts'

export function buildEmbedScript({
  dappUrl,
  buttonText,
  selectedContracts,
}: {
  dappUrl: string
  buttonText: string
  selectedContracts: ContractArtifact[]
}): string {
  const normalizedDappUrl = dappUrl.replace(/\/$/, '')
  const selectedIds = selectedContracts.map((contract) => contract.id)

  return `(function () {
  var DAPP_URL = ${JSON.stringify(normalizedDappUrl)};
  var BUTTON_TEXT = ${JSON.stringify(buttonText)};
  var CONTRACT_IDS = ${JSON.stringify(selectedIds)};

  function createButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = BUTTON_TEXT;
    btn.style.cssText = 'background:#111827;color:#fff;border:0;border-radius:10px;padding:10px 16px;font:600 14px/1.2 system-ui,sans-serif;cursor:pointer;';
    btn.addEventListener('click', openWalletConnectPopup);
    return btn;
  }

  function openWalletConnectPopup() {
    var qs = new URLSearchParams({
      embed: '1',
      contracts: CONTRACT_IDS.join(','),
    });
    var popupUrl = DAPP_URL + '/?' + qs.toString();
    var popup = window.open(popupUrl, 'walletconnect_dashboard_embed', 'width=460,height=720,menubar=0,toolbar=0');

    function onMessage(event) {
      if (!DAPP_URL.startsWith(event.origin)) {
        return;
      }

      if (!event.data || event.data.source !== 'walletconnect-dashboard') {
        return;
      }

      window.dispatchEvent(
        new CustomEvent('walletconnect:status', {
          detail: event.data,
        }),
      );

      if (event.data.type === 'connected') {
        btn.textContent = 'Wallet Connected';
      }
    }

    window.addEventListener('message', onMessage, false);

    if (popup) {
      popup.focus();
    }
  }

  var target = document.currentScript && document.currentScript.parentElement ? document.currentScript.parentElement : document.body;
  var btn = createButton();
  target.appendChild(btn);
})();
`
}
