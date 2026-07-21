import React, { useState, useEffect } from 'react';

// ISO Currency Fallback Map
const fallbackCurrencyMap = {
  US: 'USD', GB: 'GBP', IN: 'INR', SG: 'SGD', DE: 'EUR', 
  KY: 'KYD', CH: 'CHF', AE: 'AED', JP: 'JPY', CN: 'CNY', 
  ZA: 'ZAR', BR: 'BRL', CA: 'CAD', AU: 'AUD', MX: 'MXN', 
  FR: 'EUR', IT: 'EUR', KR: 'KRW', RU: 'RUB', SA: 'SAR'
};

const exchangeRatesToINR = {
  USD: 83.50, GBP: 105.20, INR: 1.00, SGD: 61.80, EUR: 90.50,
  KYD: 100.20, CHF: 92.30, AED: 22.70, JPY: 0.55, CNY: 11.50,
  ZAR: 4.40, BRL: 16.20, CAD: 60.80, AUD: 54.20, MXN: 4.90,
  KRW: 0.06, RUB: 0.90, SAR: 22.20, DEFAULT: 80.00
};

// Upgraded to use a global CDN to bypass Windows emoji limitations
const getCountryFlag = (countryCode) => {
  if (!countryCode) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      alt={countryCode}
      className="inline-block w-6 h-auto rounded-[2px] shadow-sm"
    />
  );
};
// Full Country Names Mapping
const countryNames = {
  IN: "India", US: "United States", GB: "United Kingdom",
  SG: "Singapore", DE: "Germany", KY: "Cayman Islands",
  AE: "United Arab Emirates", CH: "Switzerland", CA: "Canada",
  AU: "Australia", MX: "Mexico", FR: "France", IT: "Italy",
  KR: "South Korea", RU: "Russia", SA: "Saudi Arabia", DEFAULT: "International"
};

