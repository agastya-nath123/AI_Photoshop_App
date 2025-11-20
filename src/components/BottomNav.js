import { View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LightningIcon from '../../assets/icons/lightning.svg';

export default function BottomNav() {
  return (
    <SafeAreaView edges={['bottom']} style={{
      backgroundColor: '#0d0d0d'
    }}>
        <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#333'
        }}>
      {/*<View style={{
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 14,
      backgroundColor: '#0d0d0d',
      borderTopWidth: 1,
      borderTopColor: '#333'
    }}>*/}
      <TouchableOpacity style={{ alignItems: 'center' }}>
        <LightningIcon width={24} height={24} />
        <Text style={{ color: '#fff', fontSize: 12 }}>Lightning</Text>
      </TouchableOpacity>

      {/* repeat for other tabs */}
        </View>
    </SafeAreaView>
  );
}

