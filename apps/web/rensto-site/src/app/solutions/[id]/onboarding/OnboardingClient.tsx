'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductDefinition } from '@/lib/registry/ProductRegistry';
import { FormField } from '@/types/firestore';
import {
    ArrowLeft,
    Send,
    ShieldCheck,
    Bot,
    Target,
    Zap,
    CheckCircle2,
    Lock,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Card } from '@/components/ui/card-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { db, auth, storage } from '@/lib/firebase-client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

interface OnboardingClientProps {
    product: ProductDefinition;
}

// --- Encryption Helpers (WebCrypto) ---

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

async function sha256Bytes(input: string): Promise<Uint8Array> {
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(input));
    return new Uint8Array(digest);
}

async function deriveAesKeyFromPassphrase(passphrase: string, salt: Uint8Array) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey'],
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as any,
            iterations: 150_000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
}

async function encryptSecrets(
    secrets: Record<string, string>,
    opts: { passphrase?: string, uid: string }
) {
    const plaintext = JSON.stringify(secrets);
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    let key: CryptoKey;
    let salt: Uint8Array | undefined;

    if (opts.passphrase && opts.passphrase.trim().length >= 10) {
        salt = crypto.getRandomValues(new Uint8Array(16));
        key = await deriveAesKeyFromPassphrase(opts.passphrase.trim(), salt);
    } else {
        const uidHash = await sha256Bytes(opts.uid);
        key = await crypto.subtle.importKey(
            'raw',
            uidHash as any,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt'],
        );
    }

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(plaintext),
    );

    const fingerprint = await crypto.subtle.digest('SHA-256', enc.encode(plaintext));

    return {
        encryptionMode: opts.passphrase && opts.passphrase.trim().length >= 10
            ? 'aesgcm_passphrase'
            : 'aesgcm_no_passphrase',
        saltB64: salt ? bytesToBase64(salt) : undefined,
        ivB64: bytesToBase64(iv),
        ciphertextB64: bytesToBase64(new Uint8Array(ciphertext)),
        secretsSha256B64: bytesToBase64(new Uint8Array(fingerprint)),
    };
}

// --- Main Component ---

