import { profile, site } from '@/content/data';
import { SiteChrome } from '@/components/SiteChrome';
import { ContactForm } from '@/components/ContactForm';
import { CopyEmail } from '@/components/CopyEmail';
import { pageMetadata } from '@/lib/pageMetadata';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Email Kevin Yang about a product, system, automation, AI workflow, or unconventional idea.',
  path: '/contact/'
});

export default function ContactPage() {
  return (
    <SiteChrome>
      <section id="main-content" className="contact-page section-shell">
        <div className="contact-intro">
          <p className="eyebrow">Contact</p>
          <h1>Bring the difficult system, ambitious product, or unconventional idea.</h1>
          <p className="lead">{site.primaryConversion}</p>
          <div className="contact-direct" aria-label="Reach Kevin directly">
            <p className="contact-direct__label">The fastest way: email me.</p>
            <CopyEmail email={profile.contactEmail} />
            <ul className="contact-direct__links">
              {profile.publicLinks.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}
            </ul>
          </div>
        </div>
        <ContactForm email={profile.contactEmail} />
      </section>
    </SiteChrome>
  );
}
