import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BrainCircuit, Building2, ChevronRight, CircleCheck, Crosshair, Flag, Fingerprint, Globe as Globe2, Menu, Network, Play, Search, ShieldCheck, Terminal, Trophy, X } from 'lucide-react';

const heroImage = 'https://images.pexels.com/photos/5380603/pexels-photo-5380603.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const tracks = [
  { icon: Globe2, title: 'WEB', items: ['SQL Injection', 'XSS', 'Auth Bypass', 'LFI / RFI'], count: '12 LABS' },
  { icon: Terminal, title: 'SYSTÈME', items: ['Linux PrivEsc', 'Windows PrivEsc', 'Services', 'Kernel Exploits'], count: '09 LABS' },
  { icon: Network, title: 'RÉSEAU', items: ['Reconnaissance', 'Pivoting', 'Tunneling', 'Exploitation'], count: '08 LABS' },
  { icon: Building2, title: 'ACTIVE DIRECTORY', items: ['Kerberos', 'AD Attacks', 'GPO', 'PrivEsc AD'], count: '07 LABS' },
  { icon: Fingerprint, title: 'FORENSICS', items: ['Analyse mémoire', 'Disk Forensics', 'Logs', 'Malware Analysis'], count: '06 LABS' },
];

const steps = [
  { icon: Search, number: '01', title: 'CHOISIS', text: 'Choisis un lab adapté à ton niveau et à tes objectifs.' },
  { icon: Play, number: '02', title: 'DÉMARRE', text: 'Ton environnement personnel est provisionné automatiquement.' },
  { icon: Terminal, number: '03', title: 'EXPLOITE', text: 'Explore, attaque et trouve les vulnérabilités pour atteindre ton objectif.' },
  { icon: Flag, number: '04', title: 'TROUVE LE FLAG', text: 'Récupère le flag et valide ta solution pour réussir le challenge.' },
  { icon: Trophy, number: '05', title: 'PROGRESSE', text: 'Gagne des XP, débloque de nouveaux labs et monte en compétences.' },
];