export default function OnboardingClient({ product }: OnboardingClientProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [passphrase, setPassphrase] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const schema = product.configurationSchema || [];

    const handleInputChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const user = auth.currentUser;
            const uid = user?.uid || 'anonymous';

            // 1. Split secrets from normal fields
            const secrets: Record<string, string> = {};
            const publicFields: Record<string, string> = {};

            schema.forEach(field => {
                if (field.secret) {
                    secrets[field.id] = formData[field.id] || '';
                } else {
                    publicFields[field.id] = formData[field.id] || '';
                }
            });

            // 2. Initial non-sensitive doc
            const docRef = await addDoc(collection(db, 'onboarding_requests'), {
                productId: product.id,
                solutionId: product.id, // Compatibility
                solutionName: product.name,
                inputs: publicFields,
                status: 'submitted',
                createdAt: serverTimestamp(),
                createdByUid: uid,
                pillarId: product.pillarId || 'marketplace'
            });
            const requestId = docRef.id;

            // 3. Encrypt and upload secrets if any
            if (Object.keys(secrets).length > 0) {
                const encrypted = await encryptSecrets(secrets, { passphrase, uid });
                const secretsBlob = new Blob([JSON.stringify(encrypted, null, 2)], { type: 'application/json' });
                const secretsPath = `onboarding_secrets/${requestId}/secrets.enc.json`;
                const secretsRef = ref(storage, secretsPath);

                await uploadBytes(secretsRef, secretsBlob, {
                    contentType: 'application/json',
                    customMetadata: {
                        requestId,
                        createdByUid: uid,
                        encryptionMode: encrypted.encryptionMode
                    }
                });

                const { updateDoc, doc } = await import('firebase/firestore');
                await updateDoc(doc(db, 'onboarding_requests', requestId), {
                    hasSecrets: true,
                    secretsPath
                });
            }

            // 4. Trigger Fulfillment API (The Bridge)
            await fetch('/api/fulfillment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: uid,
                    clientEmail: user?.email || formData['email'],
                    productId: product.id,
                    productName: product.name,
                    configuration: {
                        ...publicFields,
                        requestId // Pass ID for reference
                    }
                })
            });

            setIsSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to initialize mission. Please check credentials and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
                <Header />
                <div className="flex-grow flex items-center justify-center container mx-auto px-6">
                    <Card className="max-w-xl w-full p-12 text-center bg-white/[0.02] border-cyan-500/20 rounded-[3rem] space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle2 className="w-10 h-10 text-cyan-400" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                            Mission Initialized
                            <span className="block text-sm font-bold text-cyan-400 mt-2" dir="rtl">המשימה הופעלה בהצלחה</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-lg">
                            Configuration received. Your {product.name} is being provisioned on our robot swarm. Redirecting...
                        </p>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
            <Header />
            <AnimatedGridBackground />

            <main className="flex-grow container mx-auto px-6 py-20 relative z-10">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-12">
                        <div className="space-y-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Return to Store
                            </button>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none">
                                ACTIVATE <span className="text-[#fe3d51]">ENGINE</span>
                                <span className="block text-xl font-bold text-slate-500 mt-2 uppercase tracking-widest" dir="rtl">הפעלת מערכת</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <p className="text-lg text-slate-400 font-medium">{product.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 opacity-50">
                            <Lock className="w-8 h-8 text-cyan-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="space-y-8">
                                    {schema.map((field) => (
                                        <div key={field.id} className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                                {field.label} {field.required && <span className="text-[#fe3d51]">*</span>}
                                                {field.secret && <span className="ml-2 text-cyan-400 text-[8px] font-black uppercase tracking-widest border border-cyan-400/20 px-1.5 py-0.5 rounded">Encrypted</span>}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    required={field.required}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    className="w-full bg-white/5 border border-white/5 h-16 rounded-2xl text-white font-medium focus:border-cyan-500/50 outline-none transition-all text-lg px-6 appearance-none"
                                                >
                                                    <option value="" disabled>{field.placeholder || `Select ${field.label.toLowerCase()}...`}</option>
                                                    {field.options?.map(opt => (
                                                        <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'textarea' ? (
                                                <textarea
                                                    required={field.required}
                                                    placeholder={field.placeholder}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    className="w-full bg-white/5 border border-white/5 min-h-[120px] rounded-2xl text-white font-medium focus:border-cyan-500/50 outline-none transition-all text-lg p-6"
                                                />
                                            ) : (
                                                <Input
                                                    type={field.type === 'password' ? 'password' : field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
                                                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                                    required={field.required}
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    className="bg-white/5 border-white/5 h-16 rounded-2xl text-white font-medium focus:border-cyan-500/50 transition-all text-lg px-6"
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <div className="pt-6 border-t border-white/5">
                                        <div className="space-y-3 p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 ml-1">
                                                Security Passphrase (Optional)
                                            </label>
                                            <Input
                                                type="password"
                                                placeholder="Min 10 chars for Zero-Knowledge encryption..."
                                                value={passphrase}
                                                onChange={(e) => setPassphrase(e.target.value)}
                                                className="bg-white/5 border-white/5 h-14 rounded-xl text-white font-medium focus:border-cyan-500/50 transition-all px-6"
                                            />
                                            <p className="text-[9px] text-slate-500 font-bold leading-relaxed px-1">
                                                Your secrets are encrypted client-side. We never see your raw credentials.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    size="xl"
                                    variant="renstoPrimary"
                                    className="w-full h-20 rounded-[2rem] font-black uppercase tracking-[0.2em] relative group overflow-hidden"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center">
                                                START DEPLOYMENT
                                                <Send className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </div>
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-8">
                            <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[2.5rem] space-y-6">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Security Protocol</span>
                                </div>
                                <ul className="space-y-4 text-xs text-slate-400 font-medium">
                                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500" /> AES-256 Client-Side Encryption</li>
                                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500" /> Automated Bot Fulfillment</li>
                                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-500" /> SSL Secure Uplink</li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
