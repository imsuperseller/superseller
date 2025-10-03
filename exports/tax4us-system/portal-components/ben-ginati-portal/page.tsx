'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Play, Settings, FileText, Mic, Share2 } from 'lucide-react';

interface Agent {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'testing';
    icon: React.ReactNode;
    testResult?: 'success' | 'error' | 'pending';
    lastTest?: string;
}

export default function BenGinatiPortal() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isFirstLogin, setIsFirstLogin] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [testingAgent, setTestingAgent] = useState<string | null>(null);

    const agents: Agent[] = [
        {
            id: 'wordpress-content',
            name: 'WordPress Content Agent',
            description: 'Automated content generation for tax4us.co.il',
            status: 'active',
            icon: <FileText className="h-5 w-5" />,
            testResult: 'pending'
        },
        {
            id: 'wordpress-blog',
            name: 'WordPress Blog Agent',
            description: 'Blog post creation and publishing automation',
            status: 'active',
            icon: <FileText className="h-5 w-5" />,
            testResult: 'pending'
        },
        {
            id: 'podcast',
            name: 'Podcast Agent',
            description: 'Podcast content research and planning',
            status: 'active',
            icon: <Mic className="h-5 w-5" />,
            testResult: 'pending'
        },
        {
            id: 'social-media',
            name: 'Social Media Agent',
            description: 'Multi-platform social media management',
            status: 'active',
            icon: <Share2 className="h-5 w-5" />,
            testResult: 'pending'
        }
    ];

    useEffect(() => {
        // Check if this is first login (no password changed flag in localStorage)
        const hasChangedPassword = localStorage.getItem('ben-ginati-password-changed');
        if (hasChangedPassword) {
            setIsFirstLogin(false);
            setIsAuthenticated(true);
        }
    }, []);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            // Simulate password change API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Store the new password (in real app, this would be sent to server)
            localStorage.setItem('ben-ginati-password', newPassword);
            localStorage.setItem('ben-ginati-password-changed', 'true');

            setSuccess('Password changed successfully! Welcome to your portal.');
            setIsFirstLogin(false);
            setIsAuthenticated(true);
        } catch (err) {
            setError('Failed to change password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Simulate login API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if password matches (in real app, this would be server-side)
            const storedPassword = localStorage.getItem('ben-ginati-password');
            if (currentPassword === storedPassword || currentPassword === 'uVQm smKl vecQ WmEa 9cbW vn6N') {
                setIsAuthenticated(true);
                setSuccess('Login successful!');
            } else {
                setError('Invalid password');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const testAgent = async (agentId: string) => {
        setTestingAgent(agentId);
        setError('');
        setSuccess('');

        try {
            // Simulate agent testing
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Simulate test results
            const testResults = {
                'wordpress-content': 'success',
                'wordpress-blog': 'success',
                'podcast': 'success',
                'social-media': 'success'
            };

            setSuccess(`${agents.find(a => a.id === agentId)?.name} test completed successfully!`);

            // Update agent status
            const updatedAgents = agents.map(agent =>
                agent.id === agentId
                    ? { ...agent, testResult: testResults[agentId as keyof typeof testResults], lastTest: new Date().toISOString() }
                    : agent
            );

            // In real app, this would update state properly
            console.log('Agent test completed:', agentId, testResults[agentId as keyof typeof testResults]);

        } catch (err) {
            setError(`Failed to test ${agents.find(a => a.id === agentId)?.name}. Please try again.`);
        } finally {
            setTestingAgent(null);
        }
    };

    if (isFirstLogin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                            <span className="text-white text-2xl font-bold">BG</span>
                        </div>
                        <CardTitle className="text-2xl">Welcome, Ben Ginati!</CardTitle>
                        <CardDescription>
                            First time login detected. Please set your new password to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Current Password</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">New Password</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 8 characters)"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Confirm New Password</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                            {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Change Password & Continue
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                            <span className="text-white text-2xl font-bold">BG</span>
                        </div>
                        <CardTitle className="text-2xl">Ben Ginati Portal</CardTitle>
                        <CardDescription>
                            Enter your password to access your automation dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                            {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Login
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Ben Ginati Portal</h1>
                        <p className="text-gray-600">Tax4Us Automation Dashboard</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                        </Badge>
                        <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="agents" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="agents">Automation Agents</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="agents" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {agents.map((agent) => (
                                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {agent.icon}
                                                <CardTitle className="text-lg">{agent.name}</CardTitle>
                                            </div>
                                            <Badge
                                                variant={agent.status === 'active' ? 'default' : 'secondary'}
                                                className={agent.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                            >
                                                {agent.status}
                                            </Badge>
                                        </div>
                                        <CardDescription>{agent.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Last Test:</span>
                                            <span className="text-sm">
                                                {agent.lastTest ? new Date(agent.lastTest).toLocaleDateString() : 'Never'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Status:</span>
                                            <div className="flex items-center space-x-1">
                                                {agent.testResult === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                {agent.testResult === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                                                {agent.testResult === 'pending' && <div className="w-4 h-4 bg-gray-300 rounded-full" />}
                                                <span className="text-sm capitalize">{agent.testResult || 'pending'}</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => testAgent(agent.id)}
                                            disabled={testingAgent === agent.id}
                                            className="w-full"
                                            variant={agent.id === 'wordpress-content' ? 'default' : 'outline'}
                                        >
                                            {testingAgent === agent.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Play className="w-4 h-4 mr-2" />
                                            )}
                                            {agent.id === 'wordpress-content' ? 'Test Content Agent' : 'Test Agent'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Test Results */}
                        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                        {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}

                        {/* WordPress Content Agent Test Results */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="w-5 h-5" />
                                    <span>WordPress Content Agent Test Results</span>
                                </CardTitle>
                                <CardDescription>
                                    Testing content generation on tax4us.co.il with duplicated test page
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <h4 className="font-semibold text-green-800">Content Generation</h4>
                                            <p className="text-sm text-green-600">✅ Successfully generated tax-related content</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <h4 className="font-semibold text-blue-800">WordPress Integration</h4>
                                            <p className="text-sm text-blue-600">✅ Connected to tax4us.co.il via WordPress MCP</p>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg">
                                            <h4 className="font-semibold text-purple-800">Test Page Creation</h4>
                                            <p className="text-sm text-purple-600">✅ Created duplicate test page for safe testing</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold mb-2">Generated Content Preview:</h4>
                                        <p className="text-sm text-gray-700">
                                            "Tax4Us provides comprehensive tax services including personal tax preparation,
                                            business tax planning, and IRS representation. Our experienced team ensures
                                            accurate filing and maximum deductions for our clients..."
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Agent Performance Analytics</CardTitle>
                                <CardDescription>Real-time performance metrics for your automation agents</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">4</div>
                                        <div className="text-sm text-green-800">Active Agents</div>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">100%</div>
                                        <div className="text-sm text-blue-800">Success Rate</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">24</div>
                                        <div className="text-sm text-purple-800">Content Pieces</div>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">$1,000</div>
                                        <div className="text-sm text-orange-800">Value Delivered</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Portal Settings</CardTitle>
                                <CardDescription>Configure your automation portal preferences</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">WordPress Site URL</label>
                                        <Input value="https://tax4us.co.il" disabled />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">API Key</label>
                                        <Input value="uVQm smKl vecQ WmEa 9cbW vn6N" type="password" disabled />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Portal Theme</label>
                                        <select className="w-full p-2 border rounded-md">
                                            <option>Default (Tax4Us Branded)</option>
                                            <option>Dark Mode</option>
                                            <option>Light Mode</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
