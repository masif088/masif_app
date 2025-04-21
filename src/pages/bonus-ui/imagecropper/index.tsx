import React from 'react'
import Breadcrumbs from '../../../../CommonElements/Breadcrumbs'
import { Container } from 'reactstrap'
import ImageCropperDemo from '@/components_source/Bonus-Ui/ImageCropperDemo'

const ImageCropper = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Image Cropper' mainTitle='Image Cropper' parent='Bonus Ui' />
            <Container fluid={true}>
                <ImageCropperDemo />
            </Container>
        </div>
    )
}

export default ImageCropper