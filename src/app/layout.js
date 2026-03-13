export const metadata = {
  title: 'civiq-crowd-app',
  description: 'Basic Next.js 14 app layout',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
