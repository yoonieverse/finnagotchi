import TradingViewWidget from "../components/TradingViewWidget";

export function Portfolio() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Portfolio</h1>

      <div style={{ height: "500px", width: "100%", marginTop: "40px" }}>
        <TradingViewWidget />
      </div>
    </div>
  );
}