// Legal & Anomaly Explanation Generator
const getDetectionReason = (tx, amountInINR) => {
  const isHighValue = amountInINR >= 1000000;
  const source = countryNames[tx.origin] || tx.origin;
  const formattedINR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amountInINR);

  if (isHighValue) {
    return {
      law: "PMLA 2002 — Section 12 (CTR)",
      title: "Mandatory Cash Transaction Report (CTR)",
      reason: `Transaction value of ${formattedINR} meets or exceeds the mandatory regulatory limit of ₹10,00,000. All financial institutions must report cross-border transfers of this volume to FIU-IND regardless of origin.`,
      purpose: "High-Volume Treasury Transfer / Institutional Settlement"
    };
  } else {
    return {
      law: "PMLA 2002 — Rule 3 (STR)",
      title: "Suspicious Transaction Report (STR)",
      reason: `Flagged due to an elevated AI Risk Score of ${tx.risk_score}%. Routing funds from ${source} exhibits structural patterns associated with high-risk jurisdiction transfers, tax-haven routing, or layering.`,
      purpose: "Offshore Wire / Private Capital Movement"
    };
  }
};
export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [systemStatus, setSystemStatus] = useState('CONNECTING...');
  const [threatLevel, setThreatLevel] = useState(1.2);
  const [anomalies, setAnomalies] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [sectionInfo, setSectionInfo] = useState(null);

  const sectionDetails = {
    AML_GUARDIAN: {
      title: "AML Guardian: Financial Security Core",
      law: "PMLA 2002 Framework Oversight",
      description: "This overarching module acts as the primary defense mechanism against illicit financial flows. It ensures strict compliance with the Prevention of Money Laundering Act (PMLA) by continuously monitoring all incoming proprietary trading streams for structured money laundering attempts."
    },
    QUANT_RISK: {
      title: "Quantitative Risk Analysis",
      law: "Algorithmic Threat Detection",
      description: "Utilizes advanced neural network heuristics to assign a dynamic Risk Score to every transaction. Instead of relying solely on fixed monetary thresholds, it analyzes routing complexity, tax-haven involvement, and historical anomaly patterns to detect sophisticated layering."
    },
    THREAT_INDEX: {
      title: "Threat Index",
      law: "Real-Time Volatility Metric",
      description: "A live aggregation of systemic risk. If a high volume of suspicious transactions floods the network simultaneously, this index spikes. This warns compliance officers of a potential coordinated layering or smurfing attack on the financial system."
    },
    LIVE_STREAM: {
      title: "Live Capital Stream",
      law: "FIU-IND Continuous Polling",
      description: "A real-time ledger of all global fiat transactions. Every entry is instantly converted to Indian Rupees (INR) to check against the ₹10 Lakh mandatory reporting threshold (CTR) established by the Financial Intelligence Unit - India."
    }
  };

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/transactions');

    ws.onopen = () => setSystemStatus('SYSTEM ACTIVE');

    ws.onmessage = (event) => {
      const newTx = JSON.parse(event.data);
      
      // Increased to 7 items to perfectly fill 1080p vertical space
      setTransactions((prev) => [newTx, ...prev.slice(0, 6)]); 
      
      if (newTx.risk_score > 70) {
        setThreatLevel((prev) => Math.min(99.9, Number((prev + 0.6).toFixed(1))));
        setAnomalies((prev) => [newTx, ...prev.slice(0, 99)]);
      }
    };

    ws.onclose = () => setSystemStatus('DISCONNECTED');
    return () => ws.close();
  }, []);

  const formatDualCurrency = (amount, countryCode) => {
    const currencyCode = fallbackCurrencyMap[countryCode] || 'USD';
    const rate = exchangeRatesToINR[currencyCode] || exchangeRatesToINR.DEFAULT;
    const amountINR = amount * rate;

    let originalFormat = "";
    try {
      originalFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
    } catch (e) {
      originalFormat = `${currencyCode} ${amount.toFixed(2)}`;
    }

    const inrFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amountINR);

    return { original: originalFormat, inr: inrFormat, isINR: currencyCode === 'INR' };
  };

  return (
    <div className="h-screen w-full bg-[#0a1114] text-slate-200 font-sans flex flex-col relative selection:bg-teal-500/30 pb-6 overflow-y-auto overflow-x-hidden">
      
      {/* Background Graphic Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[800px] h-[800px] bg-rose-900/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-4 mx-6 mt-4 bg-[#111e22]/80 backdrop-blur-xl border border-[#1b3036] rounded-2xl shadow-lg relative z-20 shrink-0">
        <div 
  onClick={() => setSectionInfo('AML_GUARDIAN')}
  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
  title="Click to learn about AML Guardian"
>
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              AML <span className="text-teal-400">Guardian</span>
            </h1>
            <span className="text-[10px] text-teal-500/70 font-mono tracking-widest uppercase">
              Financial Security Core
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#0a1114] px-4 py-2 rounded-xl border border-[#1b3036]">
           <span className={`w-2.5 h-2.5 rounded-full ${systemStatus.includes('ACTIVE') ? 'bg-teal-400 animate-pulse shadow-[0_0_10px_#2dd4bf]' : 'bg-rose-500'}`}></span>
           <span className="text-xs font-mono font-bold tracking-wider text-slate-300">{systemStatus}</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col max-w-[1920px] w-full mx-auto px-6 pt-6 gap-6 relative z-10">
        
        {/* HERO ROW - FORCED SIDE-BY-SIDE */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* LEFT COLUMN: Risk Analysis (35% Width) */}
          <div className="w-full lg:w-[35%] flex flex-col gap-6">
            <div className="flex-1 bg-gradient-to-br from-[#111e22] to-[#0d171a] rounded-[2rem] border border-[#1b3036] p-6 lg:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl"></div>
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-4">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping"></span>
                  <span className="text-[9px] font-mono text-teal-400 font-bold tracking-widest uppercase">Scanning Engine</span>
                </div>
                
                <div 
  onClick={() => setSectionInfo('QUANT_RISK')}
  className="cursor-pointer hover:text-teal-400 transition-colors"
  title="Click to learn about Risk Analysis"
>
  <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-none mb-3">
    Quantitative <br /> Risk Analysis
  </h2>
</div>
                <p className="text-xs lg:text-sm text-slate-400 font-medium max-w-sm mb-6">
                  Real-time algorithmic ingestion of proprietary trading flow. Automatic conversion and logging of global 180-fiat matrix to INR standard.
                </p>
              </div>

              <div className="bg-[#0a1114] rounded-2xl p-5 border border-[#1b3036] shadow-inner mt-auto">
                <div 
  onClick={() => setSectionInfo('THREAT_INDEX')}
  className="flex justify-between items-end mb-2 cursor-pointer hover:text-rose-400 transition-colors"
  title="Click to learn about Threat Index">
  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Threat Index</span>
                  <span className="text-[9px] font-mono text-teal-500 bg-teal-500/10 px-2 py-1 rounded">LIVE</span>
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-5xl lg:text-6xl font-black tracking-tighter ${threatLevel > 50 ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-white'}`}>
                    {threatLevel.toFixed(1)}
                  </span>
                  <span className="text-xl text-slate-600 font-bold">%</span>
                </div>
                
                <div className="flex h-10 gap-1 items-end">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-sm transition-all duration-300 ${i < (threatLevel / 8) ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.3)]' : 'bg-[#1b3036]'}`}
                      style={{ height: `${Math.max(15, (i + 1) * 8)}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Capital Stream (65% Width) */}
          <div className="w-full lg:w-[65%] bg-[#111e22]/50 backdrop-blur-xl rounded-[2rem] border border-[#1b3036] p-6 lg:p-8 shadow-xl flex flex-col min-h-[480px]">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h3 
  onClick={() => setSectionInfo('LIVE_STREAM')}
  className="text-lg lg:text-xl font-bold text-white cursor-pointer hover:text-teal-300 transition-colors w-fit"
  title="Click to learn about the Live Stream"
>
  Live Capital Stream
</h3>
              <div className="flex gap-2">
                <span className="text-[9px] font-mono text-slate-400 bg-[#0a1114] px-2 py-1.5 rounded-lg border border-[#1b3036] hidden sm:block">
                  AUTO-CONVERT: INR (₹)
                </span>
                <span className="text-[9px] font-mono text-teal-400 bg-teal-500/10 px-2 py-1.5 rounded-lg border border-teal-500/20">
                  1.5s POLLING
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
              {transactions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">Awaiting neural network data...</div>
              ) : (
                transactions.map((tx, index) => {
                  // 1. Fetch exact exchange rate and calculate total INR value
                        const currency = fallbackCurrencyMap[tx.origin] || 'USD';
                        const rate = exchangeRatesToINR[currency] || exchangeRatesToINR.DEFAULT;
                        const amountInINR = tx.amount * rate;

                        // 2. FIU-IND Regulatory Threshold (10 Lakhs = 1,000,000 INR)
                        const isFiuRedAlert = amountInINR >= 1000000;

                        // 3. Force anomaly if risk score is high OR if it breaches the FIU limit
                        const isAnomaly = tx.risk_score > 70 || isFiuRedAlert;
                        
                        const dualCash = formatDualCurrency(tx.amount, tx.origin);
                  
                  return (
                    <div 
                      key={tx.id} 
                      className={`flex items-center justify-between px-4 py-3 lg:px-5 lg:py-3.5 rounded-xl transition-all duration-500 ${
                        index === 0 
                          ? 'bg-white text-slate-900 shadow-lg translate-y-[-2px]' 
                          : 'bg-[#0a1114] text-slate-200 border border-[#1b3036]'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-[30%]">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                           index === 0 
                             ? isAnomaly ? 'bg-rose-100' : 'bg-slate-100'
                             : isAnomaly ? 'bg-rose-950' : 'bg-[#111e22] border border-[#1b3036]'
                         }`}>
                           {getCountryFlag(tx.origin)}
                         </div>
                         <div className="hidden sm:block">
                           <div className={`text-xs font-bold ${index === 0 ? 'text-slate-900' : 'text-slate-200'}`}>{tx.id}</div>
                           <div className={`text-[9px] font-mono mt-0.5 ${index === 0 ? 'text-slate-500' : 'text-slate-500'}`}>{tx.timestamp}</div>
                         </div>
                      </div>

                      <div className="w-[15%] text-center">
                         <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg ${
                           index === 0 ? 'bg-slate-100 text-slate-600' : 'bg-[#111e22] text-slate-400'
                         }`}>
                           ➔ {tx.dest}
                         </span>
                      </div>

                      <div className="w-[40%] text-right flex flex-col items-end justify-center">
                         <span className={`text-lg lg:text-xl font-black tracking-tight ${
                           isAnomaly 
                             ? (index === 0 ? 'text-rose-600' : 'text-rose-500') 
                             : (index === 0 ? 'text-slate-900' : 'text-white')
                         }`}>
                           {dualCash.original}
                         </span>
                         
                         {!dualCash.isINR && (
                           <span className={`text-[10px] font-bold font-mono mt-0.5 px-1.5 py-0.5 rounded ${
                             index === 0 ? 'bg-teal-50 text-teal-700' : 'bg-teal-950/30 text-teal-400'
                           }`}>
                             {dualCash.inr}
                           </span>
                         )}
                      </div>

                      <div className="w-[15%] flex justify-end">
                         <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm ${
                           isAnomaly 
                             ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                             : (index === 0 ? 'bg-slate-100 text-slate-400' : 'bg-[#111e22] text-slate-500')
                         }`}>
                           {tx.risk_score}%
                         </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Quarantine Ledger */}
        <div className="bg-[#111e22]/50 backdrop-blur-xl rounded-[2rem] border border-rose-900/30 p-5 lg:p-6 shadow-xl shrink-0 mt-2">
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <h4 className="text-base lg:text-lg font-bold text-white mb-1">Threat Quarantine Ledger</h4>
              <p className="text-[10px] lg:text-xs text-slate-400 hidden sm:block">Persistent historical record of all cross-border spikes exceeding 70% risk threshold.</p>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
              {anomalies.length} Records
            </span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 pt-1 custom-scrollbar snap-x px-2">
            {anomalies.length === 0 ? (
              <div className="w-full h-24 rounded-2xl border border-[#1b3036] bg-[#0a1114] flex items-center justify-center text-slate-500 text-xs font-mono italic">
                No anomalies detected in the current session.
              </div>
            ) : (
              anomalies.map((tx) => {
                const dualCash = formatDualCurrency(tx.amount, tx.origin);
                // FIU-IND Regulatory Tagging
                      const currency = fallbackCurrencyMap[tx.origin] || 'USD';
                      const rate = exchangeRatesToINR[currency] || exchangeRatesToINR.DEFAULT;
                      const amountInINR = tx.amount * rate;
                      const alertType = amountInINR >= 1000000 ? "FIU-CTR" : "FIU-STR";
                return (
                  <div 
  key={tx.id + "carousel"}
  onClick={() => setSelectedTx({ ...tx, amountInINR, alertType, explanation: getDetectionReason(tx, amountInINR) })}
  className="min-w-[260px] lg:min-w-[280px] bg-[#0a1114] border border-[#1b3036] hover:border-rose-500/50 rounded-2xl p-4 relative cursor-pointer transition-all hover:scale-[1.02] group"
>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-rose-800"></div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] text-slate-400 font-mono font-bold flex items-center gap-2">
                        <span className="text-lg leading-none">{getCountryFlag(tx.origin)}</span> {tx.id}
                      </span>
                      <span className="text-[9px] font-black text-white bg-rose-600 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(225,29,72,0.6)]">
  {alertType} | {tx.risk_score}%
</span>
                    </div>
                    
                    <div className="text-xl font-black tracking-tight text-rose-500 mb-1">
                      {dualCash.original}
                    </div>
                    {!dualCash.isINR && (
                      <div className="text-[10px] font-mono font-bold text-teal-400 mb-2">
                        {dualCash.inr}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 text-[9px] font-mono">
                      <span className="bg-[#111e22] text-slate-300 px-1.5 py-1 rounded border border-[#1b3036]">
                        {tx.origin} ➔ {tx.dest}
                      </span>
                      <span className="text-slate-500">{tx.timestamp}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Global CSS injected to fix scrollbars and apply FinTech styling */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Lock the browser's native root to completely kill the gray scrollbar */
        body, html, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden !important; 
          background-color: #0a1114;
        }

        /* Apply the premium FinTech scrollbar globally */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: #1b3036; 
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2dd4bf; 
        }
      `}} />
      {/* EDUCATIONAL TRANSPARENCY MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e181b] border border-[#1b3036] w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-white">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#1b3036]">
              <div>
                <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
                  {selectedTx.explanation.law}
                </span>
                <h3 className="text-xl font-bold mt-1">{selectedTx.explanation.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white bg-slate-800/50 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Route & Flags Breakdown */}
            <div className="my-5 bg-[#070c0e] p-4 rounded-2xl border border-[#112227] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getCountryFlag(selectedTx.origin)}
                <div>
                  <p className="text-xs text-slate-400">Sender</p>
                  <p className="font-bold text-sm">{countryNames[selectedTx.origin] || selectedTx.origin}</p>
                </div>
              </div>
              <div className="text-slate-500 font-bold text-lg">➔</div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-xs text-slate-400">Recipient</p>
                  <p className="font-bold text-sm">{countryNames[selectedTx.destination] || "India"}</p>
                </div>
                {getCountryFlag(selectedTx.destination || "IN")}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Declared Purpose:</span>
                <span className="font-mono font-medium text-teal-300">{selectedTx.explanation.purpose}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Converted Value (INR):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedTx.amountInINR)}
                </span>
              </div>
            </div>

            {/* Educational Legal Context */}
            <div className="mt-5 bg-rose-950/30 border border-rose-900/40 p-4 rounded-2xl text-xs text-rose-200/90 leading-relaxed">
              <p className="font-bold mb-1 text-rose-400 flex items-center gap-1">
                💡 Transparency & Regulatory Insight
              </p>
              {selectedTx.explanation.reason}
            </div>

            <button 
              onClick={() => setSelectedTx(null)}
              className="w-full mt-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
            >
              Close Inspection Panel
            </button>
          </div>
        </div>
      )}
      {/* SECTION EDUCATIONAL MODAL */}
      {sectionInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e181b] border border-teal-900/50 w-full max-w-md rounded-3xl p-6 shadow-[0_0_30px_rgba(20,184,166,0.15)] relative text-white">
            <div className="flex justify-between items-start pb-4 border-b border-[#1b3036]">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
                  {sectionDetails[sectionInfo].law}
                </span>
                <h3 className="text-xl font-bold mt-1">{sectionDetails[sectionInfo].title}</h3>
              </div>
              <button 
                onClick={() => setSectionInfo(null)}
                className="text-slate-400 hover:text-white bg-slate-800/50 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-5 text-sm text-slate-300 leading-relaxed font-medium">
              {sectionDetails[sectionInfo].description}
            </div>
            
            <button 
              onClick={() => setSectionInfo(null)}
              className="w-full mt-6 py-3 bg-teal-950 hover:bg-teal-900 text-teal-100 border border-teal-800/50 font-bold rounded-xl text-sm transition-all"
            >
              Acknowledge & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}