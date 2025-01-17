import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { View } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import { device, texts } from '../../config';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { TextList } from '../TextList';
import { getQuery, QUERY_TYPES } from '../../queries';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';

export const About = ({ navigation, refreshing }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);

  const refreshTime = useRefreshTime('publicJsonFile-homeAbout');

  if (!refreshTime) return null;

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });
  const { sections = {} } = globalSettings;
  const { headlineAbout = texts.homeTitles.about } = sections;

  return (
    <Query
      query={getQuery(QUERY_TYPES.PUBLIC_JSON_FILE)}
      variables={{ name: 'homeAbout' }}
      fetchPolicy={fetchPolicy}
    >
      {({ data, loading, refetch }) => {
        // call the refetch method of Apollo after `refreshing` is given with `true`, which happens
        // when pull to refresh is used in the parent component
        if (refreshing) refetch();
        if (loading) return null;

        let publicJsonFileContent =
          data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

        if (!publicJsonFileContent || !publicJsonFileContent.length) return null;

        return (
          <View>
            {!!headlineAbout && (
              <TitleContainer>
                <Title accessibilityLabel={`${headlineAbout} (Überschrift)`}>{headlineAbout}</Title>
              </TitleContainer>
            )}
            {!!headlineAbout && device.platform === 'ios' && <TitleShadow />}
            <TextList navigation={navigation} data={publicJsonFileContent} noSubtitle />
          </View>
        );
      }}
    </Query>
  );
};

About.propTypes = {
  navigation: PropTypes.object.isRequired,
  refreshing: PropTypes.bool
};

About.defaultProps = {
  refreshing: false
};
