import LeftGrid from '@/components_source/Dashboard/Crypto/LeftGrid'
import Maingrid from '@/components_source/Dashboard/Crypto/MainGrid'
import RightGrid from '@/components_source/Dashboard/Crypto/RightGrid'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'
import { Crypto_text, Dashboard } from 'utils/Constant'

const Crypto = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title={Crypto_text} mainTitle={Crypto_text} parent={Dashboard} />
            <Container fluid={true}>
                <Row>
                    <LeftGrid />
                    <Maingrid />
                    <RightGrid />
                </Row>
            </Container>
        </div>
    )
}

export default Crypto