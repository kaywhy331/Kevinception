import { ExperienceShell } from '@/experience/ExperienceShell';

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return <ExperienceShell>{children}</ExperienceShell>;
}
