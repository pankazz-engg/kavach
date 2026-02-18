import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ReportScreen from '../screens/ReportScreen';
import AlertsScreen from '../screens/AlertsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { backgroundColor: '#111827', borderTopColor: '#1f2937' },
                    tabBarActiveTintColor: '#3b82f6',
                    tabBarInactiveTintColor: '#6b7280',
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeStack}
                    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>🏠</Text> }}
                />
                <Tab.Screen
                    name="Report"
                    component={ReportScreen}
                    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>📝</Text> }}
                />
                <Tab.Screen
                    name="Alerts"
                    component={AlertsScreen}
                    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>🔔</Text> }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
