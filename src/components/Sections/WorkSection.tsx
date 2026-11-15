import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { Section } from "@/components/Section/Section";
import { projects, type Project } from "@/content/sections";

import styles from "./Sections.module.css";

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={styles.card}>
      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardText}>{project.what}</p>
      <p className={styles.cardText}>{project.why}</p>
      {project.stack && (
        <ul className={styles.stack} aria-label="Built with">
          {project.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      )}
      {project.link && (
        <a className={styles.cardLink} href={project.link.href}>
          {project.link.label}
          {/* The accessible name starts with the visible text, then names the project. */}
          <span className="visually-hidden">: {project.title}</span>
        </a>
      )}
    </article>
  );
}

export function WorkSection({ title }: { title: string }) {
  return (
    <Section id="work">
      <div className={styles.workHead}>
        <h2 className={styles.title}>{title}</h2>
        <MascotSlot name="work" layout="narrow" className={styles.slot} />
      </div>
      <div className={styles.rows}>
        {projects.map((project) => (
          <div key={project.id} className={styles.row}>
            <ProjectCard project={project} />
            <MascotSlot name={`work-${project.id}`} layout="wide" className={styles.slot} />
          </div>
        ))}
      </div>
    </Section>
  );
}
