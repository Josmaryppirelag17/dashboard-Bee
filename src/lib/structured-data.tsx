/** Componente de datos estructurados JSON-LD para SEO. */

export function StructuredData() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BeeHive Dashboard",
    url: "https://beehive.app",
    logo: "https://beehive.app/logo.png",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BeeHive Dashboard",
    url: "https://beehive.app",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://beehive.app" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
