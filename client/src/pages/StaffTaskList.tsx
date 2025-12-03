import { useAuth } from "@/hooks/useAuth";
import EnhancedStaffDashboard from "@/components/EnhancedStaffDashboard";
import { RoleBackButton } from "@/components/BackButton";

export default function StaffTaskList() {
  const { user } = useAuth();

  // Get staff department from user profile or default to housekeeping
  const staffDepartment = user?.department || 'housekeeping';
  const staffName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Staff Member';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <RoleBackButton />
      <EnhancedStaffDashboard 
        department={staffDepartment}
        staffName={staffName}
      />
    </div>
  );
}