import BackgroundColor from '@/components_source/Ui-kits/HelperClasses/BackgroundColor'
import Border from '@/components_source/Ui-kits/HelperClasses/Border'
import BorderColorComponent from '@/components_source/Ui-kits/HelperClasses/BorderColorComponent'
import BorderStyle from '@/components_source/Ui-kits/HelperClasses/BorderStyle'
import FontSize from '@/components_source/Ui-kits/HelperClasses/FontSize'
import FontStyle from '@/components_source/Ui-kits/HelperClasses/FontStyle'
import FontWeight from '@/components_source/Ui-kits/HelperClasses/FontWeight'
import ImageSize from '@/components_source/Ui-kits/HelperClasses/ImageSize'
import TextColors from '@/components_source/Ui-kits/HelperClasses/TextColors'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'

const HelperClass = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Helper Classes' mainTitle='Helper Classes' parent='Ui Kits' />
            <Container fluid={true}>
                <Row>
                    <BorderStyle />
                    <Border />
                    <BackgroundColor />
                    <BorderColorComponent />
                    <ImageSize />
                    <FontStyle />
                    <FontWeight />
                    <TextColors />
                    <FontSize />
                </Row>
            </Container>
        </div>
    )
}

export default HelperClass