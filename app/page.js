"use client";

import { useState } from "react";

const CATEGORIES = [
  { id: "business", label: "💼 Business" },
  { id: "nature", label: "🌿 Nature" },
  { id: "technology", label: "💻 Technology" },
  { id: "people", label: "👥 People" },
  { id: "food", label: "🍽️ Food" },
  { id: "travel", label: "✈️ Travel" },
  { id: "health", label: "❤️ Health" },
  { id: "abstract", label: "🎨 Abstract" },
];

const STYLES = [
  "Photorealistic",
  "Cinematic",
  "Flat Design",
  "Minimalist",
  "Vibrant",
  "Dark Moody",
];

export default function Home() {
  const [category, setCategory] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Photorealistic");
  const [imageUrl, setImageUrl] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState(null);

  const generate = async () => {
    if (!prompt.trim() && !category) {
      setError("Please enter a description or select a category!");
      return;
    }
    setError(null);
    setImageUrl(null);
    setMetadata(null);
    setEnhancedPrompt("");
    setLoading(true);
    setLoadingStep("🧠 Enhancing your prompt with AI...");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || category,
          category: category || "general",
          style,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError("Error: " + data.error);
        setLoading(false);
        setLoadingStep("");
        return;
      }

      setEnhancedPrompt(data.enhancedPrompt);
      setMetadata(data.metadata);
      setLoadingStep("🎨 Generating image...");

      const img = new window.Image();
      img.onload = () => {
        setImageUrl(data.imageUrl);
        setLoading(false);
        setLoadingStep("");
      };
      img.onerror = () => {
        const fallbackUrl = data.imageUrl.replace("&model=flux", "");
        const img2 = new window.Image();
        img2.onload = () => {
          setImageUrl(fallbackUrl);
          setLoading(false);
          setLoadingStep("");
        };
        img2.onerror = () => {
          setError("Image load failed. Please try again.");
          setLoading(false);
          setLoadingStep("");
        };
        img2.src = fallbackUrl;
      };
      img.src = data.imageUrl;

    } catch (err) {
      setError("Network error: " + err.message);
      setLoading(false);
      setLoadingStep("");
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stockgen-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const downloadMetadata = () => {
    if (!metadata) return;
    const text = `TITLE:\n${metadata.title}\n\nDESCRIPTION:\n${metadata.description}\n\nKEYWORDS:\n${metadata.keywords.join(", ")}\n\nENHANCED PROMPT USED:\n${enhancedPrompt}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metadata-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        .main-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .header-badge {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.04);
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .image-btn-group {
          display: flex;
          gap: 8px;
        }
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr;
            padding: 0 16px;
          }
          .header-badge {
            display: none;
          }
          .image-btn-group {
            flex-direction: column;
            gap: 6px;
          }
          .image-btn-group button {
            width: 100%;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", paddingBottom: 60 }}>

        {/* Header */}
        <header style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
            }}>✦</div>
            <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>
              Stock<span className="gradient-text">Gen</span>
            </span>
          </div>
          <div className="header-badge">AI-Enhanced Prompts • 100% Free</div>
        </header>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "36px 20px 28px" }}>
          <h1 style={{
            fontSize: "clamp(24px, 5vw, 52px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 14
          }}>
            Generate <span className="gradient-text">AI Stock Images</span>
            <br />with Auto Metadata
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "clamp(13px, 2vw, 16px)",
            maxWidth: 520,
            margin: "0 auto",
            padding: "0 8px"
          }}>
            AI enhances your prompt first, then generates a precise stock photo — ready for Shutterstock, Adobe Stock & more.
          </p>
        </div>

        {/* Main Grid */}
        <div className="main-grid">

          {/* LEFT - Controls */}
          <div className="card" style={{ padding: "20px", height: "fit-content" }}>

            {/* Category */}
            <div style={{ marginBottom: 20 }}>
              <div className="section-label">Category</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-btn ${category === cat.id ? "active" : ""}`}
                    onClick={() => setCategory(category === cat.id ? null : cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <div className="section-label">Image Description</div>
              <textarea
                className="input-field"
                rows={4}
                placeholder="e.g. Construction workers reviewing blueprints on a job site..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) generate(); }}
              />
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
                Ctrl+Enter to generate
              </div>
            </div>

            {/* Style */}
            <div style={{ marginBottom: 24 }}>
              <div className="section-label">Visual Style</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {STYLES.map((s) => (
                  <button
                    key={s}
                    className={`category-btn ${style === s ? "active" : ""}`}
                    onClick={() => setStyle(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button className="btn-primary" onClick={generate} disabled={loading}>
              {loading
                ? (<><span className="spinner" />{loadingStep || "Generating..."}</>)
                : "✦ Generate Stock Image"
              }
            </button>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8, fontSize: 13, color: "#f87171"
              }}>
                {error}
              </div>
            )}

            {/* Enhanced Prompt */}
            {enhancedPrompt && !loading && (
              <div style={{
                marginTop: 16, padding: "12px 14px",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 10
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 6, letterSpacing: "0.08em" }}>
                  AI ENHANCED PROMPT
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                  {enhancedPrompt}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - Output */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Image */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14,
                flexWrap: "wrap", gap: 10
              }}>
                <div className="section-label" style={{ marginBottom: 0 }}>Generated Image</div>
                {imageUrl && (
                  <div className="image-btn-group">
                    <button className="btn-secondary" onClick={generate}>↻ Regenerate</button>
                    <button className="btn-secondary" onClick={downloadImage}>↓ Download</button>
                  </div>
                )}
              </div>

              <div className="image-wrapper">
                {loading && loadingStep.includes("image") ? (
                  <div className="skeleton" style={{ width: "100%", height: "100%" }} />
                ) : loading ? (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.3)", gap: 12
                  }}>
                    <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                    <div style={{ fontSize: 13 }}>{loadingStep}</div>
                  </div>
                ) : imageUrl ? (
                  <img src={imageUrl} alt="Generated stock image" />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.12)", gap: 12
                  }}>
                    <div style={{ fontSize: 52 }}>🖼️</div>
                    <div style={{ fontSize: 14 }}>Your image will appear here</div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 16,
                flexWrap: "wrap", gap: 10
              }}>
                <div className="section-label" style={{ marginBottom: 0 }}>SEO Metadata</div>
                {metadata && (
                  <button className="btn-secondary" onClick={downloadMetadata}>↓ Download .txt</button>
                )}
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="skeleton" style={{ height: 18, width: "65%" }} />
                  <div className="skeleton" style={{ height: 44, width: "100%" }} />
                  <div className="skeleton" style={{ height: 30, width: "85%" }} />
                </div>
              ) : metadata ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Title */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>TITLE</span>
                      <button className="copy-btn" onClick={() => copyText(metadata.title, "title")}>
                        {copied === "title" ? "✓ Copied!" : "Copy"}
                      </button>
                    </div>
                    <div style={{ fontSize: 14, color: "#e8e8f0", lineHeight: 1.5 }}>{metadata.title}</div>
                  </div>

                  {/* Description */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>DESCRIPTION</span>
                      <button className="copy-btn" onClick={() => copyText(metadata.description, "description")}>
                        {copied === "description" ? "✓ Copied!" : "Copy"}
                      </button>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{metadata.description}</div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                        KEYWORDS ({metadata.keywords.length})
                      </span>
                      <button className="copy-btn" onClick={() => copyText(metadata.keywords.join(", "), "keywords")}>
                        {copied === "keywords" ? "✓ Copied!" : "Copy All"}
                      </button>
                    </div>
                    <div>
                      {metadata.keywords.map((kw, i) => (
                        <span key={i} className="keyword-tag">{kw}</span>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{
                  textAlign: "center", padding: "30px 0",
                  color: "rgba(255,255,255,0.12)", fontSize: 14
                }}>
                  Title, description & keywords will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}























// "use client";

// import { useState } from "react";

// const CATEGORIES = [
//   { id: "business", label: "💼 Business" },
//   { id: "nature", label: "🌿 Nature" },
//   { id: "technology", label: "💻 Technology" },
//   { id: "people", label: "👥 People" },
//   { id: "food", label: "🍽️ Food" },
//   { id: "travel", label: "✈️ Travel" },
//   { id: "health", label: "❤️ Health" },
//   { id: "abstract", label: "🎨 Abstract" },
// ];

// const STYLES = [
//   "Photorealistic",
//   "Cinematic",
//   "Flat Design",
//   "Minimalist",
//   "Vibrant",
//   "Dark Moody",
// ];

// export default function Home() {
//   const [category, setCategory] = useState(null);
//   const [prompt, setPrompt] = useState("");
//   const [style, setStyle] = useState("Photorealistic");
//   const [imageUrl, setImageUrl] = useState(null);
//   const [metadata, setMetadata] = useState(null);
//   const [enhancedPrompt, setEnhancedPrompt] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [loadingStep, setLoadingStep] = useState("");
//   const [copied, setCopied] = useState("");
//   const [error, setError] = useState(null);

//   const generate = async () => {
//     if (!prompt.trim() && !category) {
//       setError("Please enter a description or select a category!");
//       return;
//     }
//     setError(null);
//     setImageUrl(null);
//     setMetadata(null);
//     setEnhancedPrompt("");
//     setLoading(true);
//     setLoadingStep("🧠 Enhancing your prompt with AI...");

//     try {
//       const res = await fetch("/api/generate-image", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           prompt: prompt || category,
//           category: category || "general",
//           style,
//         }),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         setError("Error: " + data.error);
//         setLoading(false);
//         setLoadingStep("");
//         return;
//       }

//       setEnhancedPrompt(data.enhancedPrompt);
//       setMetadata(data.metadata);
//       setLoadingStep("🎨 Generating image...");

//       // Now load the image
//       const img = new window.Image();
//       img.onload = () => {
//         setImageUrl(data.imageUrl);
//         setLoading(false);
//         setLoadingStep("");
//       };
//       img.onerror = () => {
//         // Try without model param as fallback
//         const fallbackUrl = data.imageUrl.replace("&model=flux", "");
//         const img2 = new window.Image();
//         img2.onload = () => {
//           setImageUrl(fallbackUrl);
//           setLoading(false);
//           setLoadingStep("");
//         };
//         img2.onerror = () => {
//           setError("Image load failed. Please try again.");
//           setLoading(false);
//           setLoadingStep("");
//         };
//         img2.src = fallbackUrl;
//       };
//       img.src = data.imageUrl;

//     } catch (err) {
//       setError("Network error: " + err.message);
//       setLoading(false);
//       setLoadingStep("");
//     }
//   };

//   const copyText = (text, key) => {
//     navigator.clipboard.writeText(text);
//     setCopied(key);
//     setTimeout(() => setCopied(""), 2000);
//   };

//   const downloadImage = async () => {
//     if (!imageUrl) return;
//     try {
//       const response = await fetch(imageUrl);
//       const blob = await response.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `stockgen-${Date.now()}.jpg`;
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch {
//       window.open(imageUrl, "_blank");
//     }
//   };

//   const downloadMetadata = () => {
//     if (!metadata) return;
//     const text = `TITLE:\n${metadata.title}\n\nDESCRIPTION:\n${metadata.description}\n\nKEYWORDS:\n${metadata.keywords.join(", ")}\n\nENHANCED PROMPT USED:\n${enhancedPrompt}`;
//     const blob = new Blob([text], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `metadata-${Date.now()}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div style={{ minHeight: "100vh", paddingBottom: 60 }}>
//       {/* Header */}
//       <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
//           <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>Stock<span className="gradient-text">Gen</span></span>
//         </div>
//         <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "6px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
//           AI-Enhanced Prompts • 100% Free
//         </div>
//       </header>

//       {/* Hero */}
//       <div style={{ textAlign: "center", padding: "48px 24px 32px" }}>
//         <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
//           Generate <span className="gradient-text">AI Stock Images</span><br />with Auto Metadata
//         </h1>
//         <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
//           AI enhances your prompt first, then generates a precise stock photo — ready for Shutterstock, Adobe Stock & more.
//         </p>
//       </div>

//       {/* Main Layout */}
//       <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>

//         {/* LEFT - Controls */}
//         <div className="card" style={{ padding: 24, height: "fit-content" }}>

//           <div style={{ marginBottom: 24 }}>
//             <div className="section-label">Category</div>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//               {CATEGORIES.map((cat) => (
//                 <button key={cat.id} className={`category-btn ${category === cat.id ? "active" : ""}`} onClick={() => setCategory(category === cat.id ? null : cat.id)}>
//                   {cat.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div style={{ marginBottom: 24 }}>
//             <div className="section-label">Image Description</div>
//             <textarea
//               className="input-field"
//               rows={4}
//               placeholder="e.g. Construction workers reviewing blueprints on a job site with steel framing in background..."
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) generate(); }}
//             />
//             <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Ctrl+Enter to generate</div>
//           </div>

