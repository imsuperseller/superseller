"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { renstoStyles, componentVariants } from '@/lib/rensto-styles';

interface FamilyResearchRequest {
  clientId: string;
  familyMemberIds: string;
  researchDepth: 'basic' | 'comprehensive' | 'deep';
}

interface FamilyProfile {
  id: string;
  clientId: string;
  familyName: string;
  status: 'pending' | 'researching' | 'completed' | 'error';
  createdAt: string;
  completedAt?: string;
  documentUrl?: string;
  leadId?: string;
}

export default function ShellyMakeComPortal() {
  const [researchRequest, setResearchRequest] = useState<FamilyResearchRequest>({
    clientId: '',
    familyMemberIds: '',
    researchDepth: 'comprehensive'
  });
  
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/shelly/makecom/trigger-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(researchRequest)
      });

      if (response.ok) {
        const result = await response.json();
        setProfiles(prev => [result.profile, ...prev]);
        setResearchRequest({ clientId: '', familyMemberIds: '', researchDepth: 'comprehensive' });
      }
    } catch (error) {
      console.error('Error triggering research:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      researching: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  return (
    <div className={`min-h-screen ${renstoStyles.bgPrimary} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className={`mb-8 p-6 rounded-lg ${renstoStyles.bgCard} border border-rensto-bg-secondary`}>
          <h1 className={`text-3xl font-bold ${renstoStyles.textPrimary} mb-2`}>
            Shelly Mizrahi - Make.com Family Research
          </h1>
          <p className={`text-lg ${renstoStyles.textSecondary}`}>
            Research family members and generate comprehensive insurance profiles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Research Request Form */}
          <Card className={`${componentVariants.card.default}`}>
            <CardHeader>
              <CardTitle className={`${renstoStyles.textPrimary}`}>
                New Family Research Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="clientId" className={`${renstoStyles.textPrimary}`}>
                    Client ID
                  </Label>
                  <Input
                    id="clientId"
                    value={researchRequest.clientId}
                    onChange={(e) => setResearchRequest(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="Enter client ID"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="familyMemberIds" className={`${renstoStyles.textPrimary}`}>
                    Family Member IDs
                  </Label>
                  <Textarea
                    id="familyMemberIds"
                    value={researchRequest.familyMemberIds}
                    onChange={(e) => setResearchRequest(prev => ({ ...prev, familyMemberIds: e.target.value }))}
                    placeholder="Enter family member IDs (comma-separated)"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="researchDepth" className={`${renstoStyles.textPrimary}`}>
                    Research Depth
                  </Label>
                  <select
                    id="researchDepth"
                    value={researchRequest.researchDepth}
                    onChange={(e) => setResearchRequest(prev => ({ ...prev, researchDepth: e.target.value as any }))}
                    className={`w-full p-2 rounded border ${renstoStyles.bgSecondary} ${renstoStyles.textPrimary}`}
                  >
                    <option value="basic">Basic</option>
                    <option value="comprehensive">Comprehensive</option>
                    <option value="deep">Deep Research</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${componentVariants.button.renstoPrimary} w-full`}
                >
                  {isSubmitting ? 'Processing...' : 'Start Family Research'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Profiles */}
          <Card className={`${componentVariants.card.default}`}>
            <CardHeader>
              <CardTitle className={`${renstoStyles.textPrimary}`}>
                Recent Family Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className={`p-4 rounded border ${renstoStyles.bgSecondary}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${renstoStyles.textPrimary}`}>
                        {profile.familyName}
                      </h3>
                      {getStatusBadge(profile.status)}
                    </div>
                    <p className={`text-sm ${renstoStyles.textSecondary} mb-2`}>
                      Client ID: {profile.clientId}
                    </p>
                    <p className={`text-sm ${renstoStyles.textSecondary} mb-2`}>
                      Created: {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                    {profile.documentUrl && (
                      <Button
                        onClick={() => window.open(profile.documentUrl, '_blank')}
                        className={`${componentVariants.button.renstoSecondary} text-sm`}
                      >
                        View Profile Document
                      </Button>
                    )}
                  </div>
                ))}
                {profiles.length === 0 && (
                  <p className={`text-center ${renstoStyles.textMuted}`}>
                    No profiles yet. Start your first family research!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}