import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Contact from "../components/Contact";
import PageLayout from "../components/Layout/PageLayout";

const ContactPage = () => {
  const canonical = "https://assessaai.com/contact";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "name": "Contact | Assessa AI",
    "description": "Get in touch with Assessa AI — contact us for demos, partnerships and support."
  };

  return (
    <PageLayout>
    <>
      <Helmet>
        <title>Contact | Assessa AI</title>
        <meta name="description" content="Get in touch with Assessa AI — contact us for demos, partnerships and support." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />
      <main className="pt-20">
        <Contact />
      </main>
      <Footer />
    </>
    </PageLayout>
  );
};

export default ContactPage;
