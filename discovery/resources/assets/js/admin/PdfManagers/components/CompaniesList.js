import PropTypes from 'prop-types';
import React from 'react';
import {LoadingSpinner, ThumbItem} from '~/helpers';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';

const pluralize = require('pluralize');

const CompaniesList = ({companies, onCompanySelect}) => (
    <Cards>
        {
            companies.map(company =>
                <CardImageItem key={company.id}
                               bgSize='contain'
                               bgImage={`url('${company['company_logo']}')`}
                               onClick={() => onCompanySelect(company.id)}
                               title={company['name']}
                               attrList={<li>{pluralize('User', company['users_count'], true)} Available</li>}
                />
            )
        }
    </Cards>
);


CompaniesList.propTypes = {
    companies: PropTypes.array.isRequired,
    onCompanySelect: PropTypes.func.isRequired,
};

export default CompaniesList;