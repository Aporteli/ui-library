import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { InstallBar } from "@/components/InstallBar";
import { ComponentGallery } from "@/components/ComponentGallery";
import { Principles } from "@/components/Principles";
import { CodeSample } from "@/components/CodeSample";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <InstallBar />
      <ComponentGallery />
      <Principles />
      <CodeSample />
      <Footer />
    </main>
  );
}
