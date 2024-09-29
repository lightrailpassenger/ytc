import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';

import { useVideoInfo } from '../contexts/VideoInfo.jsx';

const H1 = styled.h1`
    font-size: 50px;
`;

const Item = styled.div`
    font-size: 20px;
    border-radius: 10px;
    margin: 5px;
    padding: 10px;
    width: 80%;
    max-width: 640px;
    background-color: white;
`;

const CreateItem = styled(Item)`width: auto; display: inline-block`;

function HomePage() {
    const [downloadedList] = useVideoInfo();

    return (
        <div>
            <H1>Videos</H1>
            {downloadedList && <CreateItem key="create">
                <NavLink to="/create">Create</NavLink>
            </CreateItem>}
            {downloadedList?.map(({ url, createdAt, name }) => (
                <Item key={url}>
                <NavLink to={`/watch/${encodeURIComponent(createdAt)}`}>
                {name}
                </NavLink>
                </Item>
            ))}
        </div>
    );
}

export default HomePage;
