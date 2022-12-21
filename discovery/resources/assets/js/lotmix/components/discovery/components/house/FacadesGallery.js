import React from 'react';
import {getImageForMedia} from '~/helpers';
import {HouseContext} from '~/discovery/House';
import {WithStore, CarouselProvider, Slider, Slide, ButtonBack, Dot, ButtonNext} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

const Gallery = ({showCarouselPreview = true, showTitle = true, showFacadeTitle = false}) => (
    <HouseContext.Consumer>
        {
            ({selectedHouse: {facades}}) => (
                <CarouselProvider
                    className='gallery'
                    naturalSlideHeight='2'
                    naturalSlideWidth='4'
                    totalSlides={facades.length}
                >
                    {
                        showFacadeTitle &&
                        <FacadeTitle facades={facades} />
                    }
                    <Slider
                        className='gallery-carousel'
                    >
                        {
                            facades.map((facade, index) =>
                                <Slide key={index}
                                       index={index}
                                >
                                    <div className='slide-item'
                                         style={{
                                             backgroundImage: getImageForMedia(facade.mediumImage, facade.largeImage)
                                         }}>
                                        {
                                            showTitle && <p className="title">{facade.title}</p>
                                        }
                                    </div>
                                </Slide>
                            )
                        }
                    </Slider>
                    {
                        showCarouselPreview &&
                        <div className="gallery-carousel-buttons">
                            {facades.map((facade, index) => <Dot slide={index} key={index} style={{
                                backgroundImage: `url('${facade.thumbImage}')`
                            }}/>)}
                        </div>
                    }
                    <ButtonBack className='button transparent gallery-arrow'><i className="far fa-chevron-left"/></ButtonBack>
                    <ButtonNext className='button transparent gallery-arrow'><i className="far fa-chevron-right"/></ButtonNext>
                </CarouselProvider>
            )
        }
    </HouseContext.Consumer>
);

class FacadeTitleComponent extends React.Component {
    render(){
        const {facades, currentSlide} = this.props;
        return (
            <div className="heading">Facade: {facades[currentSlide].title}</div>
        );
    }
}

const FacadeTitle = WithStore(FacadeTitleComponent,state => ({
    currentSlide : state.currentSlide
}));


export default Gallery;
