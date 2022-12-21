import React from 'react';
import classnames from 'classnames';

const LeftPanel = ({ className, ...props }) => (
    <section className={classnames('left-panel responsive', className)}>
        {props.children}
    </section>
);

const RightPanel = ({ className, ...props }) => (
    <section className={classnames('right-panel responsive', className)}>
        {props.children}
    </section>
);

const ContentPanel = ({ className, ...props }) => (
    <section className={classnames('content', className)}>
        {props.children}
    </section>
);

export { LeftPanel, RightPanel, ContentPanel };
