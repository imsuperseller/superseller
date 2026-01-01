import { ContactPageContent } from '@/app/contact/page';

export const metadata = {
    title: 'צור קשר | Rensto',
    description: 'דבר עם אדריכלי האוטומציה שלנו. התחל לתכנן את מערכת ההפעלה העסקית שלך.',
};

export default function HebrewContactPage() {
    return <ContactPageContent lang="he" />;
}
