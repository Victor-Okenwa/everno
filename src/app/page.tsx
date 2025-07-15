"use client";
import Link from "next/link";

// import { LatestPost } from "~/app/_components/post";
import { logoWhite } from "~/images";
// import { auth } from "~/server/auth";
// import { api, HydrateClient } from "~/trpc/server";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
export default function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const session = await auth();

  // if (session?.user) {
  //   void api.post.getLatest.prefetch();
  // }

  return (
    // <HydrateClient>
    <AnimatePresence>
      <main className="from-primary text-background to-foreground flex min-h-screen flex-col bg-gradient-to-b">
        <header className="w-full pt-5 pl-5">
          <Image src={logoWhite} className="h-20 w-40" alt="logo" />
        </header>

        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <motion.div
            initial={{ y: -60 }}
            whileInView={{ y: 0 }}
            exit={{ y: -60 }}
            transition={{
              duration: 0.2,
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
          >
            <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              Transform{" "}
              <span className="text-[hsl(280,100%,70%)]">Your Data</span> into
              Insights, Instantly
            </h1>
          </motion.div>

          <p className="text-secondary/70 max-w-3xl text-center">
            Transform your data into actionable insights instantly. Our
            intuitive system lets you effortlessly create stunning
            visualizations from CSV, JSON, or manually entered data. Gain clear
            insights and make informed decisions. Sign up or log in to visualize
            your data today!
          </p>
          <div className="flex flex-wrap gap-5">
            <motion.div
              initial={{ x: -100 }}
              whileInView={{ x: 0 }}
              exit={{ x: -100 }}
              transition={{
                duration: 0.2,
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
            >
              <Button variant={"outline"} className="rounded-full py-5">
                Documentation
              </Button>
            </motion.div>
            <motion.div
              initial={{ x: 100 }}
              whileInView={{ x: 0 }}
              exit={{ x: 100 }}
              transition={{
                duration: 0.2,
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
            >
              <Button asChild className="rounded-full py-5">
                <Link href={"/api/auth/signin"}>Get Access</Link>
              </Button>
            </motion.div>
          </div>
          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8"></div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div> */}

          {/* {session?.user && <LatestPost />} */}
        </div>
      </main>
    </AnimatePresence>
    // </HydrateClient>
  );
}
