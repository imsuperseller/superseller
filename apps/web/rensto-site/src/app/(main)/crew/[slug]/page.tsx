import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CREW_MEMBERS, getCrewMember } from '@/data/crew';
import { CrewMemberDetail } from '@/components/crew/CrewMemberDetail';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CREW_MEMBERS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = getCrewMember(slug);
  if (!member) return { title: 'Not Found' };

  return {
    title: `${member.name} — ${member.role} | Rensto`,
    description: member.description,
    openGraph: {
      title: `${member.name} — ${member.role} | Rensto`,
      description: member.description,
      url: `https://rensto.com/crew/${member.slug}`,
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: `${member.name} — ${member.role}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${member.name} — ${member.role} | Rensto`,
      description: member.description,
      images: ['/opengraph-image.png'],
    },
  };
}

export default async function CrewMemberPage({ params }: Props) {
  const { slug } = await params;
  const member = getCrewMember(slug);
  if (!member) notFound();

  return (
    <main
      className="min-h-screen py-24 px-4"
      style={{ background: 'var(--rensto-bg-primary)' }}
    >
      <div className="container mx-auto max-w-4xl">
        <CrewMemberDetail member={member} />
      </div>
    </main>
  );
}
