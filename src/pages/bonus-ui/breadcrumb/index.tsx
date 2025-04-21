import React from 'react'
import Breadcrumbs from '../../../../CommonElements/Breadcrumbs'
import { Container, Row } from 'reactstrap'
import DefaultBreadcrumb from '@/components_source/Bonus-Ui/BreadCrumb/DefaultBreadcrumb'
import DividerBread from '@/components_source/Bonus-Ui/BreadCrumb/DividerBread'
import Withicon from '@/components_source/Bonus-Ui/BreadCrumb/Withicon'
import Variation from '@/components_source/Bonus-Ui/BreadCrumb/Variation'
import ColoredBread from '@/components_source/Bonus-Ui/BreadCrumb/ColoredBread'

const Breadcrumb = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Breadcrumb' mainTitle='Breadcrumb' parent='Bonus Ui ' />
            <Container fluid={true}>
                <Row>
                    <DefaultBreadcrumb />
                    <DividerBread />
                    <Withicon />
                    <Variation />
                    <ColoredBread />
                </Row>
            </Container>
        </div>
    )
}

export default Breadcrumb
