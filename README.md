# Web Wallet Generator

This is a browser-based tool for producing deterministic Ethereum and Solana wallets from BIP‑39 seed phrases. It streamlines seed hygiene, validates mnemonic integrity, and derives chain-specific key pairs entirely on the client so builders can audit, recover, or prototype wallet flows without exposing secrets to remote services.

## ✨ Features

- **Mnemonic lifecycle** – Paste an existing BIP‑39 phrase or generate a new one with `bip39`. The app normalizes casing and whitespace before validation.
- **Deterministic derivation** – Ethereum wallets follow `m/44'/60'/n'/0'` via `ethers` while Solana wallets use `m/44'/501'/n'/0'` through `@solana/web3.js` + `ed25519-hd-key`.
- **Client-side security** – Seeds, keys, and copy actions never leave the browser; private keys stay visually masked until explicitly copied.

## 🧠 Concepts & Libraries

| Concept | How it’s used | Key packages |
| --- | --- | --- |
| BIP‑39 mnemonics | Generate and validate 12–24 word phrases | [`bip39`](https://github.com/bitcoinjs/bip39) |
| HD wallet derivation | Deterministic child keys for each chain | [`ethers`](https://docs.ethers.org/), [`ed25519-hd-key`](https://github.com/dazza5000/ed25519-hd-key) |
| Ed25519 keypairs | Solana-compatible signatures | [`@solana/web3.js`](https://solana-labs.github.io/solana-web3.js/), [`tweetnacl`](https://github.com/dchest/tweetnacl-js) |

## 🧩 Application Flow

1. **Seed entry** – Users paste or generate a mnemonic. The input is normalized (`trim → lowercase → collapse spaces`) before validation.
2. **Validation** – `validateMnemonic` from `bip39` ensures the phrase exists on the English wordlist and has a valid checksum.
3. **Wallet derivation**
	- Ethereum: mnemonic → seed → `HDNodeWallet.fromSeed` → derive path `m/44'/60'/index'/0'` → expose address/public/private.
	- Solana: mnemonic → seed → `ed25519-hd-key` derive → `tweetnacl` → `Keypair.fromSecretKey` → Base58 public key.

## 🛡️ Security Notes

- The app runs entirely in the browser. No seed, address, or key is sent over the network.
- Masked private keys are still present in the DOM; copy them only when you are ready to store them securely.
- Avoid using real production mnemonics on machines you do not control. Treat this as an offline utility or development aid.

## 🚀 Local Setup

```bash
git clone https://github.com/dpokk/web-wallet-generator.git
cd web-wallet-generator/wal-ad-gen
npm install
npm run dev
```

Visit the Vite URL (default `http://localhost:5173`) 

## ✅ Usage Tips

- Use the “Generate mnemonic” button for test seeds, or paste your own to replay deterministic derivations.
- “Use mnemonic” locks the phrase and enables the Add Wallet buttons, ensuring accidental edits don’t change your derivation path mid-session.
- Copy buttons emit inline feedback. If you receive a clipboard warning, ensure your browser grants clipboard permissions to the page.
- For extended testing, open DevTools → Application → Local Storage to confirm that no wallet data is persisted.

## 📄 License

GPLv3 © dpokk (check the root repository for the exact license terms).
