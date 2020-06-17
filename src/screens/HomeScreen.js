import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';
import _filter from 'lodash/filter';
import _take from 'lodash/take';
import _shuffle from 'lodash/shuffle';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, device, normalize, texts } from '../config';
import {
  BoldText,
  Button,
  CardList,
  DiagonalGradient,
  Image,
  ImagesCarousel,
  LoadingContainer,
  SafeAreaViewFlex,
  ServiceBox,
  TextList,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  VersionNumber,
  Wrapper,
  WrapperWrap
} from '../components';
import { getQuery } from '../queries';
import {
  eventDate,
  graphqlFetchPolicy,
  isUpcomingEvent,
  mainImageOfMediaContents,
  momentFormat,
  shareMessage
} from '../helpers';

export class HomeScreen extends React.PureComponent {
  static contextType = NetworkContext;

  componentDidMount() {
    const isConnected = this.context.isConnected;

    isConnected && auth();
  }

  render() {
    const { navigation } = this.props;
    const isConnected = this.context.isConnected;
    const fetchPolicy = graphqlFetchPolicy(isConnected);
    const showNews = true;
    const showPointsOfInterestAndTours = true;
    const showEvents = true;

    return (
      <SafeAreaViewFlex>
        <ScrollView>
          <Query
            query={getQuery('publicJsonFile')}
            variables={{ name: 'homeCarousel' }}
            fetchPolicy={fetchPolicy}
          >
            {({ data, loading }) => {
              if (loading) {
                return (
                  <LoadingContainer>
                    <ActivityIndicator color={colors.accent} />
                  </LoadingContainer>
                );
              }

              let carouselImages =
                data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

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

          {showNews && (
            <TitleContainer>
              <Touchable
                onPress={() =>
                  navigation.navigate({
                    routeName: 'Index',
                    params: {
                      title: 'Nachrichten',
                      query: 'newsItems',
                      queryVariables: {},
                      rootRouteName: 'NewsItems'
                    }
                  })
                }
              >
                <Title>{texts.homeTitles.news}</Title>
              </Touchable>
            </TitleContainer>
          )}
          {showNews && device.platform === 'ios' && <TitleShadow />}
          {showNews && (
            <Query query={getQuery('newsItems')} variables={{ limit: 3 }} fetchPolicy={fetchPolicy}>
              {({ data, loading }) => {
                if (loading) {
                  return (
                    <LoadingContainer>
                      <ActivityIndicator color={colors.accent} />
                    </LoadingContainer>
                  );
                }

                const newsItems =
                  data &&
                  data.newsItems &&
                  data.newsItems.map((newsItem, index) => ({
                    id: newsItem.id,
                    subtitle: `${momentFormat(newsItem.publishedAt)} | ${
                      !!newsItem.dataProvider && newsItem.dataProvider.name
                    }`,
                    title:
                      !!newsItem.contentBlocks &&
                      !!newsItem.contentBlocks.length &&
                      newsItem.contentBlocks[0].title,
                    routeName: 'Detail',
                    params: {
                      title: 'Nachricht',
                      query: 'newsItem',
                      queryVariables: { id: `${newsItem.id}` },
                      rootRouteName: 'NewsItems',
                      shareContent: {
                        message: shareMessage(newsItem, 'newsItem')
                      },
                      details: newsItem
                    },
                    bottomDivider: index !== data.newsItems.length - 1,
                    __typename: newsItem.__typename
                  }));

                if (!newsItems || !newsItems.length) return null;

                return (
                  <View>
                    <TextList navigation={navigation} data={newsItems} />

                    <Wrapper>
                      <Button
                        title="Alle Nachrichten anzeigen"
                        onPress={() =>
                          navigation.navigate({
                            routeName: 'Index',
                            params: {
                              title: 'Nachrichten',
                              query: 'newsItems',
                              queryVariables: {},
                              rootRouteName: 'NewsItems'
                            }
                          })
                        }
                      />
                    </Wrapper>
                  </View>
                );
              }}
            </Query>
          )}

          {showPointsOfInterestAndTours && (
            <TitleContainer>
              <Touchable
                onPress={() =>
                  navigation.navigate({
                    routeName: 'Index',
                    params: {
                      title: 'Touren und Orte',
                      query: 'categories',
                      queryVariables: {},
                      rootRouteName: 'PointsOfInterestAndTours'
                    }
                  })
                }
              >
                <Title>{texts.homeTitles.pointsOfInterest}</Title>
              </Touchable>
            </TitleContainer>
          )}
          {showPointsOfInterestAndTours && device.platform === 'ios' && <TitleShadow />}
          {showPointsOfInterestAndTours && (
            <Query
              query={getQuery('pointsOfInterestAndTours')}
              variables={{ limit: 10, orderPoi: 'RAND', orderTour: 'RAND' }}
              fetchPolicy={fetchPolicy}
            >
              {({ data, loading }) => {
                if (loading) {
                  return (
                    <LoadingContainer>
                      <ActivityIndicator color={colors.accent} />
                    </LoadingContainer>
                  );
                }

                const pointsOfInterest =
                  data &&
                  data.pointsOfInterest &&
                  data.pointsOfInterest.map((pointOfInterest) => ({
                    id: pointOfInterest.id,
                    name: pointOfInterest.name,
                    category: !!pointOfInterest.category && pointOfInterest.category.name,
                    image: mainImageOfMediaContents(pointOfInterest.mediaContents),
                    routeName: 'Detail',
                    params: {
                      title: 'Ort',
                      query: 'pointOfInterest',
                      queryVariables: { id: `${pointOfInterest.id}` },
                      rootRouteName: 'PointsOfInterest',
                      shareContent: {
                        message: shareMessage(pointOfInterest, 'pointOfInterest')
                      },
                      details: pointOfInterest
                    },
                    __typename: pointOfInterest.__typename
                  }));

                const tours =
                  data &&
                  data.tours &&
                  data.tours.map((tour) => ({
                    id: tour.id,
                    name: tour.name,
                    category: !!tour.category && tour.category.name,
                    image: mainImageOfMediaContents(tour.mediaContents),
                    routeName: 'Detail',
                    params: {
                      title: 'Touren',
                      query: 'tour',
                      queryVariables: { id: `${tour.id}` },
                      rootRouteName: 'Tours',
                      shareContent: {
                        message: shareMessage(tour, 'tour')
                      },
                      details: tour
                    },
                    __typename: tour.__typename
                  }));

                return (
                  <View>
                    <CardList
                      navigation={navigation}
                      data={_shuffle([...(pointsOfInterest || []), ...(tours || [])])}
                      horizontal
                    />

                    <Wrapper>
                      <Button
                        title="Alle Touren und Orte anzeigen"
                        onPress={() =>
                          navigation.navigate({
                            routeName: 'Index',
                            params: {
                              title: 'Touren und Orte',
                              query: 'categories',
                              queryVariables: {},
                              rootRouteName: 'PointsOfInterestAndTours'
                            }
                          })
                        }
                      />
                    </Wrapper>
                  </View>
                );
              }}
            </Query>
          )}

          {showEvents && (
            <TitleContainer>
              <Touchable
                onPress={() =>
                  navigation.navigate({
                    routeName: 'Index',
                    params: {
                      title: 'Veranstaltungen',
                      query: 'eventRecords',
                      queryVariables: { order: 'listDate_ASC' },
                      rootRouteName: 'EventRecords'
                    }
                  })
                }
              >
                <Title>{texts.homeTitles.events}</Title>
              </Touchable>
            </TitleContainer>
          )}
          {showEvents && device.platform === 'ios' && <TitleShadow />}
          {showEvents && (
            <Query
              query={getQuery('eventRecords')}
              variables={{ order: 'listDate_ASC' }}
              fetchPolicy={fetchPolicy}
            >
              {({ data, loading }) => {
                if (loading) {
                  return (
                    <LoadingContainer>
                      <ActivityIndicator color={colors.accent} />
                    </LoadingContainer>
                  );
                }

                const upcomingEventRecords =
                  data &&
                  data.eventRecords &&
                  _filter(data.eventRecords, (eventRecord) =>
                    isUpcomingEvent(eventRecord.listDate)
                  );

                if (!upcomingEventRecords || !upcomingEventRecords.length) return null;

                const eventRecords = _take(upcomingEventRecords, 3).map((eventRecord, index) => ({
                  id: eventRecord.id,
                  subtitle: `${eventDate(eventRecord.listDate)} | ${
                    !!eventRecord.addresses &&
                    !!eventRecord.addresses.length &&
                    (eventRecord.addresses[0].addition || eventRecord.addresses[0].city)
                  }`,
                  title: eventRecord.title,
                  routeName: 'Detail',
                  params: {
                    title: 'Veranstaltung',
                    query: 'eventRecord',
                    queryVariables: { id: `${eventRecord.id}` },
                    rootRouteName: 'EventRecords',
                    shareContent: {
                      message: shareMessage(eventRecord, 'eventRecord')
                    },
                    details: eventRecord
                  },
                  bottomDivider: index !== data.eventRecords.length - 1,
                  __typename: eventRecord.__typename
                }));

                if (!eventRecords || !eventRecords.length) return null;

                return (
                  <View>
                    <TextList navigation={navigation} data={eventRecords} />

                    <Wrapper>
                      <Button
                        title="Alle Veranstaltungen anzeigen"
                        onPress={() =>
                          navigation.navigate({
                            routeName: 'Index',
                            params: {
                              title: 'Veranstaltungen',
                              query: 'eventRecords',
                              queryVariables: { order: 'listDate_ASC' },
                              rootRouteName: 'EventRecords'
                            }
                          })
                        }
                      />
                    </Wrapper>
                  </View>
                );
              }}
            </Query>
          )}

          <Query
            query={getQuery('publicJsonFile')}
            variables={{ name: 'homeService' }}
            fetchPolicy={fetchPolicy}
          >
            {({ data, loading }) => {
              if (loading) return null;

              let publicJsonFileContent =
                data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

              if (!publicJsonFileContent || !publicJsonFileContent.length) return null;

              return (
                <View>
                  <TitleContainer>
                    <Title>{texts.homeTitles.service}</Title>
                  </TitleContainer>
                  {device.platform === 'ios' && <TitleShadow />}
                  <DiagonalGradient style={{ padding: normalize(14) }}>
                    <WrapperWrap>
                      {publicJsonFileContent.map((item, index) => {
                        return (
                          <ServiceBox key={index + item.title}>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate({
                                  routeName: item.routeName,
                                  params: item.params
                                })
                              }
                            >
                              <View>
                                <Image
                                  source={{ uri: item.icon }}
                                  style={styles.serviceImage}
                                  PlaceholderContent={null}
                                />
                                <BoldText small lightest>
                                  {item.title}
                                </BoldText>
                              </View>
                            </TouchableOpacity>
                          </ServiceBox>
                        );
                      })}
                    </WrapperWrap>
                  </DiagonalGradient>
                </View>
              );
            }}
          </Query>

          <Query
            query={getQuery('publicJsonFile')}
            variables={{ name: 'homeAbout' }}
            fetchPolicy={fetchPolicy}
          >
            {({ data, loading }) => {
              if (loading) return null;

              let publicJsonFileContent =
                data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

              if (!publicJsonFileContent || !publicJsonFileContent.length) return null;

              return (
                <View>
                  <TitleContainer>
                    <Title>{texts.homeTitles.about}</Title>
                  </TitleContainer>
                  {device.platform === 'ios' && <TitleShadow />}
                  <TextList navigation={navigation} data={publicJsonFileContent} noSubtitle />
                </View>
              );
            }}
          </Query>
          <VersionNumber />
        </ScrollView>
      </SafeAreaViewFlex>
    );
  }
}

const styles = StyleSheet.create({
  serviceImage: {
    alignSelf: 'center',
    height: normalize(40),
    marginBottom: normalize(7),
    resizeMode: 'contain',
    width: '100%'
  }
});

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
