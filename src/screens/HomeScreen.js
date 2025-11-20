import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#101010',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20
    }}>

      {/* App Logo (optional) */}
      <Image
        source={require('../../assets/images/logo.png')}
        style={{
          width: 120,
          height: 120,
          marginBottom: 40
        }}
      />

      <Text style={{
        color: 'white',
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 10
      }}>
        AI Relight Prototype
      </Text>

      <Text style={{
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40
      }}>
        Upload a photo and start relighting.
      </Text>

      {/* Go to Editor */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Editor')}
        style={{
          backgroundColor: '#3b82f6',
          paddingVertical: 16,
          paddingHorizontal: 40,
          borderRadius: 12
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '500' }}>
          Start Editing
        </Text>
      </TouchableOpacity>

    </View>
  );
}