const progress = [
  ['DÉBUTANT', 'Bases de la cybersécurité', '80%'],
  ['FONDAMENTAUX RÉSEAU', 'Réseaux et services', '60%'],
  ['WEB PENTESTING', 'Vulnérabilités web', '45%'],
  ['PRIVILÈGE ESCALATION', 'Élévation de privilèges', '30%'],
  ['ACTIVE DIRECTORY', 'Pentest d’infrastructure AD', '20%'],
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      <img src="/A4444D2A-50B8-4A12-8A67-E9218C774E67.PNG" alt="" aria-hidden="true" className="app-watermark" />
      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="TÀGGAT accueil">
          <img src="/2125FDD5-E2B2-40EB-A24A-352C069DF8F7.PNG" alt="Logo TÀGGAT" />
          <span><strong>TÀGGAT</strong><small>JÀNGÉ CI JËF</small></span>
        </Link>
        <button className="landing-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Ouvrir le menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`landing-nav ${menuOpen ? 'landing-nav-open' : ''}`}>
          <a href="#labs" onClick={() => setMenuOpen(false)}>Labs</a>
          <a href="#parcours" onClick={() => setMenuOpen(false)}>Parcours</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>Comment ça marche</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>À propos</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Tarifs</a>
          <Link to="/auth" className="landing-login" onClick={() => setMenuOpen(false)}>Se connecter</Link>
          <Link to="/auth" className="landing-cta" onClick={() => setMenuOpen(false)}>Commencer gratuitement <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="eyebrow">FORMATION CYBERSÉCURITÉ PRATIQUE</p>
            <h1>APPRENDS.<br />EXPLOITE.<br /><span>MAÎTRISE.</span></h1>
            <p className="landing-lead">Entraîne-toi sur des environnements vulnérables réalistes et développe les compétences nécessaires pour comprendre, exploiter et sécuriser les systèmes.</p>
            <div className="landing-actions">
              <Link to="/auth" className="landing-cta landing-cta-large">COMMENCER UN LAB <ArrowRight size={16} /></Link>
              <a href="#labs" className="landing-outline">EXPLORER LES LABS</a>
            </div>
            <div className="landing-trust-row">
              <div><ShieldCheck size={19} /><span><b>LABORATOIRES ACTIFS</b><small>Environnements réalistes</small></span></div>
              <div><Crosshair size={19} /><span><b>CHALLENGES PRATIQUES</b><small>Apprends en faisant</small></span></div>
              <div><Fingerprint size={19} /><span><b>ENVIRONNEMENTS ISOLÉS</b><small>Sécurisés et réinitialisables</small></span></div>
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="hero-image-frame"><img src={heroImage} alt="Environnement de travail cybersécurité" /></div>
            <div className="hero-scan-card">
              <div className="scan-card-header"><span>TARGET:</span><b>10.10.20.42</b><span className="scan-online">● ONLINE</span></div>
              <div className="scan-divider" />
              <p><span className="scan-green">$</span> nmap -sV target</p>
              <div className="scan-table"><span>PORT</span><span>STATE</span><span>SERVICE</span><span>VERSION</span><span>22/tcp</span><span>open</span><span>ssh</span><span>OpenSSH 8.2</span><span>80/tcp</span><span>open</span><span>http</span><span>Apache httpd</span><span>3306/tcp</span><span>open</span><span>mysql</span><span>MySQL 5.7</span></div>
              <p className="scan-green">EXPLOITATION...</p><div className="scan-progress"><i /></div><p className="scan-flag">FLAG{'{***************}'}</p>
            </div>
          </div>
        </section>

        <section className="landing-panel" id="about">
          <SectionTitle title="APPRENDRE EN PRATIQUANT" description="La cybersécurité ne s’apprend pas uniquement dans les livres. TÀGGAT te permet de passer directement de la théorie à la pratique." />
          <div className="practice-grid">
            <PracticeCard icon={Crosshair} title="EXPLOITER" text="Identifie et exploite des vulnérabilités dans des environnements réalistes." />
            <PracticeCard icon={BrainCircuit} title="COMPRENDRE" text="Analyse les mécanismes derrière les attaques et comprends pourquoi ils fonctionnent." />
            <PracticeCard icon={ShieldCheck} title="SÉCURISER" text="Apprends à corriger les vulnérabilités et à renforcer les systèmes contre les attaques." />
          </div>
        </section>

        <section className="landing-panel" id="labs">
          <SectionTitle title="DES LABS. DE VRAIS ENVIRONNEMENTS." description="De simples applications vulnérables aux environnements réseau complexes, TÀGGAT te permet de pratiquer sur différents niveaux de difficulté." />
          <div className="track-grid">{tracks.map((track) => <TrackCard key={track.title} {...track} />)}</div>
        </section>

        <section className="landing-panel" id="how">
          <SectionTitle title="COMMENT ÇA MARCHE ?" />
          <div className="steps-grid">{steps.map((step) => <div className="step-card" key={step.number}><div className="step-icon"><step.icon size={20} /></div><span className="step-number">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div>
        </section>

        <section className="split-panels" id="parcours">
          <div className="landing-panel progress-panel"><SectionTitle title="APPRENDS À TON RYTHME" /><div className="progress-list">{progress.map(([title, text, value]) => <div className="progress-row" key={title}><div><b>{title}</b><span>{text}</span></div><div className="progress-track-landing"><i style={{ width: value }} /></div><code>{value}</code></div>)}</div><Link to="/auth" className="landing-small-button">VOIR TOUS LES PARCOURS <ChevronRight size={14} /></Link></div>
          <div className="landing-panel community-panel"><SectionTitle title="COMMUNAUTÉ TÀGGAT" description="Apprends. Relève des défis. Progresse ensemble." /><div className="ranking-list"><Rank name="RootMax" xp="4 850 XP" rank="♛" /><Rank name="CyberNinja" xp="4 120 XP" rank="♕" /><Rank name="BlackHat" xp="3 980 XP" rank="♙" /><Rank name="GhostDrive" xp="3 450 XP" rank="4" /><Rank name="0xPENTEST" xp="3 220 XP" rank="5" /></div><Link to="/auth" className="landing-small-button">VOIR LE CLASSEMENT COMPLET <ChevronRight size={14} /></Link><div className="community-orbit"><Globe2 size={116} /></div></div>
        </section>

        <section className="landing-start-panel" id="pricing"><div><p className="eyebrow">TON PROCHAIN CHALLENGE T’ATTEND</p><h2>PRÊT À COMMENCER ?</h2><p>La meilleure façon d’apprendre la cybersécurité est de la pratiquer.<br />Rejoins TÀGGAT et lance ton premier lab dès maintenant.</p><Link to="/auth" className="landing-cta">COMMENCER GRATUITEMENT <ArrowRight size={15} /></Link></div><div className="start-visual"><img src={heroImage} alt="" /><div className="start-shield"><ShieldCheck size={58} /></div></div></section>
      </main>

      <footer className="landing-footer"><div className="landing-footer-brand"><Link to="/" className="landing-brand"><img src="/2125FDD5-E2B2-40EB-A24A-352C069DF8F7.PNG" alt="Logo TÀGGAT" /><span><strong>TÀGGAT</strong><small>JÀNGÉ CI JËF</small></span></Link><p>Plateforme de formation en cybersécurité<br />par la pratique.</p><small>© 2026 TÀGGAT. Tous droits réservés.</small></div><FooterColumn title="PLATEFORME" links={['Labs', 'Parcours', 'Classement', 'Tarifs']} /><FooterColumn title="RESSOURCES" links={['Documentation', 'Blog', 'FAQ', 'Guides']} /><FooterColumn title="LÉGAL" links={["Conditions d'utilisation", 'Politique de confidentialité', 'Mentions légales', 'Contact']} /><div><p className="footer-heading">SUIVEZ-NOUS</p><div className="footer-socials"><span>DC</span><span>𝕏</span><span>YT</span><span>GH</span></div></div></footer>
    </div>
  );
}

function SectionTitle({ title, description }: { title: string; description?: string }) { return <div className="section-title-landing"><h2>{title}</h2>{description && <p>{description}</p>}</div>; }
function PracticeCard({ icon: Icon, title, text }: { icon: typeof Crosshair; title: string; text: string }) { return <div className="practice-card"><Icon size={31} /><div><h3>{title}</h3><p>{text}</p><a href="#labs">En savoir plus <ArrowRight size={12} /></a></div></div>; }
function TrackCard({ icon: Icon, title, items, count }: { icon: typeof Globe2; title: string; items: string[]; count: string }) { return <div className="track-card"><Icon size={27} /><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><strong>{count}</strong></div>; }
function Rank({ name, xp, rank }: { name: string; xp: string; rank: string }) { return <div className="rank-row"><span className="rank-medal">{rank}</span><span>{name}</span><b>{xp}</b></div>; }
function FooterColumn({ title, links }: { title: string; links: string[] }) { return <div><p className="footer-heading">{title}</p><ul className="footer-links">{links.map((link) => <li key={link}><a href="#about">{link}</a></li>)}</ul></div>; }
