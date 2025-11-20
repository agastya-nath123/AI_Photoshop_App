import { View, Image, TouchableOpacity, Text } from 'react-native';
import UpIcon from '../../assets/icons/up.svg';

export default function SidePanel() {
  return (
    <View style={{
      position: 'absolute',
      right: 20,
      top: 260,     // adjust for image height
      alignItems: 'center',
      zIndex: 10,
    }}>

    <TouchableOpacity
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#2A2A2A', // dark circle behind arrow
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <UpIcon width={40} height={40} />
     </TouchableOpacity>


      <Image
        source={require('../../assets/images/thumb.png')}
        style={{
          width: 60,
          height: 80,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#3b82f6'
        }}
      />

      <View
          style={{
            height: 4,
            width: 60,
            backgroundColor: '#666',
            borderRadius: 2,
            marginTop: 4,
          }}
      />

      <TouchableOpacity style={{
        width: 62,
        height: 62,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
      }}>
        <Text style={{ fontSize: 40, lineHeight: 40 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

