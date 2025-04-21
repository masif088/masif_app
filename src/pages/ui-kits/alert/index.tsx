import AdditionalAlert from '@/components_source/Ui-kits/Alert/AdditionalAlert'
import AlertWithIcon from '@/components_source/Ui-kits/Alert/AlertWithIcon'
import DarkAlert from '@/components_source/Ui-kits/Alert/DarkAlert'
import DismissingLight from '@/components_source/Ui-kits/Alert/DismissingLight'
import LeftBorderAlert from '@/components_source/Ui-kits/Alert/LeftBorderAlert'
import LightColorAlert from '@/components_source/Ui-kits/Alert/LightColorAlert'
import LinkColor from '@/components_source/Ui-kits/Alert/LinkColor'
import LiveAlert from '@/components_source/Ui-kits/Alert/LiveAlert'
import OutlineAlert from '@/components_source/Ui-kits/Alert/OutlineAlert'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'

const Alert = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Alert' mainTitle='Alert' parent='Ui Kits' />
            <Container fluid={true}>
                <Row>
                    <LinkColor />
                    <LightColorAlert />
                    <OutlineAlert />
                    <AlertWithIcon />
                    <DarkAlert />
                    <DismissingLight />
                    <LiveAlert />
                    <LeftBorderAlert />
                    <AdditionalAlert />
                </Row>
            </Container>
        </div>
    )
}

export default Alert