//           <div style={{ marginBottom: 28 }}>
//             <div className="section-label">Visual Style</div>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//               {STYLES.map((s) => (
//                 <button key={s} className={`category-btn ${style === s ? "active" : ""}`} onClick={() => setStyle(s)}>{s}</button>
//               ))}
//             </div>
//           </div>

//           <button className="btn-primary" onClick={generate} disabled={loading}>
//             {loading ? (<><span className="spinner" />{loadingStep || "Generating..."}</>) : "✦ Generate Stock Image"}
//           </button>

//           {error && (
//             <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
//               {error}
//             </div>
//           )}

//           {/* Show enhanced prompt */}
//           {enhancedPrompt && !loading && (
//             <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10 }}>
//               <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 6, letterSpacing: "0.08em" }}>AI ENHANCED PROMPT</div>
//               <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{enhancedPrompt}</div>
//             </div>
//           )}
//         </div>

//         {/* RIGHT - Output */}
//         <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

//           {/* Image */}
//           <div className="card" style={{ padding: 20 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
//               <div className="section-label" style={{ marginBottom: 0 }}>Generated Image</div>
//               {imageUrl && (
//                 <div style={{ display: "flex", gap: 8 }}>
//                   <button className="btn-secondary" onClick={generate}>↻ Regenerate</button>
//                   <button className="btn-secondary" onClick={downloadImage}>↓ Download</button>
//                 </div>
//               )}
//             </div>
//             <div className="image-wrapper">
//               {loading && loadingStep.includes("image") ? (
//                 <div className="skeleton" style={{ width: "100%", height: "100%" }} />
//               ) : loading ? (
//                 <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", gap: 12 }}>
//                   <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
//                   <div style={{ fontSize: 13 }}>{loadingStep}</div>
//                 </div>
//               ) : imageUrl ? (
//                 <img src={imageUrl} alt="Generated stock image" />
//               ) : (
//                 <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.12)", gap: 12 }}>
//                   <div style={{ fontSize: 52 }}>🖼️</div>
//                   <div style={{ fontSize: 14 }}>Your image will appear here</div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Metadata */}
//           <div className="card" style={{ padding: 20 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//               <div className="section-label" style={{ marginBottom: 0 }}>SEO Metadata</div>
//               {metadata && <button className="btn-secondary" onClick={downloadMetadata}>↓ Download .txt</button>}
//             </div>

