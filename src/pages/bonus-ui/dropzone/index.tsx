import DefaultDropzone from '@/components_source/Bonus-Ui/Dropzone/DefaultDropzone'
import ImagePreview from '@/components_source/Bonus-Ui/Dropzone/ImagePreview'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import dynamic from 'next/dynamic'
import React from 'react'
import { Container, Row } from 'reactstrap'

const Dropzone = () => {
 const MultiFileUpload = dynamic(() => import("@/components_source/Bonus-Ui/Dropzone/MultiFileUpload"), { ssr: false });
 const SingleFileupload = dynamic(() => import("@/components_source/Bonus-Ui/Dropzone/SingleFileUpload"), { ssr: false });

    return (
        <div className='page-body'>
            <Breadcrumbs title='Dropzone' mainTitle='Dropzone' parent='Bonus Ui' />
            <Container fluid={true}>
                <Row>
                    <DefaultDropzone />
                    <ImagePreview />
                    <SingleFileupload />
                    <MultiFileUpload />
                </Row>
            </Container>
        </div>
    )
}

export default Dropzone