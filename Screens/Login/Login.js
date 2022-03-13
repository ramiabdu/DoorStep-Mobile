import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity , ScrollView} from 'react-native';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Login = () => {
  
  // states 

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [hidePassword, setHidePassword] = React.useState(true)
  return (
    
    // this is keyboard avoiding container to avoid keyboard 
    <KeyboardAwareScrollView
      extraHeight={200}
      bounces={false}
      showsVerticalScrollIndicator={false}
      alwaysBounceHorizontal={false}
      alwaysBounceVertical={false}
      contentContainerStyle={{
        flex: 1,
        backgroundColor: 'black'
      }}>
        
        // to make screen scrollable
      <ScrollView
        showsVerticalScrollIndicator={false} alwaysBounceHorizontal={false}
        alwaysBounceVertical={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: 'black'
        }}>

    //container
        <View style={{
          marginHorizontal: '8%',
          marginTop: 80
        }}>
          <Text style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 35,
          }}>Let's sign you in</Text>
          <Text style={{
            color: 'white',
            fontWeight: '300',
            fontSize: 25,
          }}>Welcome back,</Text>
          <Text style={{
            color: 'white',
            fontWeight: '300',
            fontSize: 25,
          }}>You've been missed</Text>

        </View>

        <View style={{ marginHorizontal: '10%', marginTop: 140 }}>
          <View style={styles.textbox}>
            <TextInput
              autoCapitalize={'none'}
              selectionColor={'white'}
              placeholder='authorized email'
              placeholderTextColor={'gray'}
              onChangeText={setEmail}
              style={{
                color: 'white',
                marginLeft: 10,
                width: "90%"
              }} />
          </View>

          <View style={{
            marginBottom: 15,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 12,
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 1
          }}>

            <TextInput
              autoCapitalize={'none'}
              selectionColor={'white'}
              placeholder='authorized password'
              setHidePassword={setHidePassword}
              secureTextEntry={hidePassword}
              placeholderTextColor={'gray'}
              onChangeText={setPassword}
              style={{
                color: 'white',
                marginLeft: 10,
                width: "80%"
              }} />

        //eye button
            <TouchableOpacity style={{
              flex: 1,
              alignItems: 'flex-end',
              marginRight: 15
            }}
              onPress={() => setHidePassword(!hidePassword)}
            >
              {hidePassword &&

                <Image style={{ height: 25, width: 25, tintColor: 'gray' }} source={require('../../assets/icons8-eye-90.png')} />
              }
              {!hidePassword &&
                <Image style={{ height: 23, width: 23, tintColor: 'gray' }} source={require('../../assets/icons8-eye-checked-96.png')} />

              }
            </TouchableOpacity>


          </View>

        </View>

        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          marginHorizontal: '10%',
          marginBottom: 30
        }}>
          <View style={{
            flexDirection: "row"
          }}>
            <Text style={{
              color: 'gray',
            }}>Don't have an account?</Text>
            <TouchableOpacity>
              <Text style={{
                color: 'white'
              }}> Register</Text>
            </TouchableOpacity>

          </View>
          // Sign in Button
          <TouchableOpacity onPress={() => console.log("Login")} style={styles.button}>
            <Text style={styles.btnText}>Sign in</Text>
          </TouchableOpacity>
        </View>



      </ScrollView>
    </KeyboardAwareScrollView>
  );
};

export default Login;

const styles = StyleSheet.create({

  textbox: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1
  },

  textinput: {
    marginLeft: 10,
    width: "80%"
  },
  button: {
    marginTop: 20,
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: 'white',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  btnText: {
    color: 'black',
    fontWeight: 'bold'
  },


})
