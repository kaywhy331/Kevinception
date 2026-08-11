import { profile, site } from '@/content/data';
import { SiteChrome } from '@/components/SiteChrome';
import { ContactForm } from '@/components/ContactForm';

export const metadata = { title: 'Contact', description: 'Start a conversation with Kevin about a product, system, automation, AI workflow, or unconventional idea.' };

export default function ContactPage() {
  return (
    <SiteChrome>
      <section id="main-content" className="contact-page section-shell">
        <div className="contact-intro"><p className="eyebrow">Start a conversation</p><h1>Bring the difficult system, ambitious product, or unconventional idea.</h1><p className="lead">{site.primaryConversion}</p><div className="contact-principles">{profile.workingStyle.slice(0, 4).map((item) => <p key={item}>{item}</p>)}</div></div>
        <ContactForm email={profile.contactEmail} />
      </section>
    </SiteChrome>
  );
}
