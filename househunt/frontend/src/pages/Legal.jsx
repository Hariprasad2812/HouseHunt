import { Reveal } from '../components/ui';

const CONTENT = {
  privacy: {
    title: 'Privacy policy',
    updated: 'Last updated: September 2026',
    intro: 'HouseHunt (“we”) is a demonstration rental platform. This page explains in plain language what data the demo collects and how it is used.',
    sections: [
      ['What we collect', 'When you register we store your name, email, phone number, account type and profile details. Property listings store the information you provide plus the photos you upload. Messages, applications and visit requests are stored to provide the marketplace experience.'],
      ['How it is used', 'Your details are used to power authentication (JWT), to let owners respond to your applications and visit requests, and to personalise dashboards. We do not sell personal data.'],
      ['Storage & security', 'Passwords are hashed with bcrypt before storage. Tokens are signed and expire. In the dev environment, data lives in an in-memory database that resets on restart.'],
      ['Your choices', 'You can update your profile at any time, request account deletion (admins can delete accounts in the admin dashboard), and you may contact us to ask what we hold about you.'],
      ['Cookies', 'This demo uses localStorage to persist your session token and listing drafts. There are no third-party advertising cookies.'],
    ],
  },
  terms: {
    title: 'Terms of service',
    updated: 'Last updated: September 2026',
    intro: 'These terms govern your use of the HouseHunt demo platform. It is a product demonstration, not a licensed brokerage.',
    sections: [
      ['About this demo', 'HouseHunt is a demonstration of a rental property marketplace. Listings, owners and reviews shown are sample data. No real tenancy is created by using this platform.'],
      ['Using the service', 'You agree to provide accurate information, not to post fake listings or reviews, and not to attempt to access another user’s account.'],
      ['Listings', 'Owners are responsible for the accuracy of their listings and confirm they hold the right to rent the property. We verify documents on a best-effort basis.'],
      ['Deposits & payments', 'The demo processes no payments. Any rent or deposit figures are illustrative. In a real deployment, payment and agreement execution would happen between you and the owner.'],
      ['Liability', 'The platform is provided “as is” without warranty. To the maximum extent permitted by law, HouseHunt is not liable for disputes between tenants and owners.'],
      ['Contact', 'Questions about these terms can be sent to hello@househunt.in.'],
    ],
  },
};

export default function Legal({ kind }) {
  const c = CONTENT[kind] || CONTENT.privacy;
  return (
    <div className="bg-paper pt-[68px]">
      <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <Reveal>
          <p className="u-eyebrow mb-4">HouseHunt</p>
          <h1 className="u-serif text-4xl text-ink sm:text-5xl">{c.title}</h1>
          <p className="mt-2 text-[13px] uppercase tracking-wider text-stone-light">{c.updated}</p>
          <p className="mt-6 text-[15px] leading-relaxed text-coal">{c.intro}</p>
        </Reveal>
        <div className="mt-10 space-y-10">
          {c.sections.map(([h, b], i) => (
            <Reveal key={h} delay={Math.min(i * 0.05, 0.25)}>
              <h2 className="flex items-baseline gap-3 font-bold text-ink">
                <span className="u-serif text-clay">{String(i + 1).padStart(2, '0')}</span>{h}
              </h2>
              <p className="mt-3 border-l border-black/10 pl-6 text-[14.5px] leading-[1.8] text-stone">{b}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
