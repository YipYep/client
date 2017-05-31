import React, { Component } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  AsyncStorage
} from 'react-native';

import { Button, Icon } from 'react-native-elements'
import PostsListView from '../components/PostsListView';


class HerdScreen extends Component {

  static navigationOptions = ({ navigation, screenProps }) => ({
    title: 'Herd',
    headerRight: navigation.state.params && navigation.state.params.headerRight ? navigation.state.params.headerRight: '',
  })


  constructor(props) {
    super(props);

    this.state = {
      herdSet: false,
      lat: 0,
      long: 0,
    };

    this.clearStoragePressed = this.clearStoragePressed.bind(this);
  }

  componentWillMount() {

    this.props.navigation.setParams({
      headerRight: <Icon type='font-awesome'
        name='minus-square'
        color='#6C56BA'
        size={25}
        onPress={this.clearStoragePressed}
        style={{ marginRight: 10, padding: 5}}
      />
    })

    this.retrieveLocation((lat,long, err) => {
      if (lat && long) {
        this.setState({
          herdSet: true,
          lat,
          long
        });
      }
    })
  }

  setHerdPressed() {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        this.saveLocation(p.coords.latitude, p.coords.longitude, (lat, long, err) => {
          if (err) {
            // console.log('Could not save location');
          } else {
            // console.log('Saved location!');
            this.setState({
              herdSet: true,
              lat,
              long
            })
          }
        });
      }
    )
  }

  async retrieveLocation(callback) {
    try {
      const savedLong = await AsyncStorage.getItem('@HerdLong:key');
      const savedLat = await AsyncStorage.getItem('@HerdLat:key');
      if (savedLat !== null && savedLong !== null) {
        callback(savedLat, savedLong, null)
      }
    } catch (error) {
      callback(null, null, error);
    }
  }

  async saveLocation(lat,long, callback) {
    try {
      await AsyncStorage.setItem('@HerdLat:key', lat.toString());
      await AsyncStorage.setItem('@HerdLong:key', long.toString());
      callback(lat, long, null)
    } catch (error) {
      console.log('Count not save key');
      callback(error);
    }
  }


  clearStoragePressed() {

    // console.log('About to clear storage');
    this.clearStorage((err) => {
      if (!err) {
        // console.log('setting to false');
        this.setState({ herdSet: false});
      } else {
        // console.log(err);
      }
    })
  }

  async clearStorage(callback) {
    try {
      await AsyncStorage.removeItem('@HerdLat:key');
      await AsyncStorage.removeItem('@HerdLong:key')
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  render() {

    const herdNotSavedView = (
      <View style={styles.saveLocationView}>
        <Image
          source={{uri: 'https://i.imgur.com/424SJFg.png'}}
          style={styles.loadImg}/>
        <Text style={styles.text}> You have not set your Herd yet! </Text>
        <Button
          raised
          icon={{name: 'map'}}
          borderRadius={60}
          title='Save this location!'
          backgroundColor='red'
          fontFamily='Gill Sans'
          fontSize={20}
          buttonStyle={styles.button}
          containerViewStyle={{backgroundColor: 'transparent'}}
          onPress={() => this.setHerdPressed()}
           />
      </View>
    )

    const floatLat = Number(this.state.lat);
    const floatLong = Number(this.state.long);
    // console.log('location herd', floatLat, floatLong);
    const herdListView = (
      <View style={styles.container}>
        <PostsListView
          navigation={this.props.navigation}
          long={floatLong}
          lat={floatLat}/>
      </View>
    )

    if (this.state.herdSet) {
      return herdListView;
    } else {
      return herdNotSavedView;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F9',
  },
  saveLocationView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F9',
  },
  loadImg: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    shadowColor: '#291D56',
    shadowOffset: {height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  text: {
    fontFamily: 'Gill Sans',
    fontSize: 18,
    color: '#6C56BA',
  },
  button: {
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 35,
    backgroundColor: '#6C56BA',
  }
});

export default HerdScreen;
