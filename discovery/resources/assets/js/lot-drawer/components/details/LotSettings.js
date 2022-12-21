import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {SketchPicker} from 'react-color';
import {LotDrawerContext} from '../../LotDrawerContainer';
import ImageCropper from '~/image-cropper/ImageCropper';
import {clickHandler} from '~/helpers';
import {FormRowDropdown} from '~/helpers/FormRow';
import LotFeaturesModel from '~/sitings-sdk/src/sitings/model/lot/features/LotFeaturesModel';
import EventBase from '~/sitings-sdk/src/events/EventBase';
import CanvasModel, {imageSizes, defaultTheme} from '../drawer/CanvasModel';
import store from '../../store';

class LotSettings extends Component {
    static propTypes = {
        setDrawerData: PropTypes.func.isRequired
    };

    static fontsFamilies = [
        'Arial', 'Helvetica', 'Tahoma',
        'Verdana, sans-serif',
        'Times New Roman, serif',
        'Georgia, serif',
        'Courier, monospace'
    ];

    constructor(props) {
        super(props);

        this.state = {
            activeColorPicker: null,
        };
    }

    componentDidMount() {
        const canvasModel = CanvasModel.getModel();
        canvasModel.lotFeaturesModel.addEventListener(EventBase.ADDED, this.onEasementAdded, this);
        canvasModel.lotFeaturesModel.parallelEasements.addEventListener(EventBase.ADDED, this.onEasementAdded, this);
    }

    componentWillUnmount() {
        const canvasModel = CanvasModel.getModel();
        canvasModel.lotFeaturesModel.removeEventListener(EventBase.ADDED, this.onEasementAdded);
        canvasModel.lotFeaturesModel.parallelEasements.removeEventListener(EventBase.ADDED, this.onEasementAdded);
    }

    componentDidUpdate(prevProps) {
        const {
            drawerData: {theme}
        } = this.props;

        if ((!prevProps.drawerData.theme && theme) || theme === null) {
            const newTheme = {...defaultTheme, ...theme};
            this.updateTheme(newTheme);
        }
    }

    showErrors = (propsErrors = {}) => {
        const {
            alert: {error},
        } = this.props;

        let errors = [];
        typeof propsErrors === 'object'
            ? Object.keys(propsErrors).forEach((error, i) => {
                const column = propsErrors[error];
                errors[i] = {
                    message: `${column.message || column}`,
                };
            })
            : errors.push(propsErrors);

        if (errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
        }
    };

    updateTheme = (theme) => {
        this.setState({theme});
        this.props.setDrawerData({theme});
    };

    addEasement = (type) => {
        const canvasModel = CanvasModel.getModel();
        switch (type) {
            case 'parallel':
                canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_PARALLEL_EASEMENT;
                break;
            case 'block':
                canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_BLOCK_EASEMENT;
                break;
        }

        this.onEasementChange();
    };

    onEasementAdded = (e) => {
        const canvasModel = CanvasModel.getModel();
        if (canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_BLOCK_EASEMENT) {
            console.log('Added Block Easement', e.data);
        } else if (canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_PARALLEL_EASEMENT) {
            console.log('Added Parallel Easement', e.data);
        }

        this.onEasementChange();
    };

    onEasementChange = () => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel        = CanvasModel.getModel();
        const {lotFeaturesModel} = canvasModel;
        const blocks             = lotFeaturesModel.recordState().easements;
        const parallels          = lotFeaturesModel.parallelEasements.recordState().edges;

