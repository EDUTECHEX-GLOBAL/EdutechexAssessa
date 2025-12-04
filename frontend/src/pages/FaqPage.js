import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Faq from "../components/Faq";
import PageLayout from "../components/Layout/PageLayout";

const FaqPage = () => {
  const canonical = "https://assessaai.com/faqs";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "FAQs | Assessa AI",
    "description": "Frequently asked questions about Assessa AI — product, pricing, and support."
  };

  return (
    <PageLayout>
    <>
      <Helmet>
        <title>FAQs | Assessa AI</title>
        <meta name="description" content="Frequently asked questions about Assessa AI — product, pricing, and support." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />
      <main className="pt-20">
        <Faq />
      </main>
      <Footer />
    </>
    </PageLayout>
  );
};

export default FaqPage;
