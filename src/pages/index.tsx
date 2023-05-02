import Head from "next/head";
import { Body } from "@/components/Body";
import { Header } from "@/components/Header";

const Home = () => (
  <main className="w-full min-h-screen bg-white">
    <Head>
      <title>병합듀밸리</title>
    </Head>
    <Header />
    <Body />
    <p className="w-full text-center text-xs text-slate-400 mb-2">
      mergedew-valley v1.0.0&nbsp;&nbsp;|&nbsp;&nbsp;
      <a
        href="https://github.com/gina0605/mergedew-valley"
        className="underline decoration-1"
      >
        Github
      </a>
    </p>
  </main>
);

export default Home;
