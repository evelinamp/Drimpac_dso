import paho.mqtt.client as paho
import paramiko
import json

broker  =  "localhost"
topic   = "new"
port    = 1883

def on_connect(client, userdata, flags, rc):  # The callback for when the client connects to the broker
    #print("Connected with result code {0}".format(str(rc)))  # Print result of connection attempt
    #print("")
    x = 0
    


def on_message(client, userdata, message):
        #print("Received data is : \n")
        msg = str(message.payload.decode("utf-8"))
        print(msg)
        #print("")
        #convert to json
        client.disconnect()

client = paho.Client("user5") #create client object
client.on_connect = on_connect
client.on_message = on_message

#print("")
#print("Connecting to broker host",broker)
#print("")
client.connect(broker, 1883)#connection establishment with broker
#print("Subscribing begins here")
client.subscribe(topic)
#print("")
#subscribe topic test
client.loop_forever()#contineo
