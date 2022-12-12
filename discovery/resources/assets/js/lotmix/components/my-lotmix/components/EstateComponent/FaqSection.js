import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import {isNull} from 'lodash';
import useWindowDimensions from '~/helpers/hooks/useWindowDimensions';
import QuestionItem from './QuestionItem';

const initFaq = [
    {
        question_name: 'Which local council is estate in?',
        answer: ''
    },
    {
        question_name: 'Who is the developer for estate?',
        answer: ''
    },
    {
        question_name: 'How many lots make up estate?',
        answer: ''
    },
    {
        question_name: 'What is the closest display home village to estate?',
        answer: ''
    }
];

const FaqSection = ({estate: {estate_faq = [], name = '', id = 1}, updateAnswers, headerText, showForm}) => {
    const {width} = useWindowDimensions();
    const isTablet = width <= 1000;
    const [faqState, setFaqState] = useState(estate_faq.length ? estate_faq : initFaq);
    const [selectedFaqIndex, setSelectedFaqIndex] = useState(isTablet ? null : 0);
    const handleClick = useCallback(() => updateAnswers(faqState, {id}), [faqState, id, updateAnswers]);
    const answer = !isNull(selectedFaqIndex) ? faqState[selectedFaqIndex].answer : '';

    const updateFaqState = e => {
        setFaqState(faqState.map((item, i) =>
            i === selectedFaqIndex
                ? {...item, answer: e.target.value}
                : item
        ));
    };

    const handleSelectIndex = (i) => {
        setSelectedFaqIndex(isTablet
            ? selectedFaqIndex === i ? null : i
            : i
        );
    };

    return (
        <div className="estate-faq">
            <h2 className="home-h1 dots-top-left">{name + ' ' + headerText}</h2>
            <div className="faq-section">
                <div className="faq-questions">
                    <h3 className="subtitle">Questions</h3>
                    <div className="question-area">
                        {faqState.map((item, i) =>
                            <QuestionItem
                                key={i}
                                index={i}
                                handleSelectIndex={handleSelectIndex}
                                selectedFaqIndex={selectedFaqIndex}
                                isTablet={width <= 1000}
                                answer={answer}
                                question={item.question_name.replace('estate', name + ' estate')}
                                showForm={showForm}
                            />
                        )}
                    </div>
                </div>
                <div className="faq-answer">
                    <h3 className="subtitle">Answer</h3>
                    {showForm
                        ? (
                            <textarea
                                className='answer-textarea'
                                value={answer}
                                cols="30"
                                maxLength="1000"
                                onChange={e => updateFaqState(e)}
                                rows="9"
                                placeholder="Answer here"
                            />
                        )
                        : (
                            <React.Fragment>
                                {!isTablet && (
                                    <div
                                        className="answer-content">{answer}</div>
                                )}
                            </React.Fragment>
                        )
                    }
                </div>
            </div>
            {showForm && (
                <button
                    className="button primary"
                    onClick={handleClick}
                >
                    Update FAQ
                </button>
            )}
        </div>
    );
};

FaqSection.propTypes = {
    estate: PropTypes.object.isRequired,
    updateAnswer: PropTypes.func,
    showForm: PropTypes.bool
};
FaqSection.defaultProps = {
    updateAnswer: () => {
    },
    headerText: 'Estate Frequently Asked Questions',
};

export default FaqSection;
