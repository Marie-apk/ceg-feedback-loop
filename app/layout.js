export const metadata = {
  title: 'CEG Feedback Loop',
  description: 'Customer Feedback Insights for CEG',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
