import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Discover from "../components/Discover"; // assuming you have this component

const DiscoverPage = () => {
  const canonical = "https://assessaai.com/discover";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "Discover | Assessa AI",
    "description": "Discover how Assessa AI transforms assessments with intelligent solutions."
  };

  return (
    <>
      <Helmet>
        <title>Discover | Assessa AI</title>
        <meta
          name="description"
          content="Discover how Assessa AI transforms assessments with intelligent solutions."
        />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />
      <main className="pt-20">
        <Discover />
      </main>
      <Footer />
    </>
  );
};

export default DiscoverPage;