        setDrawerData({
            easements: {
                blocks, parallels
            }
        });
    };

    onItemChange = (data) => {
        const theme = {...this.props.drawerData.theme, ...data};
        this.updateTheme(theme);
    };

    saveColorValue = (name, color) => {
        const {activeColorPicker} = this.state;
        const {theme: stateTheme} = this.props.drawerData;
        const theme = {
            ...stateTheme, [name]: color
        };

        if (activeColorPicker === 'backgroundColor') {
            theme.uploadedFile = {};
        }

        this.updateTheme(theme);
    };

    setColorPicker = (activeColorPicker) => {
        this.setState({activeColorPicker});
    };

    fileUploaded = ({name, url}) => {
        const theme = {
            ...this.props.drawerData.theme, ...{
                uploadingFile: false,
                uploadedFile: {name, url}
            }
        };
        this.updateTheme(theme);
    };

    fileUploadError = (response) => {
        if (response) {
            this.showErrors(response.errors);
        }
        const theme = {
            ...this.props.drawerData.theme, ...{
                uploadingFile: false, uploadedFile: {}
            }
        };
        this.updateTheme(theme);
    };

    beforeUpload = () => {
        const theme = {...this.props.drawerData.theme, uploadingFile: true};
        this.updateTheme(theme);
    };

    saveAndExport = () => {
        store.dispatch({type: 'EXPORT_LOT_DATA'});
    };

    render() {
        const {
            activeColorPicker
        } = this.state;
        const {drawerData} = this.props;
        const {
            backgroundColor, imageSize: propsImageSize,
            lineThickness, fontType, fontColor, boundaryColor,
            lotBackground, arrowBackgroundColor, arrowColor, fontSize,
            lotLabelFontSize
        } = drawerData.theme || defaultTheme;
        const canvasModel        = CanvasModel.getModel();
        const {lotFeaturesModel} = canvasModel;
        const defaultFont        = LotSettings.fontsFamilies[0];
        const blocks             = lotFeaturesModel.specialEasements;
        const parallels          = lotFeaturesModel.parallelEasements.edges;

        return (
            <div className='lot-settings'>
                <div className='header'>Easements</div>
                <div className="easements">
                    <div className="btn-group">
                        <button type="button"
                                className={classnames('button', canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_PARALLEL_EASEMENT ? 'primary' : 'default')}
                                onClick={() => this.addEasement('parallel')}>
                            <i className="landspot-icon plus"/> Parallel
                        </button>
                        <button type="button"
                                className={classnames('button', canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_BLOCK_EASEMENT ? 'primary' : 'default')}
                                onClick={() => this.addEasement('block')}>
                            <i className="landspot-icon plus"/> Block
                        </button>
                    </div>

                    <div className="easement">
                        <div className="blocks">
                            {
                                [...parallels, ...blocks].map(
                                    (easement, easementIndex) => <Easement key={easementIndex}
                                                                           easement={easement}
                                                                           onEasementChange={this.onEasementChange}
                                    />
                                )
                            }
                        </div>
                    </div>
                </div>

                <div className='header'>Background Color</div>
                <div className="lot-background">
                    <ImageCropper
                        className={'image-cropper'}
                        baseUrl='/upload-image?imageSize=medium'
                        acceptMime='image/*'
                        chooseFileButton={
                            <button type="button" className='button default'
                                    onClick={() => this.addParallel()}>
                                <i className="landspot-icon plus"/> Upload Image
                            </button>
                        }
                        aspectRatio={4 / 3}
                        beforeUpload={this.beforeUpload}
                        uploadError={this.fileUploadError}
                        uploadSuccess={this.fileUploaded}
                    />
                    <span>OR</span>
                    <div className="color-picker">
                        <ColorPicker
                            textLabel=""
                            name="backgroundColor"
                            activeColorPicker={activeColorPicker}
                            value={backgroundColor || '#131313'}
                            saveColorValue={this.saveColorValue}
                            setColorPicker={this.setColorPicker}
                        />
                    </div>
                </div>
                <div className='header'>Lot Aesthetics</div>
                <div className="form-rows">
                    <FormRowDropdown
                        label='Boundary Line'
                        itemClass=""
                        defaultItem={null}
                        items={
                            Array.from(Array(10).keys()).map(
                                lineThickness => ({
                                    text: `${lineThickness + 1}px`,
                                    value: lineThickness + 1
                                })
                            )
                        }
                        onChange={lineThickness => this.onItemChange({lineThickness})}
                        value={lineThickness}
                    />
                    <div className="form-row color-picker">
                        <ColorPicker
                            textLabel="Boundary Color"
                            name="boundaryColor"
                            activeColorPicker={activeColorPicker}
                            value={boundaryColor || '#131313'}
                            saveColorValue={this.saveColorValue}
                            setColorPicker={this.setColorPicker}
                        />
                    </div>
                    <div className="form-row color-picker">
                        <ColorPicker
                            textLabel="Lot Background"
                            name="lotBackground"
                            activeColorPicker={activeColorPicker}
                            value={lotBackground || '#131313'}
                            saveColorValue={this.saveColorValue}
                            setColorPicker={this.setColorPicker}
                        />
                    </div>
                    <FormRowDropdown
                        label='Font type'
                        itemClass="wide"
                        defaultItem={null}
                        items={
                            LotSettings.fontsFamilies.map(
                                item => ({value: item, text: item})
                            )
                        }
                        onChange={fontType => this.onItemChange({fontType})}
                        value={fontType || defaultFont}
                    />
                    <FormRowDropdown
                        label='Font size'
                        itemClass=""
                        defaultItem={null}
                        items={
                            [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36].map(
                                item => ({value: item, text: `${item}px`})
                            )
                        }
                        onChange={fontSize => this.onItemChange({fontSize})}
                        value={fontSize || 12}
                    />
                    <FormRowDropdown
                        label='Lot label font size'
                        itemClass=""
                        defaultItem={null}
                        items={
                            [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36].map(
                                item => ({value: item, text: `${item}px`})
                            )
                        }
                        onChange={lotLabelFontSize => this.onItemChange({lotLabelFontSize})}
                        value={lotLabelFontSize || 12}
                    />
                    <div className="form-row color-picker">
                        <ColorPicker
                            textLabel="Font Color"
                            name="fontColor"
                            activeColorPicker={activeColorPicker}
                            value={fontColor || '#131313'}
                            saveColorValue={this.saveColorValue}
                            setColorPicker={this.setColorPicker}
                        />
                    </div>
                </div>
                <div className='header'>Output settings</div>
                <div className="form-rows">
                    <FormRowDropdown
                        label='Image Size'
                        itemClass="wide"
                        defaultItem={null}
                        items={imageSizes}
                        onChange={imageSize => {
                            if (propsImageSize === imageSize) {
                                return;
                            } else {
                                this.onItemChange({imageSize});
                            }
                        }}
                        value={propsImageSize}
                    />
                </div>
                <div className='header'>North indicator</div>
                <div className="form-rows">
                    <div className="form-row color-picker">
                        <ColorPicker
                            textLabel="Arrow Color"
                            name="arrowColor"
                            activeColorPicker={activeColorPicker}
                            value={arrowColor || '#131313'}
                            saveColorValue={this.saveColorValue}
                            setColorPicker={this.setColorPicker}
                        />
                    </div>
                    <div className="form-row color-picker">
                        <ColorPicker
                            textLabel="Arrow Background Color"
                            name="arrowBackgroundColor"
                            activeColorPicker={activeColorPicker}
                            value={arrowBackgroundColor || '#131313'}
                            saveColorValue={this.saveColorValue}
                            setColorPicker={this.setColorPicker}
                        />
                    </div>
                </div>


                <div className="form-rows">
                    <div className="form-row">
                        <button className="button primary"
                                type="button"
                                onClick={e => {
                                    clickHandler(e, () => this.saveAndExport());
                                }}>
                            Save and export
                        </button>
                    </div>
                </div>
            </div>
        );
    }

}

