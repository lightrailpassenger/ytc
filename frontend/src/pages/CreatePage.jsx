import {
    useState,
    useRef,
    useCallback,
    useEffect,
} from 'react';
import styled from '@emotion/styled';
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
        setProgress('Loading');

        eventSourceRef.current.onmessage = (message) => {
            const { data } = message;
            const { current, total, end, err } = JSON.parse(data);

            if (err) {
                setIsError(true);
                setProgress(null);
            } else if (end) {
                if (Notification.permission === 'granted') {
                    const notification = new Notification('Video downloaded successfully', {
                        renotify: true,
                        tag: `${end}`,
                        body: `From ${url}`,
                    });

                    setTimeout(() => {
                        notification.close();
                    }, 5000);
                }

                navigate(`/watch/${end}?refetch=1`);
            } else {
                setProgress(`${Math.floor(current / total * 100)}%`); // TODO
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
            <Top>
                <NavLink to="/">{"<"}</NavLink>
                <h1>Create</h1>
            </Top>
            <Form onSubmit={handleSubmit}>
                <fieldset disabled={isLoading}>
                    <input type="text" placeholder="URL" value={url} onChange={handleUrlChange} required />
                    <input type="submit" value="Create" />
                    {isLoading ? <span>{progress}</span> : null}
                </fieldset>
            </Form>
            {isError && <ErrorMessage>An error occurred.</ErrorMessage>}
        </div>
    );
}

export default CreatePage;
