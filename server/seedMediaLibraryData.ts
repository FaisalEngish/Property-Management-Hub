import { db } from './db';
import { 
  propertyMediaFiles, 
  mediaFolders, 
  agentMediaAccess,
  propertyFinanceSettings,
  mediaUsageAnalytics,
  aiMediaSuggestions,
  properties
} from '@shared/schema';
import { eq } from 'drizzle-orm';

const DEMO_ORG_ID = 'demo-org';

export async function seedMediaLibraryData() {
  console.log('Seeding media library data...');
  
  try {
    // Clear existing data
    await db.delete(aiMediaSuggestions).where(eq(aiMediaSuggestions.organizationId, DEMO_ORG_ID));
    await db.delete(mediaUsageAnalytics).where(eq(mediaUsageAnalytics.organizationId, DEMO_ORG_ID));
    await db.delete(agentMediaAccess).where(eq(agentMediaAccess.organizationId, DEMO_ORG_ID));
    await db.delete(propertyFinanceSettings).where(eq(propertyFinanceSettings.organizationId, DEMO_ORG_ID));
    await db.delete(mediaFolders).where(eq(mediaFolders.organizationId, DEMO_ORG_ID));
    await db.delete(propertyMediaFiles).where(eq(propertyMediaFiles.organizationId, DEMO_ORG_ID));

    // Get demo properties to associate media with
    const demoProperties = await db.select().from(properties).where(eq(properties.organizationId, DEMO_ORG_ID));
    
    if (demoProperties.length === 0) {
      console.log('No demo properties found. Skipping media library seeding.');
      return;
    }

    // Create demo media folders
    const demoFolders = [
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        folderName: 'Exterior Photos',
        folderDescription: 'High-quality exterior shots of the property',
        cloudFolderLink: 'https://drive.google.com/drive/folders/demo-exterior',
        cloudProvider: 'google_drive' as const,
        accessLevel: 'agent_approved' as const,
        isAgentApproved: true,
        sortOrder: 1,
        createdBy: '1',
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        folderName: 'Interior Rooms',
        folderDescription: 'Interior shots of all rooms and common areas',
        cloudFolderLink: 'https://drive.google.com/drive/folders/demo-interior',
        cloudProvider: 'google_drive' as const,
        accessLevel: 'agent_approved' as const,
        isAgentApproved: true,
        sortOrder: 2,
        createdBy: '1',
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[1]?.id || demoProperties[0].id,
        folderName: 'Marketing Materials',
        folderDescription: 'Brochures, floor plans, and marketing content',
        cloudFolderLink: 'https://drive.google.com/drive/folders/demo-marketing',
        cloudProvider: 'google_drive' as const,
        accessLevel: 'unbranded' as const,
        isAgentApproved: true,
        sortOrder: 1,
        createdBy: '1',
      }
    ];

    await db.insert(mediaFolders).values(demoFolders);
    console.log(`✅ Created ${demoFolders.length} demo media folders`);

    // Create demo media files
    const demoMediaFiles = [
      // Property 1 - Exterior Photos
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        fileName: 'Villa Sunset Exterior View',
        mediaType: 'photo' as const,
        description: 'Stunning sunset view of the villa exterior with pool area',
        cloudLink: 'https://drive.google.com/file/d/demo-villa-exterior-sunset/view',
        cloudProvider: 'google_drive' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
        accessLevel: 'agent_approved' as const,
        tags: ['exterior', 'sunset', 'pool', 'villa'],
        isAgentApproved: true,
        isUnbranded: false,
        uploadedBy: 1,
        approvedBy: 1,
        approvedAt: new Date(),
        fileSize: '2.4MB',
        resolution: '4K',
        capturedDate: new Date('2024-12-01'),
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        fileName: 'Villa Pool Area Drone Shot',
        mediaType: 'drone_footage' as const,
        description: 'Aerial drone footage showcasing the infinity pool and ocean view',
        cloudLink: 'https://drive.google.com/file/d/demo-villa-pool-drone/view',
        cloudProvider: 'google_drive' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
        accessLevel: 'agent_approved' as const,
        tags: ['drone', 'pool', 'aerial', 'ocean view'],
        isAgentApproved: true,
        isUnbranded: true,
        uploadedBy: 1,
        approvedBy: 1,
        approvedAt: new Date(),
        fileSize: '15.2MB',
        resolution: '4K',
        capturedDate: new Date('2024-12-02'),
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        fileName: 'Master Bedroom Interior',
        mediaType: 'photo' as const,
        description: 'Spacious master bedroom with ocean view and private balcony',
        cloudLink: 'https://drive.google.com/file/d/demo-master-bedroom/view',
        cloudProvider: 'google_drive' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        accessLevel: 'agent_approved' as const,
        tags: ['interior', 'bedroom', 'master', 'ocean view'],
        isAgentApproved: true,
        isUnbranded: false,
        uploadedBy: 1,
        approvedBy: 1,
        approvedAt: new Date(),
        fileSize: '3.1MB',
        resolution: '4K',
        capturedDate: new Date('2024-12-03'),
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        fileName: 'Villa Floor Plan',
        mediaType: 'floor_plan' as const,
        description: 'Detailed floor plan showing all rooms and dimensions',
        cloudLink: 'https://drive.google.com/file/d/demo-villa-floorplan/view',
        cloudProvider: 'google_drive' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
        accessLevel: 'unbranded' as const,
        tags: ['floor plan', 'layout', 'dimensions'],
        isAgentApproved: true,
        isUnbranded: true,
        uploadedBy: 1,
        approvedBy: 1,
        approvedAt: new Date(),
        fileSize: '890KB',
        resolution: 'Vector',
        capturedDate: new Date('2024-11-15'),
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        fileName: '360° Virtual Tour',
        mediaType: '360_tour' as const,
        description: 'Interactive 360-degree virtual tour of the entire property',
        cloudLink: 'https://virtualtour.example.com/villa-demo',
        cloudProvider: 'direct_url' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        accessLevel: 'agent_approved' as const,
        tags: ['360 tour', 'virtual', 'interactive'],
        isAgentApproved: true,
        isUnbranded: false,
        uploadedBy: 1,
        approvedBy: 1,
        approvedAt: new Date(),
        fileSize: 'N/A',
        resolution: '8K',
        capturedDate: new Date('2024-12-05'),
      },
      // Property 2 - If available
      ...(demoProperties[1] ? [{
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[1].id,
        fileName: 'Condo Living Area',
        mediaType: 'photo' as const,
        description: 'Modern living area with city skyline view',
        cloudLink: 'https://drive.google.com/file/d/demo-condo-living/view',
        cloudProvider: 'google_drive' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        accessLevel: 'private' as const,
        tags: ['interior', 'living room', 'modern', 'city view'],
        isAgentApproved: false,
        isUnbranded: false,
        uploadedBy: 2,
        fileSize: '2.8MB',
        resolution: '4K',
        capturedDate: new Date('2024-12-10'),
      }] : []),
      // Pending approval file
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        fileName: 'Kitchen Area - Needs Review',
        mediaType: 'photo' as const,
        description: 'Recently updated kitchen - pending approval for agent use',
        cloudLink: 'https://drive.google.com/file/d/demo-kitchen-pending/view',
        cloudProvider: 'google_drive' as const,
        thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        accessLevel: 'private' as const,
        tags: ['kitchen', 'interior', 'pending'],
        isAgentApproved: false,
        isUnbranded: false,
        uploadedBy: 1,
        fileSize: '2.2MB',
        resolution: '4K',
        capturedDate: new Date('2024-12-15'),
      }
    ];

    const insertedFiles = await db.insert(propertyMediaFiles).values(demoMediaFiles).returning();
    console.log(`✅ Created ${insertedFiles.length} demo media files`);

    // Create demo property media settings
    const mediaSettings = demoProperties.map(property => ({
      organizationId: DEMO_ORG_ID,
      propertyId: property.id,
      allowOwnerUploads: true,
      requireAdminApproval: true,
      maxFileSize: '50MB',
      allowedFormats: ['jpg', 'jpeg', 'png', 'mp4', 'pdf'],
      allowReferralAgentAccess: true,
      allowRetailAgentAccess: false,
      autoApproveUnbranded: false,
      enableAiSuggestions: true,
      autoDetectMissingMedia: true,
      autoFlagOutdated: true,
      notifyOnNewUploads: true,
      notifyOnAgentAccess: false,
      notifyOnExpiry: true,
    }));

    await db.insert(propertyFinanceSettings).values(mediaSettings);
    console.log(`✅ Created media settings for ${mediaSettings.length} properties`);

    // Create demo usage analytics for approved files
    const approvedFiles = insertedFiles.filter(file => file.isAgentApproved);
    const analyticsData = approvedFiles.map((file, index) => ({
      organizationId: DEMO_ORG_ID,
      propertyId: file.propertyId,
      mediaFileId: file.id,
      viewCount: Math.floor(Math.random() * 50) + 10,
      downloadCount: Math.floor(Math.random() * 20) + 5,
      shareCount: Math.floor(Math.random() * 10) + 1,
      weeklyViews: Math.floor(Math.random() * 15) + 5,
      monthlyViews: Math.floor(Math.random() * 40) + 15,
      popularityScore: Math.random() * 100,
      lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
    }));

    await db.insert(mediaUsageAnalytics).values(analyticsData);
    console.log(`✅ Created usage analytics for ${analyticsData.length} files`);

    // Create demo AI suggestions
    const aiSuggestionsData = [
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        suggestionType: 'missing_media' as const,
        suggestionText: 'Consider adding bathroom photos to complete the interior coverage',
        priority: 'medium' as const,
        confidenceScore: 0.85,
        detectedIssues: ['missing_bathroom_photos', 'incomplete_interior_coverage'],
        suggestedActions: ['upload_bathroom_photos', 'schedule_photo_session'],
        triggerSource: 'content_analysis',
        status: 'pending' as const,
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        suggestionType: 'quality_improvement' as const,
        suggestionText: 'Pool area photos could benefit from better lighting - suggest golden hour shots',
        priority: 'low' as const,
        confidenceScore: 0.72,
        detectedIssues: ['suboptimal_lighting', 'image_quality'],
        suggestedActions: ['reschedule_photo_session', 'improve_lighting'],
        triggerSource: 'image_analysis',
        status: 'pending' as const,
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: demoProperties[0].id,
        suggestionType: 'content_gap' as const,
        suggestionText: 'Missing drone footage of the surrounding area and beach access',
        priority: 'high' as const,
        confidenceScore: 0.91,
        detectedIssues: ['missing_drone_footage', 'no_area_overview'],
        suggestedActions: ['schedule_drone_session', 'capture_area_shots'],
        triggerSource: 'completeness_check',
        status: 'pending' as const,
      }
    ];

    await db.insert(aiMediaSuggestions).values(aiSuggestionsData);
    console.log(`✅ Created ${aiSuggestionsData.length} AI media suggestions`);

    // Create demo agent access logs
    const agentAccessData = [
      {
        organizationId: DEMO_ORG_ID,
        mediaFileId: insertedFiles[0].id,
        agentId: '5', // Referral agent
        accessType: 'download' as const,
        agentRole: 'referral-agent',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        accessReason: 'client_presentation',
        clientReference: 'CLIENT-2024-001',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        organizationId: DEMO_ORG_ID,
        mediaFileId: insertedFiles[1].id,
        agentId: '6', // Retail agent
        accessType: 'view' as const,
        agentRole: 'retail-agent',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        accessReason: 'listing_preparation',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        organizationId: DEMO_ORG_ID,
        mediaFileId: insertedFiles[2].id,
        agentId: '5', // Referral agent
        accessType: 'share' as const,
        agentRole: 'referral-agent',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        accessReason: 'social_media_post',
        clientReference: 'SOCIAL-POST-2024-12',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      }
    ];

    await db.insert(agentMediaAccess).values(agentAccessData);
    console.log(`✅ Created ${agentAccessData.length} agent access logs`);

    console.log('✅ Media library data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding media library data:', error);
    throw error;
  }
}