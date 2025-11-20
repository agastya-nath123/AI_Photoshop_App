import { View, Image } from 'react-native';

export default function MainImage() {
  return (
    <View style={{
  backgroundColor: '#111',
  marginHorizontal: 16,
  borderRadius: 20,
  overflow: 'hidden',
  padding: 16,
  justifyContent: 'center',
  alignItems: 'center',
  height: 400
}}>      
    <Image
        source={require('../../assets/images/halloween.png')}
        style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
      />
    </View>
  );
}

