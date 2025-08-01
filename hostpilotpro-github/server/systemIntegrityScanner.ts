// System Integrity Scanner for HostPilotPro
// Analyzes application structure and identifies interface issues

import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

interface IntegrityIssue {
  id: string;
  dashboardRole: string;
  pageName: string;
  issueType: 'Broken Link' | 'Missing Field' | 'Empty Component' | 'No Back Button' | 'Unhandled Role Access' | 'Missing Logout' | 'Broken Form' | 'Undefined Component';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolutionSuggestion: string;
  status: 'open' | 'flagged_resolved' | 'sent_to_developer';
  notes?: string;
  detectedAt: string;
  componentPath?: string;
  expectedBehavior?: string;
}

interface IntegrityReport {
  scanId: string;
  scanTimestamp: string;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  dashboardCoverage: {
    role: string;
    pagesScanned: number;
    issuesFound: number;
  }[];
  issues: IntegrityIssue[];
}

interface DashboardConfig {
  role: string;
  pages: string[];
  requiredComponents: string[];
  expectedRoutes: string[];
  permissions: string[];
}

// Dashboard configurations for each role
const DASHBOARD_CONFIGS: DashboardConfig[] = [
  {
    role: 'Admin',
    pages: ['AdminDashboard', 'SystemIntegrityCheck', 'UserManagement', 'PropertyManagement', 'FinancialReports'],
    requiredComponents: ['Sidebar', 'Header', 'LogoutButton'],
    expectedRoutes: ['/admin', '/admin/users', '/admin/properties', '/admin/reports', '/admin/system-check'],
    permissions: ['all']
  },
  {
    role: 'Host',
    pages: ['HostDashboard', 'CheckInOut', 'GuestCommunication', 'PropertyStatus'],
    requiredComponents: ['Sidebar', 'Header', 'LogoutButton', 'BackButton'],
    expectedRoutes: ['/host', '/host/checkin', '/host/guests', '/host/properties'],
    permissions: ['property_management', 'guest_services']
  },
  {
    role: 'Housekeeping',
    pages: ['HousekeepingDashboard', 'TaskList', 'TaskCompletion', 'Schedule'],
    requiredComponents: ['Sidebar', 'Header', 'LogoutButton', 'TaskForm', 'ScheduleTab'],
    expectedRoutes: ['/housekeeping', '/housekeeping/tasks', '/housekeeping/schedule'],
    permissions: ['task_management', 'schedule_view']
  },
  {
    role: 'Pool',
    pages: ['PoolStaffDashboard', 'TaskList', 'MaintenanceLog', 'Schedule'],
    requiredComponents: ['Sidebar', 'Header', 'LogoutButton', 'TaskForm', 'ScheduleTab'],
    expectedRoutes: ['/pool', '/pool/tasks', '/pool/maintenance', '/pool/schedule'],
    permissions: ['task_management', 'maintenance_log']
  },
  {
    role: 'Retail Agent',
    pages: ['RetailAgentDashboard', 'BookingEngine', 'CommissionTracker', 'PropertyListings'],
    requiredComponents: ['Sidebar', 'Header', 'LogoutButton', 'BookingForm'],
    expectedRoutes: ['/retail-agent', '/retail-agent/booking', '/retail-agent/commission'],
    permissions: ['booking_management', 'commission_view']
  },
  {
    role: 'Referral Agent',
    pages: ['ReferralAgentDashboard', 'AssignedProperties', 'CommissionTracker', 'MarketingKit'],
    requiredComponents: ['Sidebar', 'Header', 'LogoutButton'],
    expectedRoutes: ['/referral-agent', '/referral-agent/properties', '/referral-agent/commission'],
    permissions: ['property_view', 'commission_view']
  },
  {
    role: 'Owner',
    pages: ['OwnerDashboard', 'PropertySettings', 'FinancialReports', 'MaintenanceRequests'],
    requiredComponents: ['Sidebar', 'Header', 'LogoutButton'],
    expectedRoutes: ['/owner', '/owner/properties', '/owner/finances', '/owner/maintenance'],
    permissions: ['property_view', 'financial_view', 'maintenance_request']
  },
  {
    role: 'Guest',
    pages: ['GuestDashboard', 'PropertyInfo', 'ServiceRequests', 'CheckoutSurvey'],
    requiredComponents: ['Header', 'LogoutButton'],
    expectedRoutes: ['/guest', '/guest/property', '/guest/services', '/guest/checkout'],
    permissions: ['guest_view', 'service_request']
  }
];

