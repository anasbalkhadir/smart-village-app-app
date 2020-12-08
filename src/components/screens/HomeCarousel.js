import _shuffle from 'lodash/shuffle';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Query } from 'react-apollo';
import { ActivityIndicator } from 'react-native';

import { colors } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ImagesCarousel } from '../ImagesCarousel';
import { LoadingContainer } from '../LoadingContainer';

export const HomeCarousel = ({ navigation, refreshing }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const refreshTime = useRefreshTime('publicJsonFile-homeCarousel');

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

  return (
    <Query
      query={getQuery(QUERY_TYPES.PUBLIC_JSON_FILE)}
      variables={{ name: 'homeCarousel' }}
      fetchPolicy={fetchPolicy}
    >
      {({ data, loading, refetch }) => {
        // call the refetch method of Apollo after `refreshing` is given with `true`, which happens
        // when pull to refresh is used in the parent component
        if (refreshing) refetch();
        if (loading) {
          return (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          );
        }

        let carouselImages = data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

        if (!carouselImages) return null;

        return (
          <ImagesCarousel
            navigation={navigation}
            data={_shuffle(carouselImages)}
            fetchPolicy={fetchPolicy}
          />
        );
      }}
    </Query>
  );
};

HomeCarousel.propTypes = {
  navigation: PropTypes.object.isRequired,
  refreshing: PropTypes.bool
};

HomeCarousel.defaultProps = {
  refreshing: false
};
