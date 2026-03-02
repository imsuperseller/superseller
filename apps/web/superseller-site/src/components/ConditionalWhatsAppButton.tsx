'use client';

import { usePathname } from '@/i18n/navigation';
import { WhatsAppButton } from './WhatsAppButton';

export function ConditionalWhatsAppButton() {
    const pathname = usePathname();
    if (pathname?.startsWith('/video')) return null;
    return <WhatsAppButton />;
}
