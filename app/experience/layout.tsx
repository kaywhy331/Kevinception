import { ExperienceShell } from '@/experience/ExperienceShell';
import { PersistentTimelineNav } from '@/experience/PersistentTimelineNav';

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return <ExperienceShell><PersistentTimelineNav />{children}</ExperienceShell>;
}
