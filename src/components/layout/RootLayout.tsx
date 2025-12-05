import { PropsWithChildren } from "react";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import { Header } from "../Header";
import { Footer } from "../Footer";

export const RootLayout = ({ children }: PropsWithChildren) => {
  const isNative = useIsNativeApp();

  if (isNative) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
