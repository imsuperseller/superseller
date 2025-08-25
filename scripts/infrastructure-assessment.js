#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class InfrastructureAssessment {
    constructor() {
        this.racknerdConfig = {
            host: '173.254.201.134',
            user: 'root',
            port: 22,
            password: '05ngBiq2pTA8XSF76x'
        };
        this.assessmentResults = {
            build: {},
            measure: {},
            analyze: {},
            deploy: {}
        };
    }

    async runFullAssessment() {
        console.log('🔧 Starting BMAD Infrastructure Assessment...\n');
        
        try {
            await this.buildPhase();
            await this.measurePhase();
            await this.analyzePhase();
            await this.deployPhase();
            
            this.generateReport();
        } catch (error) {
            console.error('❌ Assessment failed:', error);
        }
    }

    async buildPhase() {
        console.log('🏗️  BUILD PHASE: Infrastructure Inventory');
        
        // Get system information
        const systemInfo = await this.executeCommand('uname -a && cat /etc/os-release');
        this.assessmentResults.build.systemInfo = systemInfo;
        
        // Get running services
        const runningServices = await this.executeCommand('systemctl list-units --type=service --state=running --no-pager');
        this.assessmentResults.build.runningServices = runningServices;
        
        // Get port assignments
        const portAssignments = await this.executeCommand('netstat -tlnp | grep LISTEN');
        this.assessmentResults.build.portAssignments = portAssignments;
        
        // Get disk usage
        const diskUsage = await this.executeCommand('df -h');
        this.assessmentResults.build.diskUsage = diskUsage;
        
        // Get memory info
        const memoryInfo = await this.executeCommand('free -h && cat /proc/meminfo | head -10');
        this.assessmentResults.build.memoryInfo = memoryInfo;
        
        // Get CPU info
        const cpuInfo = await this.executeCommand('lscpu && nproc');
        this.assessmentResults.build.cpuInfo = cpuInfo;
        
        console.log('✅ Build phase completed');
    }

    async measurePhase() {
        console.log('\n📊 MEASURE PHASE: Performance Metrics');
        
        // Get current resource usage
        const resourceUsage = await this.executeCommand('top -bn1 | head -20');
        this.assessmentResults.measure.resourceUsage = resourceUsage;
        
        // Get process list with resource usage
        const processList = await this.executeCommand('ps aux --sort=-%cpu | head -20');
        this.assessmentResults.measure.processList = processList;
        
        // Get network connections
        const networkConnections = await this.executeCommand('ss -tuln');
        this.assessmentResults.measure.networkConnections = networkConnections;
        
        // Get database status (if PostgreSQL is running)
        const dbStatus = await this.executeCommand('systemctl status postgresql || echo "PostgreSQL not found"');
        this.assessmentResults.measure.dbStatus = dbStatus;
        
        // Get Redis status
        const redisStatus = await this.executeCommand('systemctl status redis || echo "Redis not found"');
        this.assessmentResults.measure.redisStatus = redisStatus;
        
        // Get Docker containers (if Docker is installed)
        const dockerContainers = await this.executeCommand('docker ps -a 2>/dev/null || echo "Docker not installed"');
        this.assessmentResults.measure.dockerContainers = dockerContainers;
        
        console.log('✅ Measure phase completed');
    }

    async analyzePhase() {
        console.log('\n🔍 ANALYZE PHASE: Capacity Planning');
        
        // Analyze port conflicts
        const portConflicts = this.analyzePortConflicts();
        this.assessmentResults.analyze.portConflicts = portConflicts;
        
        // Analyze resource bottlenecks
        const resourceBottlenecks = this.analyzeResourceBottlenecks();
        this.assessmentResults.analyze.resourceBottlenecks = resourceBottlenecks;
        
        // Analyze security vulnerabilities
        const securityVulnerabilities = await this.analyzeSecurityVulnerabilities();
        this.assessmentResults.analyze.securityVulnerabilities = securityVulnerabilities;
        
        // Analyze service redundancy
        const serviceRedundancy = this.analyzeServiceRedundancy();
        this.assessmentResults.analyze.serviceRedundancy = serviceRedundancy;
        
        // Calculate resource headroom
        const resourceHeadroom = this.calculateResourceHeadroom();
        this.assessmentResults.analyze.resourceHeadroom = resourceHeadroom;
        
        console.log('✅ Analyze phase completed');
    }

    async deployPhase() {
        console.log('\n🚀 DEPLOY PHASE: Optimization Recommendations');
        
        // Generate optimization recommendations
        const optimizationRecommendations = this.generateOptimizationRecommendations();
        this.assessmentResults.deploy.optimizationRecommendations = optimizationRecommendations;
        
        // Generate security recommendations
        const securityRecommendations = this.generateSecurityRecommendations();
        this.assessmentResults.deploy.securityRecommendations = securityRecommendations;
        
        // Generate backup recommendations
        const backupRecommendations = this.generateBackupRecommendations();
        this.assessmentResults.deploy.backupRecommendations = backupRecommendations;
        
        // Generate monitoring recommendations
        const monitoringRecommendations = this.generateMonitoringRecommendations();
        this.assessmentResults.deploy.monitoringRecommendations = monitoringRecommendations;
        
        console.log('✅ Deploy phase completed');
    }

    analyzePortConflicts() {
        const ports = this.assessmentResults.build.portAssignments;
        const portMap = {};
        const conflicts = [];
        
        // Parse port assignments
        const lines = ports.split('\n');
        lines.forEach(line => {
            const match = line.match(/:(\d+)/);
            if (match) {
                const port = match[1];
                if (portMap[port]) {
                    conflicts.push(`Port ${port} used by multiple services`);
                } else {
                    portMap[port] = line;
                }
            }
        });
        
        return {
            totalPorts: Object.keys(portMap).length,
            conflicts: conflicts,
            portMap: portMap
        };
    }

    analyzeResourceBottlenecks() {
        const resourceUsage = this.assessmentResults.measure.resourceUsage;
        const bottlenecks = [];
        
        // Analyze CPU usage
        const cpuMatch = resourceUsage.match(/Cpu\(s\):\s+(\d+\.\d+)%us/);
        if (cpuMatch && parseFloat(cpuMatch[1]) > 80) {
            bottlenecks.push(`High CPU usage: ${cpuMatch[1]}%`);
        }
        
        // Analyze memory usage
        const memoryInfo = this.assessmentResults.build.memoryInfo;
        const memMatch = memoryInfo.match(/Mem:\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/);
        if (memMatch) {
            const total = parseFloat(memMatch[1]);
            const used = parseFloat(memMatch[2]);
            const usagePercent = (used / total) * 100;
            if (usagePercent > 85) {
                bottlenecks.push(`High memory usage: ${usagePercent.toFixed(1)}%`);
            }
        }
        
        return bottlenecks;
    }

    async analyzeSecurityVulnerabilities() {
        const vulnerabilities = [];
        
        // Check for open ports
        const openPorts = await this.executeCommand('ss -tuln | grep LISTEN');
        const criticalPorts = ['22', '80', '443', '3306', '5432', '6379'];
        
        criticalPorts.forEach(port => {
            if (openPorts.includes(`:${port}`)) {
                vulnerabilities.push(`Port ${port} is open and accessible`);
            }
        });
        
        // Check firewall status
        const firewallStatus = await this.executeCommand('ufw status || iptables -L | head -10');
        if (!firewallStatus.includes('active') && !firewallStatus.includes('Chain INPUT')) {
            vulnerabilities.push('Firewall may not be properly configured');
        }
        
        return vulnerabilities;
    }

    analyzeServiceRedundancy() {
        const services = this.assessmentResults.build.runningServices;
        const redundancies = [];
        
        // Check for multiple web servers
        if (services.includes('nginx') && services.includes('apache')) {
            redundancies.push('Both nginx and apache are running - consider using only one');
        }
        
        // Check for multiple databases
        if (services.includes('postgresql') && services.includes('mysql')) {
            redundancies.push('Both PostgreSQL and MySQL are running - consider consolidation');
        }
        
        return redundancies;
    }

    calculateResourceHeadroom() {
        const cpuInfo = this.assessmentResults.build.cpuInfo;
        const memoryInfo = this.assessmentResults.build.memoryInfo;
        const diskUsage = this.assessmentResults.build.diskUsage;
        
        const headroom = {
            cpu: 'Unknown',
            memory: 'Unknown',
            disk: 'Unknown'
        };
        
        // Calculate CPU headroom
        const cpuMatch = cpuInfo.match(/CPU\(s\):\s+(\d+)/);
        if (cpuMatch) {
            const cpuCores = parseInt(cpuMatch[1]);
            headroom.cpu = `${cpuCores} cores available`;
        }
        
        // Calculate memory headroom
        const memMatch = memoryInfo.match(/Mem:\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/);
        if (memMatch) {
            const total = parseFloat(memMatch[1]);
            const used = parseFloat(memMatch[2]);
            const free = parseFloat(memMatch[3]);
            headroom.memory = `${free}GB free out of ${total}GB total`;
        }
        
        // Calculate disk headroom
        const diskLines = diskUsage.split('\n');
        diskLines.forEach(line => {
            if (line.includes('/dev/')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 5) {
                    const used = parts[4].replace('%', '');
                    const available = 100 - parseInt(used);
                    headroom.disk = `${available}% available`;
                }
            }
        });
        
        return headroom;
    }

    generateOptimizationRecommendations() {
        const recommendations = [];
        
        // Port optimization
        if (this.assessmentResults.analyze.portConflicts.conflicts.length > 0) {
            recommendations.push('Resolve port conflicts by reassigning conflicting services');
        }
        
        // Resource optimization
        if (this.assessmentResults.analyze.resourceBottlenecks.length > 0) {
            recommendations.push('Implement resource monitoring and auto-scaling');
            recommendations.push('Consider containerization for better resource isolation');
        }
        
        // Service optimization
        if (this.assessmentResults.analyze.serviceRedundancy.length > 0) {
            recommendations.push('Consolidate redundant services to reduce resource usage');
        }
        
        return recommendations;
    }

    generateSecurityRecommendations() {
        const recommendations = [];
        
        if (this.assessmentResults.analyze.securityVulnerabilities.length > 0) {
            recommendations.push('Implement comprehensive firewall rules');
            recommendations.push('Set up intrusion detection and prevention systems');
            recommendations.push('Configure automated security updates');
            recommendations.push('Implement comprehensive logging and monitoring');
        }
        
        return recommendations;
    }

    generateBackupRecommendations() {
        return [
            'Implement automated daily backups',
            'Set up off-site backup storage',
            'Configure backup verification and testing',
            'Document disaster recovery procedures',
            'Set up backup monitoring and alerting'
        ];
    }

    generateMonitoringRecommendations() {
        return [
            'Implement comprehensive system monitoring (CPU, memory, disk, network)',
            'Set up application performance monitoring',
            'Configure automated alerting for critical thresholds',
            'Implement log aggregation and analysis',
            'Set up dashboard for real-time system status'
        ];
    }

    generateReport() {
        console.log('\n📋 INFRASTRUCTURE ASSESSMENT REPORT');
        console.log('=====================================\n');
        
        // System Overview
        console.log('🏗️  SYSTEM OVERVIEW:');
        console.log(this.assessmentResults.build.systemInfo);
        
        // Resource Usage
        console.log('\n📊 RESOURCE USAGE:');
        console.log(this.assessmentResults.measure.resourceUsage);
        
        // Port Analysis
        console.log('\n🔌 PORT ANALYSIS:');
        const portAnalysis = this.assessmentResults.analyze.portConflicts;
        console.log(`Total active ports: ${portAnalysis.totalPorts}`);
        if (portAnalysis.conflicts.length > 0) {
            console.log('⚠️  Port conflicts detected:');
            portAnalysis.conflicts.forEach(conflict => console.log(`  - ${conflict}`));
        }
        
        // Resource Headroom
        console.log('\n💾 RESOURCE HEADROOM:');
        const headroom = this.assessmentResults.analyze.resourceHeadroom;
        console.log(`CPU: ${headroom.cpu}`);
        console.log(`Memory: ${headroom.memory}`);
        console.log(`Disk: ${headroom.disk}`);
        
        // Issues Found
        console.log('\n⚠️  ISSUES FOUND:');
        const bottlenecks = this.assessmentResults.analyze.resourceBottlenecks;
        const vulnerabilities = this.assessmentResults.analyze.securityVulnerabilities;
        const redundancies = this.assessmentResults.analyze.serviceRedundancy;
        
        if (bottlenecks.length > 0) {
            console.log('Resource Bottlenecks:');
            bottlenecks.forEach(bottleneck => console.log(`  - ${bottleneck}`));
        }
        
        if (vulnerabilities.length > 0) {
            console.log('Security Vulnerabilities:');
            vulnerabilities.forEach(vulnerability => console.log(`  - ${vulnerability}`));
        }
        
        if (redundancies.length > 0) {
            console.log('Service Redundancies:');
            redundancies.forEach(redundancy => console.log(`  - ${redundancy}`));
        }
        
        // Recommendations
        console.log('\n🚀 OPTIMIZATION RECOMMENDATIONS:');
        const optimizations = this.assessmentResults.deploy.optimizationRecommendations;
        const security = this.assessmentResults.deploy.securityRecommendations;
        const backup = this.assessmentResults.deploy.backupRecommendations;
        const monitoring = this.assessmentResults.deploy.monitoringRecommendations;
        
        console.log('Resource Optimization:');
        optimizations.forEach(rec => console.log(`  - ${rec}`));
        
        console.log('\nSecurity Hardening:');
        security.forEach(rec => console.log(`  - ${rec}`));
        
        console.log('\nBackup & Recovery:');
        backup.forEach(rec => console.log(`  - ${rec}`));
        
        console.log('\nMonitoring & Alerting:');
        monitoring.forEach(rec => console.log(`  - ${rec}`));
        
        // Save report to file
        const reportPath = path.join(__dirname, '../docs/infrastructure-assessment-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.assessmentResults, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }

    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            const sshCommand = `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "${command}"`;
            
            exec(sshCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log(`⚠️  Command failed: ${command}`);
                    resolve(`Error: ${error.message}`);
                } else {
                    resolve(stdout || stderr || 'No output');
                }
            });
        });
    }
}

// Run the assessment
const assessment = new InfrastructureAssessment();
assessment.runFullAssessment();
