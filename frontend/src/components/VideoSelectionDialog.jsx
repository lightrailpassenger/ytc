import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { useIntl } from 'react-intl';

import styled from '@emotion/styled';
import { produce } from 'immer';

import { useVideoInfo } from '../contexts/VideoInfo.jsx';

const Button = styled.button`
    margin-left: 5px;
`;

const Dialog = styled.dialog`
    width: 80vw;
    height: 80vh;
    max-width: 80vw;
    max-height: 80vh;
`;

const Inner = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    align-item: flex-start;

    overflow: auto;
    flex: 1 1 auto;

    input[type='search'] {
        margin-left: 5px;
        margin-top: 5px;
        width: 70%;
        font-size: 18px;
    }
`;

const List = styled.ol`
    flex: 1 1 0;
    overflow: auto;
`;

const VideoSelectionDialog = forwardRef((props, ref) => {
    const { urlSet, onChoose, ...otherProps } = props;

    const intl = useIntl();

    const [downloadedList] = useVideoInfo();
    const [selectedSet, setSelectedSet] = useState(urlSet);
    const update = useCallback((fn) => {
        setSelectedSet((prevSet) => {
            return produce(prevSet, fn);
        });
    }, []);

    const dialogRef = useRef();

    useImperativeHandle(
        ref,
        () => ({
            showModal: () => {
                setSelectedSet(urlSet);
                dialogRef.current?.showModal();
            },
        }),
        [dialogRef, urlSet]
    );

    const [keyword, setKeyword] = useState('');

    return (
        <Dialog
            ref={dialogRef}
            {...otherProps}
            open={false}
            onClose={(event) => {
                const { returnValue } = event.target;

                if (returnValue === 'cancel') {
                    onChoose(urlSet);
                } else {
                    onChoose(selectedSet);
                }
            }}
        >
            <Inner>
                <h2>
                    {intl.formatMessage({ id: 'videoSelectionDialog.title' })}
                </h2>
                <Form method="dialog">
                    <div>
                        <Button value="cancel" formMethod="dialog">
                            {intl.formatMessage({
                                id: 'videoSelectionDialog.cancel',
                            })}
                        </Button>
                        <Button value="done" type="submit">
                            {intl.formatMessage({
                                id: 'videoSelectionDialog.submit',
                            })}
                        </Button>
                    </div>
                    <div>
                        <input
                            type="search"
                            value={keyword}
                            onChange={(event) => {
                                setKeyword(event.target.value);
                            }}
                            placeholder={intl.formatMessage({
                                id: 'videoSelectionDialog.filter.placeholder',
                            })}
                        />
                    </div>
                    <List>
                        {downloadedList.map(({ url, name }) => {
                            return !keyword || name.indexOf(keyword) > -1 ? (
                                <li key={url}>
                                    <input
                                        type="checkbox"
                                        checked={selectedSet.has(url)}
                                        onChange={(event) => {
                                            if (event.target.checked) {
                                                update((set) => {
                                                    set.add(url);
                                                });
                                            } else {
                                                update((set) => {
                                                    set.delete(url);
                                                });
                                            }
                                        }}
                                    />
                                    <span>{name}</span>
                                </li>
                            ) : null;
                        })}
                    </List>
                </Form>
            </Inner>
        </Dialog>
    );
});

VideoSelectionDialog.displayName = 'VideoSelectionDialog';

export default VideoSelectionDialog;
