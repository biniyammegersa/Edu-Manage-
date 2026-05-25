import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { useGetMyGroupQuery } from "@/features/groupApi/groupApi";

/**
 * Hook to check if a student has a valid group
 * Returns the group information and validation status
 * 
 * Validation checks:
 * 1. Student has group ID in profile
 * 2. Group data is successfully retrieved
 * 3. Group exists (not just ID, but actual group object)
 */
export function useStudentGroup() {
  const { data: currentUser, isLoading: isLoadingUser } = useGetUserQuery();
  const { data: groupResponse, isLoading: isLoadingGroup } = useGetMyGroupQuery();
  
  const group = groupResponse?.data;
  const hasGroupId = !!currentUser?.data?.group;
  const hasGroupData = !!group;

  const hasGroupBasics = !!(group?._id && group?.name);

  const hasMentor = !!group?.mentor;
  const hasGroupMembers = !!(group?.members && group.members.length > 0);

  // Use my-group API as source of truth (profile.group may be stale after creation)
  const isValid = hasGroupData && hasGroupBasics;
  
  const isLoading = isLoadingUser || isLoadingGroup;

  return {
    group,
    hasGroupId,
    hasGroupData,
    hasGroupBasics,
    hasGroupMembers,
    hasMentor,
    isValid,
    isLoading,
    error: !isValid && !isLoading ? {
      noGroupAssigned: !hasGroupId,
      groupDataMissing: !hasGroupData,
      groupBasicsMissing: !hasGroupBasics,
      noMentor: !hasMentor,
    } : null,
  };
}
