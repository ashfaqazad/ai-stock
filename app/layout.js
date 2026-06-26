import "./globals.css";

export const metadata = {
  title: "StockGen AI - Free Stock Image Generator",
  description: "Generate AI stock images with metadata for free",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
