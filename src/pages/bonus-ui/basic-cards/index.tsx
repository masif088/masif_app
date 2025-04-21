import React from 'react'
import Breadcrumbs from '../../../../CommonElements/Breadcrumbs'
import { Container, Row } from 'reactstrap'
import DefaultBasic from '@/components_source/Bonus-Ui/BasicCards/DefaultBasic'
import FlatCard from '@/components_source/Bonus-Ui/BasicCards/FlatCard'
import WithoutShadow from '@/components_source/Bonus-Ui/BasicCards/WithoutShadow'
import Headicon from '@/components_source/Bonus-Ui/BasicCards/HeadIcon'
import DarkCard from '@/components_source/Bonus-Ui/BasicCards/DarkCard'
import InfoColorHead from '@/components_source/Bonus-Ui/BasicCards/InfoColorhead'
import InfoColorBody from '@/components_source/Bonus-Ui/BasicCards/InfoColorBody'
import InfoColorFooter from '@/components_source/Bonus-Ui/BasicCards/InfoColorFooter'

const BasicCards = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Basic Card' mainTitle='Basic Card' parent='Bonus-ui' />
            <Container fluid={true}>
                <Row>
                    <DefaultBasic />
                    <FlatCard />
                    <WithoutShadow />
                    <Headicon />
                    <DarkCard />
                    <InfoColorHead />
                    <InfoColorBody />
                    <InfoColorFooter />
                </Row>
            </Container>
        </div>
    )
}

export default BasicCards