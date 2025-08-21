import React from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from '@/components/ui/table-enhanced';

export default function ShadcnRenstoShowcase() {
  return (
    <div className="min-h-screen bg-rensto-bg-primary p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-rensto-text-primary mb-4">
            🎨 Shadcn/UI + Rensto Design System
          </h1>
          <p className="text-xl text-rensto-text-secondary">
            Enhanced components with Rensto branding and animations
          </p>
        </div>

        {/* Button Showcase */}
        <section>
          <h2 className="text-2xl font-bold text-rensto-text-primary mb-6">Button Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="rensto">
              <CardHeader>
                <CardTitle>Default Variants</CardTitle>
                <CardDescription>Standard shadcn/ui buttons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </CardContent>
            </Card>

            <Card variant="renstoNeon">
              <CardHeader>
                <CardTitle>Rensto Primary</CardTitle>
                <CardDescription>Red to orange gradient with glow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="renstoPrimary">Primary</Button>
                <Button variant="renstoPrimary" size="sm">Small</Button>
                <Button variant="renstoPrimary" size="lg">Large</Button>
              </CardContent>
            </Card>

            <Card variant="renstoGradient">
              <CardHeader>
                <CardTitle>Rensto Secondary</CardTitle>
                <CardDescription>Blue to cyan gradient with glow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="renstoSecondary">Secondary</Button>
                <Button variant="renstoSecondary" size="sm">Small</Button>
                <Button variant="renstoSecondary" size="lg">Large</Button>
              </CardContent>
            </Card>

            <Card variant="renstoGlow">
              <CardHeader>
                <CardTitle>Special Effects</CardTitle>
                <CardDescription>Neon and ghost variants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="renstoNeon">Neon</Button>
                <Button variant="renstoGhost">Ghost</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Card Showcase */}
        <section>
          <h2 className="text-2xl font-bold text-rensto-text-primary mb-6">Card Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="rensto">
              <CardHeader>
                <CardTitle>Rensto Card</CardTitle>
                <CardDescription>Standard Rensto styling with glow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-rensto-text-secondary">
                  This card uses the default Rensto variant with subtle glow effects.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="renstoPrimary" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="renstoNeon">
              <CardHeader>
                <CardTitle>Neon Card</CardTitle>
                <CardDescription>Cyan border with neon glow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-rensto-text-secondary">
                  Neon variant with cyan border and accent glow effects.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="renstoNeon" size="sm">Neon Action</Button>
              </CardFooter>
            </Card>

            <Card variant="renstoGradient">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
                <CardDescription>Gradient background with glow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-rensto-text-secondary">
                  Gradient variant with beautiful background transitions.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="renstoSecondary" size="sm">Gradient Action</Button>
              </CardFooter>
            </Card>

            <Card variant="renstoGlow">
              <CardHeader>
                <CardTitle>Glow Card</CardTitle>
                <CardDescription>Pulsing glow animation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-rensto-text-secondary">
                  Glow variant with subtle pulsing animation effect.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="renstoGhost" size="sm">Glow Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Input Showcase */}
        <section>
          <h2 className="text-2xl font-bold text-rensto-text-primary mb-6">Input Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="rensto">
              <CardHeader>
                <CardTitle>Rensto Input</CardTitle>
                <CardDescription>Standard Rensto styling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input variant="rensto" placeholder="Enter your name..." />
                <Input variant="rensto" type="email" placeholder="Enter your email..." />
                <Input variant="rensto" type="password" placeholder="Enter your password..." />
              </CardContent>
            </Card>

            <Card variant="renstoNeon">
              <CardHeader>
                <CardTitle>Neon Input</CardTitle>
                <CardDescription>Cyan border with neon glow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input variant="renstoNeon" placeholder="Neon input..." />
                <Input variant="renstoNeon" type="email" placeholder="Neon email..." />
                <Input variant="renstoNeon" type="password" placeholder="Neon password..." />
              </CardContent>
            </Card>

            <Card variant="renstoGlow">
              <CardHeader>
                <CardTitle>Glow Input</CardTitle>
                <CardDescription>Blue border with glow effect</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input variant="renstoGlow" placeholder="Glow input..." />
                <Input variant="renstoGlow" type="email" placeholder="Glow email..." />
                <Input variant="renstoGlow" type="password" placeholder="Glow password..." />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Table Showcase */}
        <section>
          <h2 className="text-2xl font-bold text-rensto-text-primary mb-6">Table Components</h2>
          <Card variant="rensto">
            <CardHeader>
              <CardTitle>Rensto Table</CardTitle>
              <CardDescription>Data table with Rensto styling</CardDescription>
            </CardHeader>
            <CardContent>
              <Table variant="rensto">
                <TableCaption>A list of sample data with Rensto branding.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">John Doe</TableCell>
                    <TableCell>john@example.com</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="renstoPrimary" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Jane Smith</TableCell>
                    <TableCell>jane@example.com</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Pending
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="renstoSecondary" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bob Johnson</TableCell>
                    <TableCell>bob@example.com</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full style={{ backgroundColor: 'var(--rensto-bg-primary)' }} px-2.5 py-0.5 text-xs font-medium style={{ color: 'var(--rensto-red)' }}">
                        Inactive
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="renstoNeon" size="sm">Delete</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Integration Info */}
        <section>
          <Card variant="renstoGradient">
            <CardHeader>
              <CardTitle>🎯 Integration Success</CardTitle>
              <CardDescription>Shadcn/UI + Rensto Design System</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <h3 className="text-lg font-semibold text-rensto-text-primary">✅ Enhanced Components</h3>
                  <p className="text-rensto-text-secondary">Button, Card, Input, Table with Rensto variants</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-rensto-text-primary">🎨 Design System</h3>
                  <p className="text-rensto-text-secondary">Consistent branding with glow effects and animations</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-rensto-text-primary">⚡ Performance</h3>
                  <p className="text-rensto-text-secondary">Optimized components with TypeScript support</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="renstoPrimary" size="lg">
                🚀 Ready for Production
              </Button>
            </CardFooter>
          </Card>
        </section>

      </div>
    </div>
  );
}
