import React from 'react';
import {getImageForMedia} from '~/helpers';
import {HouseContext} from '../../House';
import {CarouselProvider, Slider, Slide, ButtonBack, ButtonNext} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

const Gallery = () => (
    <HouseContext.Consumer>
        {
            ({selectedHouse: {gallery}}) => (
                <CarouselProvider
                    className='gallery'
                    naturalSlideHeight='100%'
                    naturalSlideWidth='100%'
                    isPlaying={true}
                    interval={3000}
                    totalSlides={gallery.length}
                >
                    <Slider
                        className='gallery-carousel'
                    >
                        {
                            gallery.map((image, index) =>
                                <Slide key={index}
                                       index={index}
                                >
                                    <div className='slide-item'
                                         style={{
                                             backgroundImage: getImageForMedia(image.mediumImage, image.largeImage)
                                         }}>
                                    </div>
                                </Slide>
                            )
                        }
                    </Slider>
                    <ButtonBack className='button transparent'><i className="fal fa-chevron-circle-left"/></ButtonBack>
                    <ButtonNext className='button transparent'><i className="fal fa-chevron-circle-right"/></ButtonNext>
                </CarouselProvider>
            )
        }
    </HouseContext.Consumer>
);


export default Gallery;
