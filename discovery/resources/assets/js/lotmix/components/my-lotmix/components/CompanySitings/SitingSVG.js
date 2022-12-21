import React from 'react';
import {ApiRequest} from '../../../../../axios/api'

class SitingSVG extends React.Component {
    state = {
        content: {__html : ''}
    };
    rootDivRef = React.createRef();

    componentDidMount() {
        this.loadSVG()
    }

    loadSVG(){
        this.setState({
            content: {__html : ''}
        });
        const {url} = this.props;
        if (url){
            ApiRequest('get', url, null, null, null, {
                'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
            })
                .then((content) => {
                    this.setState({
                        content : {__html : content.data}
                    });
                });
        }
    }

    componentDidUpdate(prevProps, prevState, prevContext) {
        if (this.state.content && this.state.content !== prevState.content){
            this.proceedSVG();
        }
        if (this.props.url !== prevProps.url){
            this.loadSVG()
        }
    }

    proceedSVG(){
        const children = this.rootDivRef.current.children;
        const ratio = this.props.ratio; // 1.43 : 0.69

        if (children.length > 0){
            const svg = children[0];
            const bbox = svg.getBBox();
            svg.removeAttribute("width");
            svg.removeAttribute("height");
            svg.setAttribute("viewBox", '0 0 ' + (bbox.width + 35) + " " + (bbox.height + 35));
            for(const child of svg.children){
                if (child.hasAttribute('transform')){
                    const transformData = child.getAttribute('transform');
                    const matrixFind = transformData.match(/matrix\((.*?)\)/);
                    if (matrixFind){
                        let matrixData = matrixFind.pop().split(',');
                        matrixData[4] -= bbox.x;
                        matrixData[5] -= bbox.y;
                        child.setAttribute('transform','matrix(' + matrixData.join(',') + ')');
                    }
                }
                if (child.hasAttribute('x')){
                    child.setAttribute('x', child.getAttribute('x') - bbox.x);
                }
                if (child.hasAttribute('y')) {
                    child.setAttribute('y', child.getAttribute('y') - bbox.y);
                }
            }

            const svgRatio = bbox.width / bbox.height;
            if (svgRatio > ratio){
                svg.style.width = '100%';
                svg.style.height = '';
            } else {
                svg.style.height = '100%';
                svg.style.width = '';
            }
        }
    }



    render() {
        const {content} = this.state;
        return (
            <div className='siting-svg' ref={this.rootDivRef} dangerouslySetInnerHTML={content} />
        );
    }
}

export default SitingSVG;