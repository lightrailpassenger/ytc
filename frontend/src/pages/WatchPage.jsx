import styled from '@emotion/styled';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';

import { useVideo } from '../contexts/VideoInfo.jsx';

const Top = styled.span`
    font-size: 30px;

    > h1 {
        font-size: 30px;
        margin-left: 10px;
        display: inline;
    }
`;

const Video = styled.video`
    width: 100vw;
`;

function WatchPage() {
    const { createdAt } = useParams();
    const video = useVideo(createdAt);

    if (!video) {
        return null;
    }

    const { name } = video;

    return (
        <div>
            <Top>
                <NavLink to="/">{"<"}</NavLink>
                <h1>{name}</h1>
            </Top>
            <Video src={`http://localhost:9000/videos/${encodeURIComponent(createdAt)}`} />
        </div>
    );
}

export default WatchPage;
