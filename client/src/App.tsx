import AuthStack from './navigation/AuthStack';

<NavigationContainer theme={navigationTheme}>
  {isLoading ? (
    <LoadingScreen />
  ) : token ? (
    <AppNavigator />
  ) : (
    <AuthStack />
  )}
</NavigationContainer> 