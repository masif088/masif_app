import { CardHeader, Col, CardBody, Row, FormGroup, Label, Input, CardFooter, Button } from 'reactstrap';
import { AboutMe, Address, City, Company, Country, EditProfile, EmailAddress, FirstName, LastName, PostalCode, Select, UpdateProfile, Username } from "utils/Constant"
import { useState, useEffect } from 'react';
import { ProfileData } from 'utils/supabase/profileService';
import { useProfile } from '../../../../components/profile/ProfileProvider';
import SkillsInput from './SkillsInput';

const EditProfileForm = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [countries, setCountries] = useState<{ id: number; name: string; code: string }[]>([]);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const countriesData = [
        { id: 1, name: 'Germany', code: 'DE' },
        { id: 2, name: 'Canada', code: 'CA' },
        { id: 3, name: 'United States', code: 'US' },
        { id: 4, name: 'Australia', code: 'AU' },
        { id: 5, name: 'United Kingdom', code: 'GB' },
        { id: 6, name: 'France', code: 'FR' },
        { id: 7, name: 'Japan', code: 'JP' },
        { id: 8, name: 'India', code: 'IN' }
      ];
      setCountries(countriesData);
    } catch (error) {
      console.error('Error loading countries:', error);
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

  if (loading && !profile) {
    return (
      <Col xl={8}>
        <div className="card">
          <CardHeader><h4 className="card-title mb-0">{EditProfile}</h4></CardHeader>
          <CardBody>
            <div className="text-center">Loading...</div>
          </CardBody>
        </div>
      </Col>
    );
  }

  return (
    <Col xl={8} >
      <form className="card" onSubmit={handleSubmit}>
        <CardHeader><h4 className="card-title mb-0">{EditProfile}</h4></CardHeader>
        <CardBody>
          <Row>
            <Col md={5}>
              <FormGroup>
                <Label >{Company}</Label>
                <Input 
                  type="text" 
                  placeholder="Company" 
                  value={formData.company || profile?.company || ""}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col sm={6} md={3} >
              <FormGroup>
                <Label>{Username}</Label>
                <Input 
                  type="text" 
                  placeholder="Username" 
                  value={formData.username || profile?.username || ""}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col sm={6} md={4} >
              <FormGroup>
                <Label >{EmailAddress}</Label>
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={formData.email || profile?.email || ""}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col sm={6} md={6} >
              <FormGroup>
                <Label >{FirstName}</Label>
                <Input 
                  type="text" 
                  placeholder="First Name" 
                  value={formData.first_name || profile?.first_name || ""}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col sm={6} md={6} >
              <FormGroup>
                <Label >{LastName}</Label>
                <Input 
                  type="text" 
                  placeholder="Last Name" 
                  value={formData.last_name || profile?.last_name || ""}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col sm={6} md={6} >
              <FormGroup>
                <Label >Phone Number</Label>
                <Input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={formData.phone || profile?.phone || ""}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col sm={6} md={6} >
              <FormGroup>
                <Label >Role</Label>
                <Input 
                  type="text" 
                  placeholder="Your Role" 
                  value={formData.role || profile?.role || ""}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label >{Address}</Label>
                <Input 
                  type="text" 
                  placeholder="Home Address" 
                  value={formData.address || profile?.address || ""}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col sm={6} md={4} >
              <FormGroup>
                <Label >{City}</Label>
                <Input 
                  type="text" 
                  placeholder="City" 
                  value={formData.city || profile?.city || ""}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col sm={6} md={3} >
              <FormGroup>
                <Label >{PostalCode}</Label>
                <Input 
                  type="number" 
                  placeholder="ZIP Code" 
                  value={formData.postal_code || profile?.postal_code || ""}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={5}>
              <FormGroup>
                <Label>{Country}</Label>

                <Input 
                  type="text" 
                  placeholder="Country" 
                  value={formData.country || profile?.country || ""}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />

                {/* <select 
                  className="form-control btn-square form-select"
                  value={formData.country || profile?.country || ""}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                >
                  <option value="">{Select}</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select> */}
              </FormGroup>
            </Col>
            <Col md={12}>
              <SkillsInput
                value={formData.skills || profile?.skills || ""}
                onChange={(value) => handleInputChange('skills', value)}
                placeholder="Enter your skills (e.g., React, TypeScript, Node.js)"
                label="Skills"
              />
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="text-end">
          <Button 
            color="primary" 
            type="submit"
            disabled={loading || Object.keys(formData).length === 0}
          >
            {loading ? 'Updating...' : UpdateProfile}
          </Button>
        </CardFooter>
      </form>
    </Col>
  )
}

export default EditProfileForm