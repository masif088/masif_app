import CommonCardHeading from "CommonElements/CommonCardHeading";
import Image from "next/image";
import { Card, Col, CardBody, Row, Label, Input, FormGroup, Button, } from "reactstrap";
import { AboutMe, Designer, EmailAddress, ImgPath, MarkJecno, MyProfile, Password, Save, Website, } from "utils/Constant";
import { useState, useRef } from "react";
import { ProfileData } from "utils/supabase/profileService";
import { useProfile } from "./ProfileProvider";

const EditMyProfile = () => {
  const { profile, loading, updateProfile, uploadImage } = useProfile();
  const [imageLoading, setImageLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImageLoading(true);
      await uploadImage(file);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData || Object.keys(formData).length === 0) return;

    try {
      await updateProfile(formData);
      setFormData({});
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading && !profile) {
    return (
      <Col xl={4}>
        <Card>
          <CommonCardHeading Heading={MyProfile} bigHeadingClassName="card-title mb-0" />
          <CardBody>
            <div className="text-center">Loading...</div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={4}>
      <Card>
        <CommonCardHeading Heading={MyProfile} bigHeadingClassName="card-title mb-0" />
        <CardBody>
          <form onSubmit={handleSubmit}>
            <Row className="mb-2">
              <div className="col-auto position-relative">
                <Image 
                  width={70} 
                  height={70} 
                  className="img-70 rounded-circle" 
                  alt="edit-user" 
                  src={profile?.avatar || `${ImgPath}/user/7.jpg`} 
                />
                <Button
                  color="primary"
                  size="sm"
                  className="position-absolute bottom-0 end-0 rounded-circle"
                  style={{ width: '24px', height: '24px', padding: 0 }}
                  onClick={triggerFileInput}
                  disabled={imageLoading}
                >
                  <i className="fa fa-camera" style={{ fontSize: '10px' }}></i>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <Col> 
                <h5 className="mb-1">{profile?.first_name || ""} {profile?.last_name || ""}</h5> 
                <p className="mb-4">{profile?.role || profile?.company || ""}</p>
              </Col>
            </Row>
            <FormGroup>
              <h6 className="form-label">{AboutMe}</h6>
              <textarea 
                rows={5} 
                className="form-control" 
                value={formData.about_me || profile?.about_me || ""}
                onChange={(e) => handleInputChange('about_me', e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </FormGroup>
            <FormGroup>
              <Label>{EmailAddress}</Label>
              <Input 
                type="email"
                placeholder="your-email@domain.com" 
                value={formData.email || profile?.email || ""}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Phone Number</Label>
              <Input 
                type="tel"
                placeholder="+1 (555) 123-4567" 
                value={formData.phone || profile?.phone || ""}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>{Password}</Label>
              <Input type="password" placeholder="Enter new password" />
            </FormGroup>
            <FormGroup>
              <Label>{Website}</Label>
              <Input 
                placeholder="http://yourwebsite.com" 
                value={formData.website || profile?.website || ""}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </FormGroup>
            <div className="form-footer">
              <Button 
                color="primary" 
                className="d-block w-100" 
                type="submit"
                disabled={loading || Object.keys(formData).length === 0}
              >
                {loading ? 'Saving...' : Save}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </Col>
  );
};

export default EditMyProfile;
