import paho.mqtt.client as paho
import paramiko
import json

"""
This subscriber receives and prints the day_ahead prices for th users .
"""

broker  =  "localhost"
topic   = "new"
port    = 1883

def on_connect(client, userdata, flags, rc):
    ''' The callback for when the client connects to the broker. '''
    #print("Connected with result code {0}".format(str(rc)))  # Print result of connection attempt
    #print("")
    return

def on_message(client, userdata, message):
        print("Received data is : \n")
        msg = str(message.payload.decode("utf-8"))
        print(msg)
        client.disconnect()

client = paho.Client("user5") #create client object. Use different client names ex. "user5", if more than one clients are connected to the broker
client.on_connect = on_connect
client.on_message = on_message


client.connect(broker, 1883)#connection establishment with broker

client.subscribe(topic)

client.loop_forever() #continue