//             {loading ? (
//               <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                 <div className="skeleton" style={{ height: 18, width: "65%" }} />
//                 <div className="skeleton" style={{ height: 44, width: "100%" }} />
//                 <div className="skeleton" style={{ height: 30, width: "85%" }} />
//               </div>
//             ) : metadata ? (
//               <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//                 <div>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
//                     <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>TITLE</span>
//                     <button className="copy-btn" onClick={() => copyText(metadata.title, "title")}>{copied === "title" ? "✓ Copied!" : "Copy"}</button>
//                   </div>
//                   <div style={{ fontSize: 14, color: "#e8e8f0", lineHeight: 1.5 }}>{metadata.title}</div>
//                 </div>
//                 <div>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
//                     <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>DESCRIPTION</span>
//                     <button className="copy-btn" onClick={() => copyText(metadata.description, "description")}>{copied === "description" ? "✓ Copied!" : "Copy"}</button>
//                   </div>
//                   <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{metadata.description}</div>
//                 </div>
//                 <div>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
//                     <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>KEYWORDS ({metadata.keywords.length})</span>
//                     <button className="copy-btn" onClick={() => copyText(metadata.keywords.join(", "), "keywords")}>{copied === "keywords" ? "✓ Copied!" : "Copy All"}</button>
//                   </div>
//                   <div>{metadata.keywords.map((kw, i) => <span key={i} className="keyword-tag">{kw}</span>)}</div>
//                 </div>
//               </div>
//             ) : (
//               <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,0.12)", fontSize: 14 }}>
//                 Title, description & keywords will appear here
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
