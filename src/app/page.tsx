import { Hero } from "@/components/Hero/Hero";
import { AboutSection } from "@/components/Sections/AboutSection";
import { ContactSection } from "@/components/Sections/ContactSection";
import { WorkSection } from "@/components/Sections/WorkSection";
import { navigation } from "@/content/site";

// Section headings use the same words as the header links.
const label = (id: string) => navigation.find((item) => item.id === id)?.label ?? id;

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection title={label("about")} />
      <WorkSection title={label("work")} />
      <ContactSection title={label("contact")} />
    </>
  );
}
