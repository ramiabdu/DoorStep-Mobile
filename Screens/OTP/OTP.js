import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from "react";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
const CELL_COUNT = 6;

const Login = () => {

    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    return (
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
            <ScrollView
                showsVerticalScrollIndicator={false} alwaysBounceHorizontal={false}
                alwaysBounceVertical={false}
                bounces={false}
                showsVerticalScrollIndicator={false}
                style={{
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
                    }}>Let's verify you</Text>
                    <Text style={{
                        color: 'white',
                        fontWeight: '300',
                        fontSize: 25,
                    }}>Account Verification,</Text>
                    <Text style={{
                        color: 'white',
                        fontWeight: '300',
                        fontSize: 25,
                    }}>Enter 6 digits code</Text>

                </View>



                <View style={{
                    margin: '10%',
                    marginTop: 100
                }}>

                    <CodeField
                        ref={ref}
                        {...props}
                        // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                        maxLength={6}
                        value={value}
                        onChangeText={setValue}
                        cellCount={CELL_COUNT}
                        rootStyle={styles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({ index, symbol, isFocused }) => (
                            <Text
                                key={index}
                                style={[{ color: 'white' }, styles.cell, isFocused && styles.focusCell]}
                                onLayout={getCellOnLayoutHandler(index)}>
                                {symbol || (isFocused ? <Cursor /> : null)}
                            </Text>
                        )}
                    />

                    <Text style={{
                        color: 'gray',
                        marginTop:20
                    }}>A 6 digit code has been send to your account</Text>

                </View>

            </ScrollView>

            <View style={{
                justifyContent: 'flex-end',
                marginHorizontal: '10%',
                marginBottom: 30
            }}>
                <View style={{
                    flexDirection: "row"
                }}>
                    <Text style={{
                        color: 'gray',
                    }}>Didn't get the code?</Text>
                    <TouchableOpacity>
                        <Text style={{
                            color: 'white'
                        }}> Send again</Text>
                    </TouchableOpacity>

                </View>

                <TouchableOpacity onPress={() => console.log("Login")} style={styles.button}>
                    <Text style={styles.btnText}>Confirm</Text>
                </TouchableOpacity>
            </View>
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
    footer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    root: { flex: 1, padding: 20 },
    title: { textAlign: 'center', fontSize: 30 },
    codeFieldRoot: { marginTop: 20 },
    cell: {
        width: 50,
        height: 50,
        lineHeight: 50,
        fontSize: 24,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 10,
        textAlign: 'center',
    },
    focusCell: {
        borderColor: 'gray',
    },


})
