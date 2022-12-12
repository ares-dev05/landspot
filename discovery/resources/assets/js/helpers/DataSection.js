import React, {Component} from 'react';
import classnames from 'classnames';
import {LoadingSpinner} from '~/helpers';

class DataSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true
        };
    }

    render = () => {
        const {title, component, isSaving} = this.props;
        const {collapsed} = this.state;
        return (
            <section className={classnames('collapse-section', collapsed ? 'collapsed' : '')}>
                <div className='header'>
                    {title}
                    <button type='button'
                            className='button default'
                            onClick={() => this.setState({collapsed: !collapsed})}>
                        {collapsed ? 'OPEN' : 'CLOSE'}
                    </button>
                </div>
                <div className='body'>
                    {
                        isSaving && <LoadingSpinner className='blocker overlay'/>
                    }
                    {component}
                </div>
            </section>
        );
    };
}

export default DataSection;