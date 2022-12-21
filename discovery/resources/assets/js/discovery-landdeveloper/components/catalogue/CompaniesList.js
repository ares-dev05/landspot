import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import OptionHeader from './OptionHeader';

class CompaniesList extends React.Component {
    static propTypes = {
        companies: PropTypes.array.isRequired,
        onCompanySelect: PropTypes.func.isRequired,
    };

    render() {
        const {companies} = this.props;
        return (
            <React.Fragment>
                <div className='header'><OptionHeader/></div>
                {
                    companies.length > 0
                        ?
                        <Cards>
                            {
                                companies.map(company =>
                                    <CardImageItem key={company.id}
                                                   bgImage={`url('${company.company_logo}')`}
                                                   bgSize='contain'
                                                   onClick={() => this.props.onCompanySelect(company.id)}
                                                   title={company.name}
                                                   attrList={
                                                       <li>{company['houses_count']} {company['houses_count'] > 1 ? 'Houses' : 'House'} Available</li>
                                                   }
                                    />
                                )
                            }
                        </Cards>

                        : <p>There are no results that match your search</p>

                }

            </React.Fragment>
        );
    }
}

export default connect((state => ({
    companies: state.catalogue.companies
})))(CompaniesList);