import type { Metadata } from "next";
import { Inter, Baloo_2 } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { zhCN } from "@clerk/localizations";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { AI } from '@/lib/action/ai';

const inter = Inter({ subsets: ["latin"] });
const baloo2 = Baloo_2({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "开口蛙 🐸 | Speakwow 梦想无限，开口实现",
  description: "English Learning App",
};

export default function RootLayout({
  children,
  sidebar
}: Readonly<{
  children: React.ReactNode;
  sidebar:React.ReactNode
}>) {
  return (
    <ClerkProvider localization={zhCN}>
      <html lang="zh-cn">
        <body className={baloo2.className}>
          {/* <header className="fixed p-6 bottom-0">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton/>
            </SignedIn>
          </header> */}
          <main>
          <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={20} className="border-r min-w-[150px]" collapsible={true}>
                {sidebar}
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={80}  >
              <AI>{children}</AI>
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
