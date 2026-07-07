import type { Metadata } from "next";
import { ProjectsView } from "@/components/projects/ProjectsView";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Every project Vaishnav Infrastructure has put its name on — delivered, in build, and in design. Residential, commercial, healthcare, hospitality, and institutional work across Tamil Nadu, 2021 to today.",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
