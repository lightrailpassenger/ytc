import styled from '@emotion/styled';
import { Helmet } from 'react-helmet';
import { NavLink } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

const H1 = styled.h1`
    width: 100%;
    text-align: center;
    font-size: 80px;
`;

const Center = styled.div`
    width: 100%;
    text-align: center;

    > a {
        border: 1px solid;
        border-radius: 5px;
        padding: 5px;
        font-size: 20px;
    }
`;

function NotFoundPage() {
    const intl = useIntl();

    return (
        <div>
            <Helmet>
                <title>
                    {intl.formatMessage({ id: 'notFoundPage.head.title' })}
                </title>
            </Helmet>
            <H1>
                <FormattedMessage id="notFoundPage.title" />
            </H1>
            <Center>
                <NavLink to="/">
                    <FormattedMessage id="notFoundPage.backToHome" />
                </NavLink>
            </Center>
        </div>
    );
}

export default NotFoundPage;
