import React from 'react'
import Breadcrumbs from '../../../../CommonElements/Breadcrumbs'
import { Container, Row } from 'reactstrap'
import BasicAlert from '@/components_source/Bonus-Ui/SweetAlert/BasicAlert'
import TitleWithText from '@/components_source/Bonus-Ui/SweetAlert/TitleWithText'
import InfoAlert from '@/components_source/Bonus-Ui/SweetAlert/InfoAlert'
import WarningAlert from '@/components_source/Bonus-Ui/SweetAlert/WarningAlert'
import PikashuAlert from '@/components_source/Bonus-Ui/SweetAlert/PikashuAlert'
import QuestionAlert from '@/components_source/Bonus-Ui/SweetAlert/QuestionAlert'
import UserNameAlert from '@/components_source/Bonus-Ui/SweetAlert/UserNameAlert'
import SuccessMessage from '@/components_source/Bonus-Ui/SweetAlert/SuccessMessage'
import DangerAlert from '@/components_source/Bonus-Ui/SweetAlert/DangerAlert'
import WarningMode from '@/components_source/Bonus-Ui/SweetAlert/WarningAlert/Warningmode'
import AutoCloseAlert from '@/components_source/Bonus-Ui/SweetAlert/AutoCloseAlert'
import MovieAlert from '@/components_source/Bonus-Ui/SweetAlert/MoviAlert'

const SweetAlert2 = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Sweet Alert' mainTitle='Sweet Alert' parent='Bonus-Ui' />
            <Container fluid={true}>
                <Row>
                    <BasicAlert />
                    <TitleWithText />
                    <InfoAlert />
                    <WarningAlert />
                    <PikashuAlert />
                    <QuestionAlert />
                    <UserNameAlert />
                    <SuccessMessage />
                    <DangerAlert />
                    <WarningMode />
                    <AutoCloseAlert />
                    <MovieAlert />
                </Row>
            </Container>
        </div>
    )
}

export default SweetAlert2