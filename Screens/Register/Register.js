import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Register = () => {
  
  
  // states
  const [name, setName] = React.useState("")
  const [surname, setSurname] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [hidePassword, setHidePassword] = React.useState(true)
  return (
    
    // keyboard avoiding wrapper
    <KeyboardAwareScrollView contentContainerStyle={{
      flex: 1,
    }}
      bounces={false}
      alwaysBounceVertical={false}
      extraHeight={200} showsVerticalScrollIndicator={false}>
      <ScrollView showsVerticalScrollIndicator={false} style={{
        flex: 1,
        backgroundColor: 'black'
      }}>

        <View style={{
          marginHorizontal: '8%',
          marginTop: 80
        }}>
          <Text style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 35,
          }}>Let's sign you up</Text>
          <Text style={{
            color: 'white',
            fontWeight: '300',
            fontSize: 25,
          }}>Register yourself,</Text>


        </View>
      
      
        <View style={{ marginHorizontal: '10%', marginTop: 70 }}>
          <View style={styles.textbox}>
            <TextInput
              autoCapitalize={'none'}
              selectionColor={'white'}
              placeholder='valid name'
              placeholderTextColor={'gray'}
              onChangeText={setName}
              style={{
                color: 'white',
                marginLeft: 10,
                width: "90%"
              }} />
          </View>

          <View style={styles.textbox}>
            <TextInput
              autoCapitalize={'none'}
              selectionColor={'white'}
              placeholder='valid surname'
              placeholderTextColor={'gray'}
              onChangeText={setSurname}
              style={{
                color: 'white',
                marginLeft: 10,
                width: "90%"
              }} />
          </View>

          <View style={styles.textbox}>
            <TextInput
              autoCapitalize={'none'}
              selectionColor={'white'}
              placeholder='valid email'
              placeholderTextColor={'gray'}
              onChangeText={setEmail}
              style={{
                color: 'white',
                marginLeft: 10,
                width: "90%"
              }} />
          </View>

          <View style={styles.textbox}>
            <TextInput
              autoCapitalize={'none'}
              selectionColor={'white'}
              placeholder='valid password'
              placeholderTextColor={'gray'}
              setHidePassword={setHidePassword}
              secureTextEntry={hidePassword}
              onChangeText={setPassword}
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
              placeholder='repeat valid password'
              setHidePassword={setHidePassword}
              secureTextEntry={hidePassword}
              placeholderTextColor={'gray'}
              onChangeText={setPassword}
              style={{
                color: 'white',
                marginLeft: 10,
                width: "80%"
              }} />

          // eye buton
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
            }}>Already have an account?</Text>
            <TouchableOpacity>
              <Text style={{
                color: 'white'
              }}> Login</Text>
            </TouchableOpacity>

          </View>
            

        // sign up button
          <TouchableOpacity onPress={() => console.log("Register")} style={styles.button}>
            <Text style={styles.btnText}>Sign up</Text>
          </TouchableOpacity>
        </View>



      </ScrollView>
    </KeyboardAwareScrollView>
  );
};

export default Register;

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
