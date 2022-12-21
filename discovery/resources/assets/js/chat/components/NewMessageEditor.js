import React from 'react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

class NewMessageForm extends React.Component {
    constructor(props) {
        super(props);
        this.editorRef = null;
        this.state = {
            message: ''
        };
    }

    onKeyUp = (e) => {
        if(e.key === 'Enter' && e.shiftKey) {
        } else if(e.key === 'Enter') {
            this.sendMessage();
        }
    };

    onMessageChange = (message) => {
        this.setState({message});
    };

    sendMessage = () => {
        let {message} = this.state;
        if(message !== '<p><br></p>') {
            let delta = this.editorRef.getEditor().getContents().ops;
            if (delta.length >= 1 && delta[delta.length - 1]['insert'] && /^[\r\n]+$/.test(delta[delta.length - 1]['insert'])) {
                delta = delta.slice(0, -1);
            }
            if (delta.length) {
                this.props.sendMessage(JSON.stringify(delta));
            }
            this.setState({message: ''});
        }
    };

    componentDidMount() {
        if (this.editorRef) {
            const editor = this.editorRef.getEditor();
                editor.keyboard.addBinding({ key: 'Enter' }, function(range, context) {
                return true;
            });
        }
    }

    render() {
        const {onFocus} = this.props;
        return <div className='new-message-form'>
                <ReactQuill
                    ref={ref => this.editorRef = ref}
                    value={this.state.message}
                    theme="snow"
                    placeholder="Type a message...."
                    modules={{
                        toolbar: [
                            'bold', 'italic', 'underline', 'strike', 'blockquote',
                            {'list': 'ordered'},
                            {'list': 'bullet'}, 'clean'
                        ],

                        keyboard: {
                             bindings: {}
                        }
                    }}
                    formats={[
                        'bold', 'italic', 'underline', 'strike', 'blockquote',
                        'list', 'bullet', 'indent', 'link'
                    ]}

                    onChange={this.onMessageChange}
                    onKeyUp={this.onKeyUp}
                    onFocus={onFocus}
                />
                {/*<i className="landspot-icon paperclip"/>*/}
                {/*<button type='button'*/}
                        {/*className='button send-btn'*/}
                        {/*title='Shift+Enter to send'*/}
                        {/*onClick={this.sendMessage}>Send*/}
                {/*</button>*/}
            </div>;
    }
}

export default NewMessageForm;