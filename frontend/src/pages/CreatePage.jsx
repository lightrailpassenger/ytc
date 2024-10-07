import {
    useState,
    useRef,
    useCallback,
    useEffect,
} from 'react';
import styled from '@emotion/styled';
import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { NavLink } from 'react-router-dom';

const Top = styled.span`
    font-size: 50px;

    > h1 {
        font-size: 50px;
        margin-left: 10px;
        display: inline;
    }
`;

const Form = styled.form`
    > fieldset {
        border: none;
        display: flex;
        align-items: baseline;

        > input[type="text"] {
            flex: 1 1 0;
        }

        > input, span {
            font-size: 30px;
            margin-left: 10px;
        }
    }
`;

const ErrorMessage = styled.p`
    font-size: 20px;
    margin-left: 22px;
    color: red;
`;

function CreatePage() {
    const [url, setUrl] = useState('');
    const [progress, setProgress] = useState(null);
    const [isError, setIsError] = useState(false);

    const eventSourceRef = useRef();

    const intl = useIntl();
    const navigate = useNavigate();

    const handleUrlChange = useCallback((event) => {
        setUrl(event.target.value);
        setIsError(false);
    }, []);
    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        eventSourceRef.current = new EventSource(
            `http://localhost:9000/videos?url=${encodeURIComponent(url)}`
        );
        setProgress(intl.formatMessage({ id: 'createPage.loading' }));

        eventSourceRef.current.onmessage = (message) => {
            const { data } = message;
            const { current, total, end, err } = JSON.parse(data);

            if (err) {
                setIsError(true);
                setProgress(null);
            } else if (end) {
                if (Notification.permission === 'granted') {
                    const notification = new Notification(
                        intl.formatMessage({ id: 'createPage.conversionDone.title' }),
                        {
                            renotify: true,
                            tag: `${end}`,
                            body: intl.formatMessage({ id: 'createPage.conversionDone.body' }, { url }),
                        },
                    );

                    setTimeout(() => {
                        notification.close();
                    }, 5000);
                }

                navigate(`/watch/${end}?refetch=1`);
            } else {
                setProgress(intl.formatMessage(
                    { id: 'createPage.progress' },
                    { progress: Math.floor(current / total * 100) },
                ));
            }
        };
    }, [url, navigate]);

    useEffect(() => {
        return () => {
            eventSourceRef.current?.close();
        };
    }, []);

    const isLoading = typeof progress === 'string';

    return (
        <div>
            <Helmet>
                <title>
                    {intl.formatMessage({
                        id: isLoading ? 'createPage.head.loading.title' : 'createPage.head.title'
                    }, { progress })}
                </title>
            </Helmet>
            <Top>
                <NavLink to="/">{"<"}</NavLink>
                <h1>{intl.formatMessage({ id: 'createPage.title' })}</h1>
            </Top>
            <Form onSubmit={handleSubmit}>
                <fieldset disabled={isLoading}>
                    <input
                        type="text"
                        placeholder={intl.formatMessage({ id: 'createPage.input.placeholder' })}
                        value={url}
                        onChange={handleUrlChange}
                        required
                    />
                    <input type="submit" value={intl.formatMessage({ id: 'createPage.submit' })} />
                    {isLoading ? <span>{progress}</span> : null}
                </fieldset>
            </Form>
            {isError && <ErrorMessage>
                {intl.formatMessage({ id: 'createPage.error' })}</ErrorMessage>
            }
        </div>
    );
}

export default CreatePage;
