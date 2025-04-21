import AllCampaigns from '@/components_source/Dashboard/Social/AllCampaigns'
import FollowerFacebook from '@/components_source/Dashboard/Social/FollowerFacebook'
import ProfileAndMobile from '@/components_source/Dashboard/Social/ProfileAndMobile'
import SocialCards from '@/components_source/Dashboard/Social/SocialCards'
import Views from '@/components_source/Dashboard/Social/Views'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Col, Container, Row } from 'reactstrap'
import { Dashboard, Social_text } from 'utils/Constant'

const Social = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title={Social_text} mainTitle={Social_text} parent={Dashboard} />
            <Container fluid={true}>
                <Row>
                    <ProfileAndMobile />
                    <SocialCards />
                    <FollowerFacebook />
                    <Col xl={7}>
                        <AllCampaigns />
                    </Col>
                    <Col xl={5}>
                        <Views />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Social