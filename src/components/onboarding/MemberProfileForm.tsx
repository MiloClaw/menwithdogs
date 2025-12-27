import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InterestPicker from './InterestPicker';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Please enter your first name or nickname').max(50),
  city: z.string().min(1, 'Please enter your city or neighborhood').max(100),
  interests: z.array(z.string()).length(3, 'Please select exactly 3 interests'),
});

interface MemberProfileFormProps {
  initialData?: {
    first_name?: string | null;
    city?: string | null;
    interests?: string[] | null;
  };
  onSubmit: (data: { first_name: string; city: string; interests: string[] }) => Promise<void>;
  isSubmitting?: boolean;
}

const MemberProfileForm = ({ 
  initialData, 
  onSubmit, 
  isSubmitting = false 
}: MemberProfileFormProps) => {
  const [firstName, setFirstName] = useState(initialData?.first_name ?? '');
  const [city, setCity] = useState(initialData?.city ?? '');
  const [interests, setInterests] = useState<string[]>(initialData?.interests ?? []);
  const [errors, setErrors] = useState<{ first_name?: string; city?: string; interests?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      first_name: firstName.trim(),
      city: city.trim(),
      interests,
    };

    const result = profileSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      first_name: formData.first_name,
      city: formData.city,
      interests: formData.interests,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* First name */}
      <div className="space-y-2">
        <Label htmlFor="firstName">First name or nickname</Label>
        <Input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="How your partner knows you"
          className="h-12"
          maxLength={50}
        />
        {errors.first_name && (
          <p className="text-sm text-destructive">{errors.first_name}</p>
        )}
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">City or neighborhood</Label>
        <Input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Where you're based"
          className="h-12"
          maxLength={100}
        />
        {errors.city && (
          <p className="text-sm text-destructive">{errors.city}</p>
        )}
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <Label>Your interests</Label>
        <InterestPicker
          selected={interests}
          onChange={setInterests}
          min={3}
          max={3}
        />
        {errors.interests && (
          <p className="text-sm text-destructive">{errors.interests}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-12 text-base"
        disabled={isSubmitting || interests.length !== 3}
      >
        {isSubmitting ? 'Saving...' : 'Continue'}
      </Button>
    </form>
  );
};

export default MemberProfileForm;
