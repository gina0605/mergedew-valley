import Head from "next/head";
import { Body } from "@/components/Body";
import { Header } from "@/components/Header";

const Home = () => {
  const seoImg = "https://mergedew-valley.com/seo-img.png";

  return (
    <main className="w-full min-h-screen bg-white">
      <Head>
        <title>병합듀밸리</title>
        <meta property="og:image" content={seoImg} />
        <meta name="twitter:title" content="병합듀밸리" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={seoImg} />
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
};

export default Home;
