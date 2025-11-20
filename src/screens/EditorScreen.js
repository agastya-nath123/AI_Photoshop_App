
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import TopBar from '../components/TopBar';
import MainImage from '../components/MainImage';
import SidePanel from '../components/SidePanel';
import SlidersPanel from '../components/SlidersPanel';
import BottomNav from '../components/BottomNav';

export default function EditorScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#101010' }}
    >
      {/* Main content */}
      <View style={{ 
        flex: 1, 
        paddingBottom: insets.bottom + 80  // hard space for sliders
      }}>
        <TopBar />
        <MainImage />
        <SidePanel />
        <SlidersPanel />
      </View>

      {/* Bottom bar */}
      <BottomNav />
    </SafeAreaView>  );
}

