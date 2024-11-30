import { forwardRef, useCallback, useState } from 'react';

import styled from '@emotion/styled';

const Dialog = styled.dialog`
    width: 100%;
    max-width: 40vw;

    > h2 {
        margin-top: 0;
    }

    > form {
        display: flex;
        flex-direction: column;

        > input[type='text'] {
            font-size: 18px;
            margin-bottom: 10px;
        }
    }

    div {
        text-align: right;

        input,
        button {
            margin-left: 5px;
        }
    }
`;

const YesNoTextDialog = forwardRef((props, ref) => {
    const { title, placeholder, cancelText, submitText, onClose } = props;

    const [inputText, setInputText] = useState('');

    const handleDialogClose = useCallback(
        (event) => {
            setInputText('');

            const { returnValue } = event.target;

            if (returnValue === 'cancel') {
                onClose(event);
            } else {
                onClose(event, inputText);
            }
        },
        [inputText]
    );

    // FIXME: Can we capture RETURN key press without setting direction?
    return (
        <Dialog ref={ref} onClose={handleDialogClose}>
            <h2>{title}</h2>
            <form method="dialog">
                <input
                    type="text"
                    required
                    placeholder={placeholder}
                    value={inputText}
                    onChange={(event) => {
                        setInputText(event.target.value);
                    }}
                />
                <div dir="rtl">
                    <input
                        formMethod="dialog"
                        type="submit"
                        value={submitText}
                    />
                    <button formNoValidate formMethod="dialog" value="cancel">
                        {cancelText}
                    </button>
                </div>
            </form>
        </Dialog>
    );
});

YesNoTextDialog.displayName = 'YesNoTextDialog';

export default YesNoTextDialog;
