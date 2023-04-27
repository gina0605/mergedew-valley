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
  </main>
);

export default Home;
