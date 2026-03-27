import React from 'react';
import { View, Text } from 'react-native';
import { hubNativeStyles } from './HubModule.native.styles';
import { useHubLogic } from './HubModule.logic';

export const HubModuleAlternative: React.FC = () => {
    const { currentApp } = useHubLogic();
    
    return (
        <View style={hubNativeStyles.container}>
            <Text style={hubNativeStyles.text}>Vianko Banner Studio - Native Mode</Text>
            <Text style={{ color: '#94a3b8', marginTop: 10 }}>Current: {currentApp}</Text>
        </View>
    );
};