// Component patterns to check for issues
const COMPONENT_PATTERNS = {
  LOGOUT_BUTTON: /logout|signout|sign-out/i,
  BACK_BUTTON: /back|return|previous|arrow.*left/i,
  FORM_SUBMISSION: /onSubmit|handleSubmit|submit/i,
  NAVIGATION: /nav|menu|sidebar|header/i,
  LOADING_STATE: /loading|isLoading|spinner/i,
  ERROR_HANDLING: /error|catch|try/i,
  ROLE_CHECK: /role|permission|auth|isAuthenticated/i
};

export class SystemIntegrityScanner {
  private clientPath = './client/src';
  private issues: IntegrityIssue[] = [];
  private scanId: string;

  constructor() {
    this.scanId = `scan_${Date.now()}`;
  }

  async runFullScan(): Promise<IntegrityReport> {
    this.issues = [];
    const timestamp = new Date().toISOString();

    try {
      // Scan each dashboard configuration
      const dashboardCoverage = [];
      
      for (const config of DASHBOARD_CONFIGS) {
        const coverage = await this.scanDashboard(config);
        dashboardCoverage.push(coverage);
      }

      // Additional scans
      await this.scanRouteDefinitions();
      await this.scanSharedComponents();
      await this.scanApiIntegration();

      const report: IntegrityReport = {
        scanId: this.scanId,
        scanTimestamp: timestamp,
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.severity === 'critical').length,
        highIssues: this.issues.filter(i => i.severity === 'high').length,
        mediumIssues: this.issues.filter(i => i.severity === 'medium').length,
        lowIssues: this.issues.filter(i => i.severity === 'low').length,
        dashboardCoverage,
        issues: this.issues
      };

      return report;
    } catch (error) {
      console.error('Error running integrity scan:', error);
      throw new Error('Failed to complete system integrity scan');
    }
  }

  private async scanDashboard(config: DashboardConfig): Promise<{ role: string; pagesScanned: number; issuesFound: number }> {
    let pagesScanned = 0;
    const initialIssueCount = this.issues.length;

    for (const pageName of config.pages) {
      const pageContent = await this.getPageContent(pageName);
      if (pageContent) {
        pagesScanned++;
        await this.analyzePage(pageName, pageContent, config);
      } else {
        this.addIssue({
          dashboardRole: config.role,
          pageName,
          issueType: 'Undefined Component',
          severity: 'high',
          description: `Page component ${pageName} referenced but not found`,
          resolutionSuggestion: `Create ${pageName}.tsx in client/src/pages/ or update dashboard configuration`,
          componentPath: `client/src/pages/${pageName}.tsx`
        });
      }
    }

    return {
      role: config.role,
      pagesScanned,
      issuesFound: this.issues.length - initialIssueCount
    };
  }

  private async getPageContent(pageName: string): Promise<string | null> {
    const possiblePaths = [
      join(this.clientPath, 'pages', `${pageName}.tsx`),
      join(this.clientPath, 'components', `${pageName}.tsx`),
      join(this.clientPath, 'pages', pageName, 'index.tsx')
    ];

    for (const path of possiblePaths) {
      try {
        return readFileSync(path, 'utf-8');
      } catch {
        // File doesn't exist, try next path
      }
    }

    return null;
  }

  private async analyzePage(pageName: string, content: string, config: DashboardConfig) {
    // Check for required components
    for (const component of config.requiredComponents) {
      if (!this.hasComponent(content, component)) {
        this.addIssue({
          dashboardRole: config.role,
          pageName,
          issueType: component.includes('Button') ? 'No Back Button' : 'Empty Component',
          severity: component === 'LogoutButton' ? 'critical' : 'medium',
          description: `Missing required component: ${component}`,
          resolutionSuggestion: `Add ${component} component to ${pageName}`,
          componentPath: `client/src/pages/${pageName}.tsx`
        });
      }
    }

    // Check for logout functionality (critical for all authenticated pages)
    if (config.role !== 'Guest' && !COMPONENT_PATTERNS.LOGOUT_BUTTON.test(content)) {
      this.addIssue({
        dashboardRole: config.role,
        pageName,
        issueType: 'Missing Logout',
        severity: 'critical',
        description: 'No logout functionality found on authenticated page',
        resolutionSuggestion: 'Add logout button or menu item with proper authentication handling',
        expectedBehavior: 'Users should be able to logout from any authenticated page'
      });
    }

    // Check for back navigation (except main dashboards)
    if (!pageName.includes('Dashboard') && !COMPONENT_PATTERNS.BACK_BUTTON.test(content)) {
      this.addIssue({
        dashboardRole: config.role,
        pageName,
        issueType: 'No Back Button',
        severity: 'medium',
        description: 'No back navigation found on sub-page',
        resolutionSuggestion: 'Add back button or breadcrumb navigation',
        expectedBehavior: 'Users should be able to navigate back to parent page'
      });
    }

    // Check for form submissions
    if (this.hasFormElements(content) && !COMPONENT_PATTERNS.FORM_SUBMISSION.test(content)) {
      this.addIssue({
        dashboardRole: config.role,
        pageName,
        issueType: 'Broken Form',
        severity: 'high',
        description: 'Form elements found but no submission handler detected',
        resolutionSuggestion: 'Add form submission handler with proper validation',
        expectedBehavior: 'Forms should have working submission and validation'
      });
    }

    // Check for loading states
    if (this.hasAsyncOperations(content) && !COMPONENT_PATTERNS.LOADING_STATE.test(content)) {
      this.addIssue({
        dashboardRole: config.role,
        pageName,
        issueType: 'Missing Field',
        severity: 'low',
        description: 'Async operations found but no loading state handling',
        resolutionSuggestion: 'Add loading indicators for better user experience',
        expectedBehavior: 'Show loading state during data fetching'
      });
    }

    // Check for error handling
    if (this.hasAsyncOperations(content) && !COMPONENT_PATTERNS.ERROR_HANDLING.test(content)) {
      this.addIssue({
        dashboardRole: config.role,
        pageName,
        issueType: 'Missing Field',
        severity: 'medium',
        description: 'Async operations found but no error handling detected',
        resolutionSuggestion: 'Add try-catch blocks and error state handling',
        expectedBehavior: 'Handle and display errors gracefully'
      });
    }

    // Check for role-based access control
    if (!COMPONENT_PATTERNS.ROLE_CHECK.test(content) && config.role !== 'Guest') {
      this.addIssue({
        dashboardRole: config.role,
        pageName,
        issueType: 'Unhandled Role Access',
        severity: 'high',
        description: 'No role-based access control detected',
        resolutionSuggestion: 'Add role verification and access control logic',
        expectedBehavior: 'Restrict access based on user role and permissions'
      });
    }
  }

  private hasComponent(content: string, componentName: string): boolean {
    const patterns = [
      new RegExp(`import.*${componentName}.*from`, 'i'),
      new RegExp(`<${componentName}`, 'i'),
      new RegExp(`${componentName}\\s*=`, 'i')
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  private hasFormElements(content: string): boolean {
    return /form|input|textarea|select|button.*type.*submit/i.test(content);
  }

  private hasAsyncOperations(content: string): boolean {
    return /useQuery|useMutation|fetch|axios|async|await/i.test(content);
  }

  private async scanRouteDefinitions() {
    try {
      const appContent = readFileSync(join(this.clientPath, 'App.tsx'), 'utf-8');
      
      // Check for broken route patterns
      const routeMatches = appContent.match(/<Route.*path="([^"]+)"/g);
      if (routeMatches) {
        for (const routeMatch of routeMatches) {
          const pathMatch = routeMatch.match(/path="([^"]+)"/);
          if (pathMatch) {
            const path = pathMatch[1];
            
            // Check if route has corresponding component
            const componentMatch = routeMatch.match(/component=\{([^}]+)\}/);
            if (!componentMatch) {
              this.addIssue({
                dashboardRole: 'Admin',
                pageName: 'App Routing',
                issueType: 'Broken Link',
                severity: 'high',
                description: `Route ${path} has no component defined`,
                resolutionSuggestion: 'Add component prop to Route or use element prop',
                componentPath: 'client/src/App.tsx'
              });
            }
          }
        }
      }
    } catch (error) {
      this.addIssue({
        dashboardRole: 'Admin',
        pageName: 'App Configuration',
        issueType: 'Undefined Component',
        severity: 'critical',
        description: 'App.tsx file not found or not readable',
        resolutionSuggestion: 'Ensure App.tsx exists and is properly formatted',
        componentPath: 'client/src/App.tsx'
      });
    }
  }

  private async scanSharedComponents() {
    const componentsPath = join(this.clientPath, 'components');
    
    try {
      const files = readdirSync(componentsPath);
      
      for (const file of files) {
        if (file.endsWith('.tsx')) {
          const content = readFileSync(join(componentsPath, file), 'utf-8');
          
          // Check for empty components
          if (content.length < 100 || !content.includes('return')) {
            this.addIssue({
              dashboardRole: 'Admin',
              pageName: 'Shared Components',
              issueType: 'Empty Component',
              severity: 'medium',
              description: `Component ${file} appears to be empty or incomplete`,
              resolutionSuggestion: 'Implement component logic or remove if unused',
              componentPath: `client/src/components/${file}`
            });
          }
        }
      }
    } catch (error) {
      // Components directory might not exist
    }
  }

  private async scanApiIntegration() {
    // Check for common API integration issues
    const pagesPath = join(this.clientPath, 'pages');
    
    try {
      const files = this.getAllTsxFiles(pagesPath);
      
      for (const file of files) {
        const content = readFileSync(file, 'utf-8');
        
        // Check for hardcoded API URLs
        if (/https?:\/\/localhost|127\.0\.0\.1/.test(content)) {
          this.addIssue({
            dashboardRole: 'Admin',
            pageName: 'API Integration',
            issueType: 'Broken Link',
            severity: 'medium',
            description: 'Hardcoded localhost URLs found',
            resolutionSuggestion: 'Use environment variables or relative URLs',
            componentPath: file.replace(process.cwd(), '')
          });
        }

        // Check for missing error boundaries in API calls
        if (/useQuery|useMutation/.test(content) && !/onError|isError/.test(content)) {
          this.addIssue({
            dashboardRole: 'Admin',
            pageName: 'API Integration',
            issueType: 'Missing Field',
            severity: 'medium',
            description: 'API calls without error handling',
            resolutionSuggestion: 'Add error handling to API queries and mutations',
            componentPath: file.replace(process.cwd(), '')
          });
        }
      }
    } catch (error) {
      // Handle error
    }
  }

  private getAllTsxFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getAllTsxFiles(fullPath));
        } else if (item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }
    
    return files;
  }

  private addIssue(issue: Omit<IntegrityIssue, 'id' | 'status' | 'detectedAt'>) {
    this.issues.push({
      ...issue,
      id: `issue_${this.scanId}_${this.issues.length + 1}`,
      status: 'open',
      detectedAt: new Date().toISOString()
    });
  }
}

