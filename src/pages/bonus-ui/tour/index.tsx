import React from 'react'
import Breadcrumbs from '../../../../CommonElements/Breadcrumbs'
import { Container, Row } from 'reactstrap'
import { TourProvider } from '@reactour/tour'
import { Toursteps } from 'Data/Bonus-Ui/TourData'
import TourMain from '@/components_source/Bonus-Ui/Tour'
import dynamic from 'next/dynamic'


const Tour = () => {
const TourMain = dynamic(() => import('@/components_source/Bonus-Ui/Tour'), { ssr: false });

    return (
        <div className='page-body'>
            <Breadcrumbs title='Tour' mainTitle='Tour' parent='Bonus-Ui' />
            <Container fluid={true}>
                <div className="user-profile">
                    <Row>
                        <TourProvider
                            steps={Toursteps}
                            disableInteraction={true}
                            disableKeyboardNavigation={false}
                        >
                            <TourMain />
                        </TourProvider>
                    </Row>
                </div>
            </Container>
        </div>
    )
}

export default Tour