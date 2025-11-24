import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';

export default function SlidersPanel({ zValue, onZChange }) {
  return (
    <View style={{ marginHorizontal: 20, marginTop: 20 }}>

        <Text style={{ color: '#fff', marginBottom: 8 }}>Z-coordinate: {zValue}</Text>
          
        <Slider
            minimumValue={0}
            maximumValue={100}
            value={zValue}
            onValueChange={onZChange}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#444"
            thumbTintColor="#3b82f6"
        />

        <Text style={{ color: '#fff', marginBottom: 8 }}>Intensity</Text>
          
        <Slider
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#444"
            thumbTintColor="#3b82f6"
        />

        <Text style={{ color: '#fff', marginTop: 20, marginBottom: 8 }}>Hue</Text>

        {/* WRAPPER WITH MATCHED HEIGHT */}
        <View style={{ height: 24, justifyContent: 'center' }}>
          
          {/* GRADIENT BAR */}
          <View style={{
            height: 8,
            borderRadius: 4,
            overflow: 'hidden',
            marginHorizontal: 2
          }}>
            <LinearGradient
              colors={[
                'red',
                'yellow',
                'green',
                'cyan',
                'blue',
                'magenta',
                'red'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </View>

          {/* SLIDER PERFECTLY CENTERED */}
          <Slider
            minimumValue={0}
            maximumValue={360}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor="#fff"
            style={{
              position: 'absolute',
              left: -10,
              right: -10,
              height: 24,     // MATCH WRAPPER HEIGHT
            }}
          />

        </View>
           

    </View>
  );
}

