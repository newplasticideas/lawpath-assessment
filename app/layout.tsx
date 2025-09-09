import "../src/app/globals.css";
import ApolloClientProvider from "../lib/apollo";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloClientProvider>{children}</ApolloClientProvider>
      </body>
    </html>
  );
}