// In-memory storage for scan results and issue tracking
class IntegrityReportStorage {
  private reports: Map<string, IntegrityReport> = new Map();
  private issues: Map<string, IntegrityIssue> = new Map();

  saveReport(report: IntegrityReport): void {
    this.reports.set(report.scanId, report);
    
    // Update issues map
    report.issues.forEach(issue => {
      this.issues.set(issue.id, issue);
    });
  }

  getLatestReport(): IntegrityReport | undefined {
    const reports = Array.from(this.reports.values());
    return reports.sort((a, b) => 
      new Date(b.scanTimestamp).getTime() - new Date(a.scanTimestamp).getTime()
    )[0];
  }

  updateIssue(issueId: string, updates: Partial<IntegrityIssue>): IntegrityIssue | undefined {
    const issue = this.issues.get(issueId);
    if (issue) {
      const updatedIssue = { ...issue, ...updates };
      this.issues.set(issueId, updatedIssue);
      
      // Update in the report as well
      for (const report of this.reports.values()) {
        const issueIndex = report.issues.findIndex(i => i.id === issueId);
        if (issueIndex !== -1) {
          report.issues[issueIndex] = updatedIssue;
          break;
        }
      }
      
      return updatedIssue;
    }
    return undefined;
  }

  getIssue(issueId: string): IntegrityIssue | undefined {
    return this.issues.get(issueId);
  }
}

export const integrityStorage = new IntegrityReportStorage();