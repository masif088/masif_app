import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import { ProfileData } from 'utils/supabase/profileService';

// Extend ProfileData to include company_id
interface ExtendedProfileData extends Omit<ProfileData, 'company'> {
  company_id?: string;
}
import { createClient } from 'utils/supabase/client';
import { CompanyService } from 'utils/supabase/companyService';
import { Company } from 'Types/CompanyType';
import { toast } from 'react-toastify';
import SkillsInput from '../profile/EditProfile/SkillsInput';
import Image from 'next/image';

interface UserModalProps {
  isOpen: boolean;
  toggle: () => void;
  user: ProfileData | null;
  mode: 'create' | 'edit' | 'view';
  onSaved: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, toggle, user, mode, onSaved }) => {
  const [formData, setFormData] = useState<Partial<ExtendedProfileData>>({});
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const supabase = createClient();

  // Load companies when modal opens
  useEffect(() => {
    if (isOpen && mode !== 'view') {
      loadCompanies();
    }
  }, [isOpen, mode]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companiesData = await CompanyService.getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    if (user && mode !== 'create') {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        company_id: (user as any).company_id || '',
        role: user.role || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        country: user.country || '',
        about_me: user.about_me || '',
        website: user.website || '',
        skills: user.skills || '',
        avatar: user.avatar || ''
      });
      setImagePreview(user.avatar || '');
    } else {
      setFormData({});
      setImagePreview('');
    }
    setPassword('');
    setConfirmPassword('');
    setImageFile(null);
  }, [user, mode, isOpen]);

  const handleInputChange = (field: keyof ExtendedProfileData, value: string) => {
    if (mode === 'view') return; // Read-only in view mode
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'view') return;
    
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `masif_app/profile_path/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE || 'masif-app')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE || 'masif-app')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') return;

    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate password for new users
    if (mode === 'create' && (!password || password !== confirmPassword)) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      let avatarUrl = formData.avatar;
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        avatarUrl = uploadedUrl || formData.avatar;
      }

      const userData = {
        ...formData,
        avatar: avatarUrl
      };

      if (mode === 'create') {
        // Create user directly with Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email!,
          password: password,
          options: {
            data: {
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create profile record
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              ...userData,
              id: authData.user.id
            });

          if (profileError) throw profileError;
        }
      } else {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', user!.id);

        if (error) throw error;
      }

      onSaved();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {mode === 'create' ? 'Create New User' : 
         mode === 'edit' ? 'Edit User' : 'View User Details'}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <Row>
            {/* Profile Image */}
            <Col md={12} className="text-center mb-3">
              <div className="position-relative d-inline-block">
                {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile"
                  className="rounded-circle"
                  width="100"
                  height="100"
                  style={{ objectFit: 'cover' }}
                />
                ):(
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: '#f8f9fa',
                      border: '2px solid #dee2e6'
                    }}
                  >
                    <i className="fa fa-users" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                  </div>
                )}
                {!isReadOnly && (
                  <div className="position-absolute bottom-0 end-0">
                    <Label htmlFor="image-upload" className="btn btn-sm btn-primary rounded-circle mb-0" style={{ padding:'5px' }} >
                      <i className="fa fa-camera m-1"></i>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
            </Col>

            {/* Basic Information */}
            <Col md={6}>
              <FormGroup>
                <Label>First Name *</Label>
                <Input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Last Name *</Label>
                <Input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Username</Label>
                <Input
                  type="text"
                  value={formData.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={isReadOnly}
                />
              </FormGroup>
            </Col>

            {/* Password fields for new users */}
            {mode === 'create' && (
              <>
                <Col md={6}>
                  <FormGroup>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Confirm Password *</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
              </>
            )}

            {/* Professional Information */}
            <Col md={6}>
              <FormGroup>
                <Label>Company</Label>
                <Input
                  type="select"
                  value={formData.company_id || ''}
                  onChange={(e) => handleInputChange('company_id', e.target.value)}
                  disabled={isReadOnly || loadingCompanies}
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Input>
                {loadingCompanies && <small className="text-muted">Loading companies...</small>}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Role</Label>
                <Input
                  type="select"
                  value={formData.role || ''}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">Select Role</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Agent">Agent</option>
                  <option value="Customer">Customer</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isReadOnly}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Website</Label>
                <Input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={isReadOnly}
                />
              </FormGroup>
            </Col>

            {/* Address Information */}
            <Col md={12}>
              <FormGroup>
                <Label>Address</Label>
                <Input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={isReadOnly}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>City</Label>
                <Input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={isReadOnly}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Postal Code</Label>
                <Input
                  type="text"
                  value={formData.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  disabled={isReadOnly}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Country</Label>
                <Input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled={isReadOnly}
                />
              </FormGroup>
            </Col>

            {/* About Me */}
            <Col md={12}>
              <FormGroup>
                <Label>About Me</Label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.about_me || ''}
                  onChange={(e) => handleInputChange('about_me', e.target.value)}
                  disabled={isReadOnly}
                />
              </FormGroup>
            </Col>

            {/* Skills */}
            <Col md={12}>
              <SkillsInput
                value={formData.skills || ''}
                onChange={(value) => handleInputChange('skills', value)}
                placeholder="Enter user skills..."
                label="Skills"
              />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode !== 'view' && (
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Update User')}
            </Button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default UserModal; 