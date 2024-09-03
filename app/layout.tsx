import type { Metadata } from "next";
import { Inter, Baloo_2 } from "next/font/google";
import "./globals.css";
import { ClerkProvider, OrganizationSwitcher, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { zhCN } from "@clerk/localizations";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { AI } from '@/lib/action/ai';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster"


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
  sidebar: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={zhCN}>
      <html lang="zh-cn">
        <body className={baloo2.className}>
          <header className="fixed p-6 bottom-0 sr-only">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          <main>
            <ResizablePanelGroup direction="horizontal" className="" >
              <ResizablePanel defaultSize={20} className="border-r h-screen min-w-[150px] max-lg:hidden" collapsible={true}>
                {sidebar}
              </ResizablePanel>
              <ResizableHandle withHandle className="max-lg:hidden" />
              <ResizablePanel defaultSize={80} className="h-screen flex flex-col">
                <div className="bg-muted-background p-2 flex sticky flex-row justify-between  lg:hidden items-center border-b">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 "
                      >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetTitle className="hidden"></SheetTitle>
                    <SheetDescription className="hidden"></SheetDescription>
                    <SheetContent side="left">
                      {sidebar}
                    </SheetContent>
                  </Sheet>
                  <Link href="/">
                    <div className="flex flex-row items-center gap-2">
                      <Avatar className="h-9 p-0.5">
                        <AvatarImage
                          src={`/logo.png`}
                          alt={'speakwow'}
                        />
                        <AvatarFallback>🐸</AvatarFallback>
                      </Avatar>
                      <span className="inline text-xl font-semibold">开口蛙</span>
                    </div>
                  </Link>
                  <div className="mt-1 px-1 flex flex-row gap-2 items-center">
                  <OrganizationSwitcher/>
                  

                  </div>
                </div>
                <div className="h-full">
                  <AI>{children}</AI>
                  
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
