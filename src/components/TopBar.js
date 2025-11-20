import { View, TouchableOpacity } from 'react-native';
import HomeIcon from '../../assets/icons/home.svg';
import UndoIcon from '../../assets/icons/undo.svg';
import RedoIcon from '../../assets/icons/redo.svg';
import MoreIcon from '../../assets/icons/more.svg';


export default function TopBar() {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12
    }}>
      <TouchableOpacity>
        <HomeIcon width={24} height={24} />
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <UndoIcon width={24} height={24} />
        <RedoIcon width={24} height={24} />
        <MoreIcon width={24} height={24} />
      </View>
    </View>
  );
}

