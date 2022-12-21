import React, {useCallback} from 'react';

const QuestionItem = ({index, handleSelectIndex, selectedFaqIndex, isTablet, answer, question, showForm}) => {
    const handleClick = useCallback(() => handleSelectIndex(index), [index, handleSelectIndex]);

    return (
        <React.Fragment key={index}>
            {showForm
                ? (
                    <React.Fragment>
                        <div
                            onClick={handleClick}
                            className={`question-content ${selectedFaqIndex === index ? 'selected' : ''}`}
                        >
                            <div className='question-text'>
                                {question}
                            </div>
                        </div>
                    </React.Fragment>
                )
                : (
                    <React.Fragment>
                        <div
                            onClick={handleClick}
                            className={`question-content ${selectedFaqIndex === index ? 'selected' : ''}`}
                        >
                            <div className='question-text'>
                                {question}
                            </div>
                            {isTablet && (
                                <i className={`far ${selectedFaqIndex === index ? 'fa-angle-up' : 'fa-angle-down'} carpet`}/>
                            )}
                        </div>
                        {isTablet && selectedFaqIndex === index && (
                            <div className="answer-content">{answer}</div>
                        )}
                    </React.Fragment>
                )

            }
        </React.Fragment>
    );
};

export default QuestionItem;