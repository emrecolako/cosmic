import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/index.md" },
  },
};

export default function HomePage() {
  return <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": "https://unifiedreading.com/#faq",
        mainEntity: [
          { "@type": "Question", name: "Can I see a reading before entering my details?", acceptedAnswer: { "@type": "Answer", text: "Yes. The fictional sample is public and free, and does not ask for birth information." } },
          { "@type": "Question", name: "What if I do not know my birth time?", acceptedAnswer: { "@type": "Answer", text: "You can still get a reading. The app omits Moon, rising, and house claims when the birth time is unknown." } },
          { "@type": "Question", name: "Is this a prediction?", acceptedAnswer: { "@type": "Answer", text: "No. The reading uses interpretive traditions as prompts for reflection; it is not a scientific assessment or a deterministic forecast." } },
        ],
      }).replace(/</g, "\\u003c") }}
    />
    <HomePageClient />
  </>;
}
