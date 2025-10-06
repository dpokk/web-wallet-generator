import { mnemonicToSeed } from "bip39";
import { useEffect, useState } from "react";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { Button } from "./components/ui/Button";
import { CopyIcon } from "./components/ui/CopyIcon";
import { toHex } from "./lib/utils";

export const SolWallet = ({ mnemonic, isReady }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setCurrentIndex(0);
    setWallets([]);
    setFeedback("");
  }, [mnemonic]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = window.setTimeout(() => setFeedback(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleAddWallet = async () => {
    if (!mnemonic) return;
    try {
      const seed = await mnemonicToSeed(mnemonic);
      const path = `m/44'/501'/${currentIndex}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);

      setCurrentIndex((prev) => prev + 1);
      setWallets((prev) => [
        ...prev,
        {
          index: currentIndex,
          publicKey: keypair.publicKey.toBase58(),
          privateKey: toHex(derivedSeed),
        },
      ]);
      setFeedback(`Wallet #${currentIndex + 1} ready to copy.`);
    } catch (error) {
      console.error("Failed to derive Solana wallet", error);
      setFeedback("Derivation failed. Inspect the console for details.");
    }
  };

  const handleClear = () => {
    setCurrentIndex(0);
    setWallets([]);
    setFeedback("Wallet list cleared.");
  };

  const handleCopy = async (value, label) => {
    if (!navigator.clipboard) {
      setFeedback("Clipboard not available in this browser.");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(`${label} copied to clipboard.`);
    } catch (error) {
      console.error("Copy failed", error);
      setFeedback("Copy failed. Check browser permissions.");
    }
  };

  return (
    <>
      <div className="button-row">
        <Button onClick={handleAddWallet} disabled={!isReady}>
          Add Solana wallet
        </Button>
        <Button
          onClick={handleClear}
          variant="ghost"
          disabled={wallets.length === 0}
        >
          Clear list
        </Button>
      </div>
      <p className="helper-text">Using derivation path m/44&apos;/501&apos;/n&apos;/0&apos;.</p>
      {wallets.length === 0 ? (
        <div className="card card-muted">
          No Solana wallets yet. Lock a mnemonic and create the first wallet.
        </div>
      ) : (
        <div className="wallet-grid">
          {wallets.map((wallet) => (
            <div className="wallet-card" key={wallet.publicKey}>
              <div className="wallet-card__meta">
                <span>Index {wallet.index}</span>
                <h4 className="wallet-card__title">Wallet #{wallet.index + 1}</h4>
              </div>
              <div className="key-row">
                <span className="key-label">Public key</span>
                <div className="key-value">
                  <span>{wallet.publicKey}</span>
                  <Button
                    variant="outline"
                    className="icon-button"
                    onClick={() => handleCopy(wallet.publicKey, `Solana wallet #${wallet.index + 1} public key`)}
                    aria-label={`Copy public key for Solana wallet ${wallet.index + 1}`}
                  >
                    <CopyIcon />
                  </Button>
                </div>
              </div>
              <div className="key-row">
                <span className="key-label">Private key</span>
                <div className="key-value key-value--obscured">
                  <span>{wallet.privateKey}</span>
                  <Button
                    variant="outline"
                    className="icon-button"
                    onClick={() => handleCopy(wallet.privateKey, `Solana wallet #${wallet.index + 1} private key`)}
                    aria-label={`Copy private key for Solana wallet ${wallet.index + 1}`}
                  >
                    <CopyIcon />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {feedback && (
        <p className="inline-feedback" role="status" aria-live="polite">
          {feedback}
        </p>
      )}
    </>
  );
};