const Easement = ({easement, onEasementChange}) => {
    const isBlock = easement.flipStart !== undefined;
    return (
        <div className="block">
            <div className="easement-type">
                {isBlock
                    ? 'BLOCK'
                    : 'PARALLEL'}
            </div>

            <div className='easement-dimension'>
                <div className='landspot-input'>
                    <input type='number'
                           autoComplete="off"
                           onChange={(e) => {
                               easement.distance = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                               onEasementChange();
                           }}
                           maxLength={5}
                           placeholder='Meters'
                           value={easement.distance || ''}
                    />
                </div>
                {isBlock &&
                <div className='landspot-input'>
                    <input type='number'
                           autoComplete="off"
                           onChange={(e) => {
                               easement.width = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                               onEasementChange();
                           }}
                           maxLength={5}
                           placeholder='Meters'
                           value={easement.width || ''}
                    />
                </div>
                }
            </div>

            {isBlock &&
            <button type="button" className='button transparent direction'
                    onClick={() => {
                        easement.flipStart = !easement.flipStart;
                        onEasementChange();
                    }}>
                <i className={classnames('landspot-icon boundary-arrow-left', easement.flipStart && 'active')}/>
                <i className={classnames('landspot-icon boundary-arrow-right', !easement.flipStart && 'active')}/>
            </button>
            }

            <button type="button" className='button transparent delete-btn'
                    onClick={() => {
                        isBlock
                            ? easement.deleteEasement()
                            : easement.deleteEdge();
                        onEasementChange();
                    }}>
                <i className='landspot-icon trash'/>
            </button>
        </div>
    );
};

const ColorPicker = ({
                         activeColorPicker,
                         name,
                         saveColorValue,
                         setColorPicker,
                         textLabel,
                         value,
                     }) => {

    return <React.Fragment>
        <label className='left-item'>{textLabel}</label>

        <div className="picker"
             style={{
                 backgroundColor: value
             }}
             onClick={() => setColorPicker(name)}/>
        <div className="landspot-input">
            <input type="text"
                   readOnly
                   value={value}
                   onClick={() => setColorPicker(name)}
            />
        </div>
        {
            activeColorPicker === name &&
            <div className="colorpicker-wrapper">
                <button className="button close transparent"
                        type="button"
                        onClick={e => {
                            clickHandler(e, () => setColorPicker(null));
                        }}>
                    <i className="landspot-icon times"/>
                </button>
                <SketchPicker
                    color={value}
                    disableAlpha={true}
                    onChange={data => saveColorValue(name, data.hex)}
                    onChangeComplete={data => saveColorValue(name, data.hex)}
                />
            </div>
        }
    </React.Fragment>;
};

const LotSettingsConsumer = (props) => (
    <LotDrawerContext.Consumer>
        {
            ({
                 state: {drawerData}, setDrawerData
             }) => <LotSettings  {...props} {...{
                drawerData, setDrawerData
            }}/>
        }
    </LotDrawerContext.Consumer>
);

const LotSettingsInstance = connect((state) => ({
    lotDrawer: state.lotDrawer,
}), null)(LotSettingsConsumer);

export default LotSettingsInstance;