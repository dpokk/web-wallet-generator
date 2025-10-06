import { useEffect, useMemo, useState } from "react";
import { generateMnemonic, validateMnemonic } from "bip39";
import "./App.css";
import { EthWallet } from "./EthWallet";
import { SolWallet } from "./SolWallet";
import { Button } from "./components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/Card";
import { Label } from "./components/ui/Label";
import { Textarea } from "./components/ui/Textarea";
import { CopyIcon } from "./components/ui/CopyIcon";

const MNEMONIC_PLACEHOLDER = "connect climb produce kingdom walnut glove ...";

function normalizeMnemonic(raw) {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

function App() {
  const [mnemonicDraft, setMnemonicDraft] = useState("");
  const [activeMnemonic, setActiveMnemonic] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copyNotice, setCopyNotice] = useState("");

  const normalizedDraft = useMemo(() => {
    return mnemonicDraft ? normalizeMnemonic(mnemonicDraft) : "";
  }, [mnemonicDraft]);

  const isDraftValid = useMemo(() => {
    if (!normalizedDraft) return false;
    try {
      return validateMnemonic(normalizedDraft);
    } catch (error) {
      console.warn("Mnemonic validation failed", error);
      return false;
    }
  }, [normalizedDraft]);

  useEffect(() => {
    if (!copyNotice) return undefined;
    const timeout = window.setTimeout(() => setCopyNotice(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [copyNotice]);

  const handleMnemonicChange = (event) => {
    setMnemonicDraft(event.target.value);
    setActiveMnemonic("");
    setStatusMessage("");
    setErrorMessage("");
  };

  const handleGenerateMnemonic = () => {
    const generated = generateMnemonic();
    setMnemonicDraft(generated);
    setActiveMnemonic(generated);
    setStatusMessage("New mnemonic generated. Wallet lists reset.");
    setErrorMessage("");
  };

  const handleUseMnemonic = () => {
    const normalized = normalizedDraft;
    if (!normalized) {
      setErrorMessage("Enter a BIP-39 mnemonic phrase (12-24 words).");
      setActiveMnemonic("");
      setStatusMessage("");
      return;
    }
    if (!isDraftValid) {
      setErrorMessage("That mnemonic isn't valid. Double-check spelling and word count.");
      setActiveMnemonic("");
      setStatusMessage("");
      return;
    }

    setActiveMnemonic(normalized);
    setErrorMessage("");
    setStatusMessage("Mnemonic locked. Derive wallets below.");
  };

  const handleReset = () => {
    setMnemonicDraft("");
    setActiveMnemonic("");
    setStatusMessage("");
    setErrorMessage("");
    setCopyNotice("");
  };

  const handleCopyDraft = async () => {
    if (!mnemonicDraft) return;
    if (!navigator.clipboard) {
      setCopyNotice("Clipboard not available in this browser.");
      return;
    }
    try {
      await navigator.clipboard.writeText(normalizedDraft || mnemonicDraft);
      setCopyNotice("Mnemonic copied to clipboard.");
    } catch (error) {
      console.warn("Copy failed", error);
      setCopyNotice("Copy failed. Check browser permissions.");
    }
  };

  const hasActiveMnemonic = Boolean(activeMnemonic);

  return (
    <div className="app-shell">
      <header className="hero">
        <h1 className="hero-title">Wallet address generator</h1>
        <p className="hero-subtitle">
          Generate and manage secure blockchain wallets directly in your browser. Create or import a BIP-39 seed phrase, then instantly derive Ethereum and Solana addresses — all locally, with zero data sent to any server.
        </p>
      </header>

      <main className="primary-pane">
        <Card className="seed-card">
          <CardHeader>
            <CardTitle>Enter or Generate Your Seed</CardTitle>
            <CardDescription>
              Paste your existing seed phrase or generate a new one. We’ll automatically clean up formatting and ensure it’s BIP-39 compliant before generating wallets.
               </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="field-group">
              <Label htmlFor="mnemonic">Mnemonic phrase</Label>
              <div className="field-with-action">
                <Textarea
                  id="mnemonic"
                  placeholder={MNEMONIC_PLACEHOLDER}
                  value={mnemonicDraft}
                  onChange={handleMnemonicChange}
                />
                <Button
                  variant="ghost"
                  className="icon-button icon-button--overlay"
                  onClick={handleCopyDraft}
                  aria-label="Copy mnemonic"
                  disabled={!mnemonicDraft}
                >
                  <CopyIcon />
                </Button>
              </div>
            </div>
            <div className="button-row">
              <div className="button-cluster">
                <Button onClick={handleGenerateMnemonic}>Generate mnemonic</Button>
                <Button onClick={handleUseMnemonic} variant="secondary" disabled={!isDraftValid}>
                  Use mnemonic
                </Button>
              </div>
              <Button
                onClick={handleReset}
                variant="ghost"
                disabled={!mnemonicDraft}
                className="button--align-end"
              >
                Reset
              </Button>
            </div>
            {errorMessage ? (
              <p className="status-badge status-badge--error" role="alert">
                {errorMessage}
              </p>
            ) : (
              <>
                {statusMessage && (
                  <p className="status-badge status-badge--success" role="status" aria-live="polite">
                    {statusMessage}
                  </p>
                )}
                {!statusMessage && isDraftValid && !hasActiveMnemonic && (
                  <p className="status-badge">
                    Draft looks valid. Lock it in to derive wallets.
                  </p>
                )}
              </>
            )}
            {copyNotice && (
              <p className="inline-feedback" role="status" aria-live="polite">
                {copyNotice}
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <section className="wallet-section" aria-live="polite">
        <div className="wallet-header">
          <h2 className="card-title">Derived wallets</h2>
          <span className="helper-text">
            {hasActiveMnemonic
              ? "Add wallets as needed. Each derivation stays deterministic for this mnemonic."
              : "Lock a valid mnemonic above to start deriving new wallets."}
          </span>
        </div>
        <div className="wallet-services">
          <Card className="wallet-service-card">
            <CardHeader>
              <CardTitle>Ethereum</CardTitle>
              <CardDescription>
               Derive EVM-compatible keys with ethers.js. Each wallet is indexed for repeatable recovery.
                </CardDescription>
            </CardHeader>
            <CardContent>
              <EthWallet mnemonic={activeMnemonic} isReady={hasActiveMnemonic} />
            </CardContent>
          </Card>

          <Card className="wallet-service-card">
            <CardHeader>
              <CardTitle>Solana</CardTitle>
              <CardDescription>
               Generate Solana-ready Ed25519 keypairs. Deterministic outputs for hardware or software imports
                </CardDescription>
            </CardHeader>
            <CardContent>
              <SolWallet mnemonic={activeMnemonic} isReady={hasActiveMnemonic} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="knowledge-section" aria-labelledby="how-it-works">
        <Card>
          <CardHeader>
            <CardTitle id="how-it-works">How does this work?</CardTitle>
            <CardDescription>
              Understand the security model before you export keys.
            </CardDescription>
          </CardHeader>
          <CardContent className="knowledge-list">
            <div className="knowledge-item">
              <span className="knowledge-item__icon">01</span>
              <div className="knowledge-item__body">
                <h3>Mnemonic hygiene</h3>
                <p>
                  Input is normalized locally—extra spaces are trimmed, casing is unified, and nothing ever leaves your device.
                </p>
              </div>
            </div>
            <div className="knowledge-item">
              <span className="knowledge-item__icon">02</span>
              <div className="knowledge-item__body">
                <h3>Seed derivation</h3>
                <p>
                  We follow the BIP-39 specification to generate a 512-bit seed from your phrase, ready for deterministic wallet derivation.
                </p>
              </div>
            </div>
            <div className="knowledge-item">
              <span className="knowledge-item__icon">03</span>
              <div className="knowledge-item__body">
                <h3>Chain-specific paths</h3>
                <p>
                  Ethereum wallets use <code>m/44&apos;/60&apos;/n&apos;/0&apos;</code> while Solana wallets use <code>m/44&apos;/501&apos;/n&apos;/0&apos;</code>. Increment <code>n</code> to reproduce accounts on any compatible wallet.
                </p>
              </div>
            </div>
            <div className="knowledge-item">
              <span className="knowledge-item__icon">04</span>
              <div className="knowledge-item__body">
                <h3>Client-side outputs</h3>
                <p>
                  Private keys stay masked by default and are rendered only in your browser. Copy them with care and store them securely offline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="footer">
        <span>
          Crafted for offline experimentation. View the source on{" "}
          <a
            href="https://github.com/dpokk/web-wallet-generator"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </span>
      </footer>
    </div>
  );
}

export default App;
