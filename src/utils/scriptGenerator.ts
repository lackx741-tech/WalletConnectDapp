import type { ContractArtifact } from '../types/contracts'

export type EmbeddedContractMetadata = {
  id: string
  name: string
  address: `0x${string}`
  purpose: string
}

export function getEmbeddedContractMetadata(selectedContracts: ContractArtifact[]): EmbeddedContractMetadata[] {
  return selectedContracts.map((contract) => ({
    id: contract.id,
    name: contract.name,
    address: contract.address,
    purpose: contract.purpose,
  }))
}

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
  const contractMetadata = getEmbeddedContractMetadata(selectedContracts)

  return `(function () {
  var DAPP_URL = ${JSON.stringify(normalizedDappUrl)};
  var BUTTON_TEXT = ${JSON.stringify(buttonText)};
  var CONTRACT_METADATA = ${JSON.stringify(contractMetadata)};
  var CONTRACT_IDS = CONTRACT_METADATA.map(function (contract) {
    return contract.id;
  });
  var EXPECTED_ORIGIN = (function () {
    try {
      return new URL(DAPP_URL).origin;
    } catch (_err) {
      return window.location.origin;
    }
  })();
  var btn;

  function createButton() {
    btn = document.createElement('button');
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
      if (event.origin !== EXPECTED_ORIGIN) {
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
        window.removeEventListener('message', onMessage, false);
      }
    }

    window.addEventListener('message', onMessage, false);

    if (popup) {
      popup.focus();

      var closeCheck = window.setInterval(function () {
        if (popup.closed) {
          window.removeEventListener('message', onMessage, false);
          window.clearInterval(closeCheck);
        }
      }, 500);
    }
  }

  var target = document.currentScript && document.currentScript.parentElement ? document.currentScript.parentElement : document.body;
  btn = createButton();
  target.appendChild(btn);
})();
`
}
