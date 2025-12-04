import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pricing from "../components/Pricing";
import PageLayout from "../components/Layout/PageLayout";

const PricingPage = () => {
  const canonical = "https://assessaai.com/pricing";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "Pricing | Assessa AI",
    "description": "Assessa AI pricing plans — find the right plan for students, teachers and institutions."
  };

  return (
    <PageLayout>
    <>
      <Helmet>
        <title>Pricing | Assessa AI</title>
        <meta name="description" content="Assessa AI pricing plans — find the right plan for students, teachers and institutions." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />
      <main className="pt-20">
        <Pricing />
      </main>
      <Footer />
    </>
    </PageLayout>
  );
};

export default PricingPage;
