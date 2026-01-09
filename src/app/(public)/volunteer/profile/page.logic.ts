import { useState, useEffect } from "react";
import { userApi, volunteerProfileApi, activityParticipationApi } from "@/lib/api";
import { signOut } from "next-auth/react";
import type {
  ActivityParticipationDto,
  UserProfileDto,
} from "@/core/application/dtos";

export interface ProfileStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface EditingField {
  field: string;
  value: any;
}

export function useProfilePage() {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [participations, setParticipations] = useState<
    ActivityParticipationDto[]
  >([]);
  const [stats, setStats] = useState<ProfileStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [userResponse, participationsResponse] = await Promise.all([
        userApi.getProfile(),
        activityParticipationApi.getMyRequests(),
      ]);

      if (!userResponse.success || !userResponse.user) {
        setError(userResponse.error || "فشل تحميل الملف الشخصي");
        return;
      }

      if (!participationsResponse.success) {
        setError(participationsResponse.error || "فشل تحميل الأنشطة");
        return;
      }

      const userData = userResponse.user;
      setUser(userData);

      // Get participations with full activity details
      const participationsData = participationsResponse.requests || [];
      setParticipations(participationsData);

      // Calculate stats from participations
      const total = participationsData.length;
      const pending = participationsData.filter(
        (p: any) => p.status === "PENDING"
      ).length;
      const approved = participationsData.filter(
        (p: any) => p.status === "APPROVED"
      ).length;
      const rejected = participationsData.filter(
        (p: any) => p.status === "REJECTED"
      ).length;
      setStats({ total, pending, approved, rejected });
    } catch (err) {
      setError("حدث خطأ غير متوقع");
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Start editing a field
  const startEditing = (field: string, currentValue: any) => {
    setEditingField({ field, value: currentValue });
    setError(null);
    setSuccessMessage(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
  };

  // Update field value
  const updateFieldValue = (value: any) => {
    if (editingField) {
      setEditingField({ ...editingField, value });
    }
  };

  // Save single field
  // Save single field
 // Save single field
const saveField = async () => {
  if (!editingField) return;

  setIsSaving(true);
  setError(null);
  setSuccessMessage(null);

  try {
    // Check if it's a user field or volunteer profile field
    const userFields = ['email', 'phone', 'fullName'];
    const isUserField = userFields.includes(editingField.field);

    let result: any; // ← حل الخطأ 1

    if (isUserField) {
      // Update user basic info (email, phone, fullName)
      const updateData: any = {
        [editingField.field]: editingField.value,
      };
      result = await userApi.updateBasicInfo(updateData);
    } else if (editingField.field === 'dateOfBirth') {
      // Update volunteer profile - date of birth
      result = await volunteerProfileApi.updateProfile({
        dateOfBirth: editingField.value, // ← حل الخطأ 2
      } as any);
    } else {
      // Update volunteer profile - other fields (city, gender, bio, skills, interests)
      const updateData: any = {
        [editingField.field]: editingField.value,
      };
      result = await volunteerProfileApi.updateProfile(updateData);
    }

    if (!result.success) {
      setError(result.error || "فشل حفظ التعديلات");
      return;
    }

    setSuccessMessage("تم الحفظ بنجاح ✓");
    setEditingField(null);
    await fetchData();

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  } catch (err) {
    setError("حدث خطأ أثناء الحفظ");
    console.error("Error saving field:", err);
  } finally {
    setIsSaving(false);
  }
};

  // Upload profile picture
  const handleProfilePictureUpload = async (file: File) => {
    setIsUploadingImage(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await volunteerProfileApi.uploadProfilePicture(file);

      if (!result.success) {
        setError(result.error || "فشل رفع الصورة");
        return;
      }

      setSuccessMessage("تم رفع الصورة بنجاح ✓");
      await fetchData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("حدث خطأ أثناء رفع الصورة");
      console.error("Error uploading picture:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Calculate age
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return {
    user,
    participations,
    stats,
    isLoading,
    error,
    successMessage,
    editingField,
    isSaving,
    isUploadingImage,
    startEditing,
    cancelEditing,
    updateFieldValue,
    saveField,
    handleProfilePictureUpload,
    handleSignOut,
    calculateAge,
  };
}
