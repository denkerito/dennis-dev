import { Hero } from "@/components/Hero/Hero";
import { Section } from "@/components/Section/Section";
import { navigation } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      {navigation.map((item) => (
        <Section key={item.id} id={item.id} title={item.label} />
      ))}
    </>
  );
}
